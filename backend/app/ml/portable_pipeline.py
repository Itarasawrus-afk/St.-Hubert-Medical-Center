"""
St. Hubert Medical Center
Portable XGBoost Inference V2

Research and technical demonstration only.

This module restores fitted preprocessing and native
XGBoost models without deserializing an XGBoost pickle.

The subsequent-visit outcome is a proxy, not a validated
clinical readmission prediction.

Not approved for clinical decisions or operational alerts.
"""

import hashlib
import json
import importlib.metadata as metadata

from pathlib import Path

import numpy as np
import pandas as pd
import joblib
import xgboost as xgb

from sklearn.utils.validation import check_is_fitted


RESEARCH_ONLY = True
CLINICAL_DEPLOYMENT_APPROVED = False
OPERATIONAL_ALERTS_APPROVED = False


def sha256_file(path):

    digest = hashlib.sha256()

    with Path(path).open("rb") as file:

        for chunk in iter(
            lambda: file.read(1024 * 1024),
            b""
        ):
            digest.update(chunk)

    return digest.hexdigest()


def verify_file_hash(path, expected_hash):

    path = Path(path)

    if not path.is_file():
        raise FileNotFoundError(path)

    actual_hash = sha256_file(path)

    if actual_hash != expected_hash:

        raise ValueError(
            f"SHA-256 mismatch: {path.name}"
        )


class PortableXGBoostPipeline:

    VALID_TASKS = {
        "los",
        "subsequent_visit"
    }

    VALID_FORMATS = {
        "json",
        "ubj"
    }

    def __init__(
        self,
        package_root,
        task,
        model_format="ubj"
    ):

        if task not in self.VALID_TASKS:
            raise ValueError(
                f"Unsupported task: {task}"
            )

        if model_format not in self.VALID_FORMATS:
            raise ValueError(
                f"Unsupported format: {model_format}"
            )

        self.package_root = Path(
            package_root
        ).resolve()

        self.task = task
        self.model_format = model_format

        self.task_directory = (
            self.package_root / task
        )

        configuration_path = (
            self.task_directory
            / "model_config.json"
        )

        self.config = json.loads(
            configuration_path.read_text(
                encoding="utf-8"
            )
        )

        if self.config["task"] != task:
            raise ValueError(
                "Model configuration task mismatch."
            )

        self._verify_dependencies()

        self.feature_names_in_ = np.asarray(
            self.config["input_features"],
            dtype=object
        )

        self.n_features_in_ = len(
            self.feature_names_in_
        )

        self.frozen_threshold = self.config[
            "frozen_experimental_threshold"
        ]

        preprocessor_path = (
            self.task_directory
            / self.config["preprocessor_file"]
        )

        model_path = (
            self.task_directory
            / self.config["native_model_files"][
                model_format
            ]
        )

        # Verify trusted package artifacts before loading.
        verify_file_hash(
            preprocessor_path,
            self.config["preprocessor_sha256"]
        )

        verify_file_hash(
            model_path,
            self.config["native_model_sha256"][
                model_format
            ]
        )

        # Only the fitted scikit-learn preprocessor
        # is deserialized through joblib.

        self.preprocessor = joblib.load(
            preprocessor_path
        )

        check_is_fitted(self.preprocessor)

        if task == "los":

            self.model = xgb.XGBRegressor(
                device="cpu",
                missing=np.nan
            )

        else:

            self.model = xgb.XGBClassifier(
                device="cpu",
                missing=np.nan
            )

        # Native XGBoost loading.
        # No XGBoost joblib/pickle deserialization.

        self.model.load_model(
            str(model_path)
        )

        self.model.set_params(
            device="cpu",
            missing=np.nan
        )

        check_is_fitted(self.model)

        self._verify_loaded_components()

        if task == "subsequent_visit":

            self.classes_ = np.asarray(
                self.model.classes_
            )

    def _verify_dependencies(self):

        mismatches = []

        for package, expected in (
            self.config["required_versions"].items()
        ):

            try:

                installed = metadata.version(
                    package
                )

            except metadata.PackageNotFoundError:

                installed = "NOT INSTALLED"

            if installed != expected:

                mismatches.append(
                    f"{package}: installed={installed}, "
                    f"required={expected}"
                )

        if mismatches:

            raise RuntimeError(
                "Dependency version mismatch:\n"
                + "\n".join(mismatches)
            )

    def _verify_loaded_components(self):

        expected_features = list(
            self.feature_names_in_
        )

        actual_features = list(
            self.preprocessor.feature_names_in_
        )

        if actual_features != expected_features:

            raise ValueError(
                "Input feature contract mismatch."
            )

        actual_transformed_features = list(
            self.preprocessor.get_feature_names_out()
        )

        if actual_transformed_features != (
            self.config["transformed_features"]
        ):

            raise ValueError(
                "Transformed feature contract mismatch."
            )

        booster = self.model.get_booster()

        if booster.num_features() != (
            self.config["transformed_feature_count"]
        ):

            raise ValueError(
                "Booster feature count mismatch."
            )

        if booster.num_boosted_rounds() != (
            self.config["boosting_rounds"]
        ):

            raise ValueError(
                "Boosting round mismatch."
            )

        objective = json.loads(
            booster.save_config()
        )["learner"]["objective"]["name"]

        if objective != self.config["objective"]:

            raise ValueError(
                "Booster objective mismatch."
            )

        if booster.attributes().get(
            "best_iteration"
        ) != self.config["best_iteration"]:

            raise ValueError(
                "Best iteration mismatch."
            )

        if self.task == "subsequent_visit":

            if list(self.model.classes_) != (
                self.config["class_order"]
            ):

                raise ValueError(
                    "Classification class order mismatch."
                )

    def _validate_input(self, X):

        if not isinstance(X, pd.DataFrame):

            raise TypeError(
                "Input must be a pandas DataFrame."
            )

        if X.empty:

            raise ValueError(
                "Input must contain at least one record."
            )

        if X.columns.duplicated().any():

            raise ValueError(
                "Duplicate input columns are not allowed."
            )

        expected = list(
            self.feature_names_in_
        )

        missing = [
            column for column in expected
            if column not in X.columns
        ]

        extra = [
            column for column in X.columns
            if column not in expected
        ]

        if missing or extra:

            raise ValueError(
                f"Feature contract violation. "
                f"Missing={missing}; Extra={extra}"
            )

        # Normalize column order without changing
        # values or silently coercing data types.

        return X.loc[:, expected]

    def transform(self, X):

        validated = self._validate_input(X)

        transformed = self.preprocessor.transform(
            validated
        )

        if transformed.shape[1] != (
            self.config["transformed_feature_count"]
        ):

            raise ValueError(
                "Unexpected transformed feature count."
            )

        return transformed

    def predict(self, X):

        # Preserve the original estimator's standard
        # predict() behavior.

        transformed = self.transform(X)

        return self.model.predict(
            transformed
        )

    def predict_proba(self, X):

        if self.task != "subsequent_visit":

            raise TypeError(
                "predict_proba() is available "
                "only for the classification model."
            )

        transformed = self.transform(X)

        return self.model.predict_proba(
            transformed
        )

    def predict_proxy_probability(self, X):

        probabilities = self.predict_proba(X)

        positive_index = int(
            np.where(self.classes_ == 1)[0][0]
        )

        return probabilities[:, positive_index]

    def predict_frozen_threshold(self, X):

        # Research evaluation only.
        # Not a clinical risk alert.

        probabilities = (
            self.predict_proxy_probability(X)
        )

        return (
            probabilities >= self.frozen_threshold
        ).astype(np.int64)


def load_portable_pipeline(
    package_root,
    task,
    model_format="ubj"
):

    return PortableXGBoostPipeline(
        package_root=package_root,
        task=task,
        model_format=model_format
    )
