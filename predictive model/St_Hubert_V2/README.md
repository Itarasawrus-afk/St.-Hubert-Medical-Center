# St. Hubert Medical Center — Predictive Modeling V2

Academic research and controlled demonstration only. No clinical deployment, operational alerts or patient-specific decision support are approved.

## Contents

- `notebooks/`: complete V2 Colab training and evaluation workflow, with saved outputs removed.
- `evaluation/`: aggregate validation and held-out test results, including baseline comparisons and confusion matrices.
- `documentation/`: model card, feature contract and research FastAPI integration guide.
- `requirements.txt`: recorded model environment dependencies (Python 3.13.18).

## Results

| Model | Held-out MAE (days) | Held-out ROC-AUC | Held-out average precision |
|---|---:|---:|---:|
| Linear Regression | 49.8169 | — | — |
| Random Forest Regressor | 49.0302 | — | — |
| XGBoost Regressor | 49.0306 | — | — |
| Random Forest Classifier | — | 0.5033 | 0.1173 |
| XGBoost Classifier | — | 0.5023 | 0.1170 |

Validation-selected experimental candidates: Random Forest Regressor and XGBoost Classifier. None of the seven proposal metric targets were achieved. The classification target is a subsequent visit proxy, not validated unplanned readmission. See the model card for limitations.

## Reproduction

Use an isolated environment and the recorded dependency versions. Open the notebook in Colab and supply the authorized V2 datasets privately when requested. The notebook retains dataset-specific assertions and has not been rerun after sanitization. Fitted models and patient-level data are intentionally excluded. The integration guide refers to artifacts available separately through an authorized private handoff.

## Privacy and publication

Do not commit patient-level data, credentials, fitted model files, private exports or notebook outputs. Review source code and aggregate results for institutional publication authorization before pushing. The ignore rules are safeguards, not a substitute for reviewing staged changes.
