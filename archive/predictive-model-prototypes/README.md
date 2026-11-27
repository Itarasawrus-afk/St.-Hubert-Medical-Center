# Archived Predictive Model Prototypes

This directory preserves the earlier standalone model-training scripts developed before the St. Hubert V2 predictive-model workflow and portable FastAPI integration.

## Contents

- `linear-regression.py` — Linear Regression baseline for length-of-stay (LOS) prediction.
- `random-forest.py` — Random Forest regression for LOS and classification for the 30-day subsequent-visit proxy.
- `xgboost.py` — Earlier XGBoost regression and classification training scripts.

## Status and intended use

These files are retained for research traceability and historical reference. They are not the active model-serving implementation and are not called by the FastAPI backend.

The current model-development documentation, evaluation outputs, and training notebook are maintained under `predictive model/St_Hubert_V2/`. The portable model artifacts used by the backend are maintained under `backend/model_artifacts/xgboost_portable/`.

## Execution limitations

The scripts preserve their original training logic and environment assumptions. In particular, their dataset paths use the Google Colab `/content/` directory, so they are not expected to run unchanged from a local checkout. Their generated `artifacts_lr/`, `artifacts_rf/`, and `artifacts_xgb/` directories are not part of the active backend artifact layout.

## Important modeling note

The classification target is named `SUBSEQUENT_VISIT_WITHIN_30D_PROXY`. It is a proxy outcome and should not be described as confirmed readmission. These research models are not validated for clinical decision-making or patient-care use.
