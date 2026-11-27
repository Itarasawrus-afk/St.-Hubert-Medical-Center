# St. Hubert Medical Center — Predictive Modeling V2

Academic research and controlled demonstration only. No clinical deployment, operational alerts, or patient-specific decision support are approved.

## Contents

- `notebooks/`: V2 training and evaluation workflow, with saved outputs removed.
- `evaluation/`: aggregate validation and held-out test results, including baseline comparisons and confusion matrices.
- `documentation/`: model card, feature contract, and research integration notes.
- `requirements.txt`: recorded research model-environment dependencies (the research environment is documented as Python 3.13.18).

## Held-out results

| Model | Held-out MAE (days) | Held-out ROC-AUC | Held-out average precision |
|---|---:|---:|---:|
| Linear Regression | 49.8169 | — | — |
| Random Forest Regressor | 49.0302 | — | — |
| XGBoost Regressor | 49.0306 | — | — |
| Random Forest Classifier | — | 0.5033 | 0.1173 |
| XGBoost Classifier | — | 0.5023 | 0.1170 |

Validation-selected experimental candidates: Random Forest Regressor and XGBoost Classifier. None of the seven proposal metric targets were achieved. The classification target is a subsequent-visit proxy, not validated unplanned readmission. See the model card and evaluation materials for limitations and interpretation.

## Research reproduction

Use an isolated environment and the recorded dependency versions. Open the notebook in Colab and supply the authorized V2 datasets privately when requested. The notebook retains dataset-specific assertions and has not been rerun after sanitization. Fitted research models and patient-level data are intentionally excluded from this research directory.

## Relationship to the integrated backend

The research results above describe the V2 experimentation and held-out evaluation. The running BI backend has a separate portable XGBoost inference package under `backend/model_artifacts/xgboost_portable/`, with LOS and subsequent-visit task artifacts, preprocessing objects, configuration, and metadata. The backend integration uses native XGBoost UBJSON model files plus joblib preprocessing artifacts and is documented in [Backend README](../../backend/README.md).

Do not assume that the research candidate-selection table and the currently packaged backend artifacts are interchangeable. In particular, the V2 research summary identifies a Random Forest Regressor as the selected LOS candidate, whereas the current backend's LOS inference task is packaged as an XGBoost model. Treat these as distinct project stages unless a model-provenance record explicitly establishes equivalence or a later replacement.

The research environment version (Python 3.13.18) is not the same as the backend portable-integration runtime documented in `backend/` (CPython 3.13.17). Follow the instructions for the component being run.

## Privacy and publication

Do not commit patient-level data, credentials, fitted model files, private exports, or notebook outputs. Review source code and aggregate results for institutional publication authorization before pushing. Ignore rules are safeguards, not a substitute for reviewing staged changes.
