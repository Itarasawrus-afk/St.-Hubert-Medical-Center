import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import GroupShuffleSplit
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import (
    mean_absolute_error,
    root_mean_squared_error,
    r2_score,
    roc_auc_score,
    average_precision_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    brier_score_loss,
)

SEED = 42
np.random.seed(SEED)
os.makedirs("artifacts_rf", exist_ok=True)

# Update DATA_DIR if needed in Colab (e.g., "/content" or "/content/drive/MyDrive/...")
DATA_DIR = "."
LOS_CSV_PATH = os.path.join(DATA_DIR, "/content/St_Hubert_LOS_Model_Dataset.csv")
PROXY_CSV_PATH = os.path.join(DATA_DIR, "/content/St_Hubert_30Day_Subsequent_Visit_Proxy_Dataset.csv")


def grouped_train_val_test_split(
    df: pd.DataFrame,
    group_col: str = "PATIENT_KEY",
    val_size: float = 0.15,
    test_size: float = 0.15,
    seed: int = 42,
):
    # 1. Hold out untouched test set grouped by PATIENT_KEY
    gss_test = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=seed)
    train_val_idx, test_idx = next(gss_test.split(df, groups=df[group_col]))
    train_val_df = df.iloc[train_val_idx].reset_index(drop=True)
    test_df = df.iloc[test_idx].reset_index(drop=True)

    # 2. Split remaining data into train and validation grouped by PATIENT_KEY
    rel_val_size = val_size / (1.0 - test_size)
    gss_val = GroupShuffleSplit(n_splits=1, test_size=rel_val_size, random_state=seed + 1)
    train_idx, val_idx = next(gss_val.split(train_val_df, groups=train_val_df[group_col]))
    train_df = train_val_df.iloc[train_idx].reset_index(drop=True)
    val_df = train_val_df.iloc[val_idx].reset_index(drop=True)

    assert len(set(train_df[group_col]) & set(val_df[group_col])) == 0
    assert len(set(train_df[group_col]) & set(test_df[group_col])) == 0
    assert len(set(val_df[group_col]) & set(test_df[group_col])) == 0
    return train_df, val_df, test_df


def build_preprocessor(num_cols, cat_cols) -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler()),
                ]),
                num_cols,
            ),
            (
                "cat",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("ohe", OneHotEncoder(handle_unknown="ignore")),
                ]),
                cat_cols,
            ),
        ]
    )


def select_threshold_on_val(y_true: np.ndarray, y_prob: np.ndarray) -> tuple[float, float]:
    best_t, best_f1 = 0.50, -1.0
    for t in np.linspace(0.05, 0.50, 91):
        preds = (y_prob >= t).astype(int)
        score = f1_score(y_true, preds, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_t = float(t)
    return best_t, float(best_f1)


# ============================================================================
# 1. MODEL A: RANDOM FOREST REGRESSOR FOR TARGET_LOS_DAYS
# ============================================================================
los_df = pd.read_csv(LOS_CSV_PATH)
features = [
    "AGE_AT_VISIT",
    "GENDER",
    "VISIT_TYPE",
    "ADMISSION_MONTH",
    "ADMISSION_WEEKDAY",
    "ADMISSION_HOUR",
    "PRIOR_VISIT_COUNT",
]
num_cols = [
    "AGE_AT_VISIT",
    "ADMISSION_MONTH",
    "ADMISSION_WEEKDAY",
    "ADMISSION_HOUR",
    "PRIOR_VISIT_COUNT",
]
cat_cols = ["GENDER", "VISIT_TYPE"]

los_train, los_val, los_test = grouped_train_val_test_split(los_df, seed=SEED)
y_los_train = pd.to_numeric(los_train["TARGET_LOS_DAYS"], errors="coerce").to_numpy(dtype=np.float64)
y_los_val = pd.to_numeric(los_val["TARGET_LOS_DAYS"], errors="coerce").to_numpy(dtype=np.float64)
y_los_test = pd.to_numeric(los_test["TARGET_LOS_DAYS"], errors="coerce").to_numpy(dtype=np.float64)

rf_los_pipe = Pipeline([
    ("pre", build_preprocessor(num_cols, cat_cols)),
    (
        "model",
        RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_leaf=50,
            max_samples=0.5,
            n_jobs=-1,
            random_state=SEED,
        ),
    ),
])

rf_los_pipe.fit(los_train[features], y_los_train)
val_los_pred = rf_los_pipe.predict(los_val[features])
test_los_pred = rf_los_pipe.predict(los_test[features])

los_metrics = {
    "val_mae_days": float(mean_absolute_error(y_los_val, val_los_pred)),
    "val_rmse_days": float(root_mean_squared_error(y_los_val, val_los_pred)),
    "val_r2": float(r2_score(y_los_val, val_los_pred)),
    "test_mae_days": float(mean_absolute_error(y_los_test, test_los_pred)),
    "test_rmse_days": float(root_mean_squared_error(y_los_test, test_los_pred)),
    "test_r2": float(r2_score(y_los_test, test_los_pred)),
}
print("=== Random Forest Model A (TARGET_LOS_DAYS) ===")
print(json.dumps(los_metrics, indent=2))
joblib.dump(rf_los_pipe, "artifacts_rf/rf_model_a_los_pipeline.joblib")


# ============================================================================
# 2. MODEL B: RANDOM FOREST CLASSIFIER (ADMISSION-TIME)
# Excludes VISIT_STATUS_AT_EXIT and LOS_DAYS (unknown at admission)
# ============================================================================
proxy_df = pd.read_csv(PROXY_CSV_PATH)
p_train, p_val, p_test = grouped_train_val_test_split(proxy_df, seed=SEED)

y_p_train = pd.to_numeric(p_train["SUBSEQUENT_VISIT_WITHIN_30D_PROXY"], errors="coerce").to_numpy(dtype=np.int64)
y_p_val = pd.to_numeric(p_val["SUBSEQUENT_VISIT_WITHIN_30D_PROXY"], errors="coerce").to_numpy(dtype=np.int64)
y_p_test = pd.to_numeric(p_test["SUBSEQUENT_VISIT_WITHIN_30D_PROXY"], errors="coerce").to_numpy(dtype=np.int64)

rf_proxy_pipe = Pipeline([
    ("pre", build_preprocessor(num_cols, cat_cols)),
    (
        "model",
        RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_leaf=50,
            max_samples=0.5,
            n_jobs=-1,
            random_state=SEED,
        ),
    ),
])

rf_proxy_pipe.fit(p_train[features], y_p_train)
val_prob = rf_proxy_pipe.predict_proba(p_val[features])[:, 1]
chosen_t, val_best_f1 = select_threshold_on_val(y_p_val, val_prob)

test_prob = rf_proxy_pipe.predict_proba(p_test[features])[:, 1]
test_pred = (test_prob >= chosen_t).astype(int)
tn, fp, fn, tp = confusion_matrix(y_p_test, test_pred).ravel()

proxy_metrics = {
    "val_roc_auc": float(roc_auc_score(y_p_val, val_prob)),
    "val_pr_auc": float(average_precision_score(y_p_val, val_prob)),
    "val_selected_threshold": chosen_t,
    "val_best_f1": val_best_f1,
    "test_roc_auc": float(roc_auc_score(y_p_test, test_prob)),
    "test_pr_auc": float(average_precision_score(y_p_test, test_prob)),
    "test_brier_score": float(brier_score_loss(y_p_test, test_prob)),
    "test_precision": float(precision_score(y_p_test, test_pred, zero_division=0)),
    "test_recall": float(recall_score(y_p_test, test_pred, zero_division=0)),
    "test_f1": float(f1_score(y_p_test, test_pred, zero_division=0)),
    "test_confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
}
print("\n=== Random Forest Model B (SUBSEQUENT_VISIT_WITHIN_30D_PROXY - Admission Time) ===")
print(json.dumps(proxy_metrics, indent=2))
joblib.dump(rf_proxy_pipe, "artifacts_rf/rf_model_b_proxy_pipeline.joblib")
