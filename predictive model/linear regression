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
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

SEED = 42
np.random.seed(SEED)
os.makedirs("artifacts_lr", exist_ok=True)

DATA_DIR = "."
LOS_CSV_PATH = os.path.join(DATA_DIR, "/content/St_Hubert_LOS_Model_Dataset.csv")

los_df = pd.read_csv(LOS_CSV_PATH)

los_features = [
    "AGE_AT_VISIT",
    "GENDER",
    "VISIT_TYPE",
    "ADMISSION_MONTH",
    "ADMISSION_WEEKDAY",
    "ADMISSION_HOUR",
    "PRIOR_VISIT_COUNT",
]
los_target = "TARGET_LOS_DAYS"

num_cols = [
    "AGE_AT_VISIT",
    "ADMISSION_MONTH",
    "ADMISSION_WEEKDAY",
    "ADMISSION_HOUR",
    "PRIOR_VISIT_COUNT",
]
cat_cols = ["GENDER", "VISIT_TYPE"]


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


los_train, los_val, los_test = grouped_train_val_test_split(los_df, seed=SEED)

pre_los = ColumnTransformer(
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

lr_los_pipe = Pipeline([
    ("pre", pre_los),
    ("model", LinearRegression()),
])

y_train = pd.to_numeric(los_train[los_target], errors="coerce").to_numpy(dtype=np.float64)
y_val = pd.to_numeric(los_val[los_target], errors="coerce").to_numpy(dtype=np.float64)
y_test = pd.to_numeric(los_test[los_target], errors="coerce").to_numpy(dtype=np.float64)

# Fit strictly on training split
lr_los_pipe.fit(los_train[los_features], y_train)

val_pred = lr_los_pipe.predict(los_val[los_features])
test_pred = lr_los_pipe.predict(los_test[los_features])

metrics = {
    "val_mae_days": float(mean_absolute_error(y_val, val_pred)),
    "val_rmse_days": float(root_mean_squared_error(y_val, val_pred)),
    "val_r2": float(r2_score(y_val, val_pred)),
    "test_mae_days": float(mean_absolute_error(y_test, test_pred)),
    "test_rmse_days": float(root_mean_squared_error(y_test, test_pred)),
    "test_r2": float(r2_score(y_test, test_pred)),
}
print(json.dumps(metrics, indent=2))
joblib.dump(lr_los_pipe, "artifacts_lr/lr_model_a_los_pipeline.joblib")
