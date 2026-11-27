# FastAPI Integration Guide — Research Reference and Current Implementation

## Purpose and status

This file preserves the V2 research integration guidance. It is not the authoritative setup guide for the model service currently integrated into the BI backend.

**For the current application implementation, use [Backend README](../../../backend/README.md) and [Backend Deployment Handoff](../../../backend/DEPLOYMENT_HANDOFF.md).**

## Historical V2 research guidance

The V2 research workflow documented the following experimental candidate artifacts:

- LOS: Random Forest Regressor candidate, historically referenced as `models/los_random_forest.joblib`.
- Subsequent visit: XGBoost Classifier candidate, historically referenced as `models/subsequent_visit_xgboost.joblib`.

The guide also recorded candidate probability thresholds for research reproducibility:

- Random Forest Classifier: `0.095563329714727988`
- XGBoost Classifier: `0.085371159017086029`

These values are historical research metadata. They are not approved clinical thresholds, operational alert thresholds, or current backend configuration.

## Current backend implementation

The integrated BI backend is a separate portable inference implementation under:

```text
backend/model_artifacts/xgboost_portable/
```

It provides two XGBoost inference tasks:

- `los`
- `subsequent_visit`

The current backend uses native XGBoost UBJSON model files and task-specific joblib preprocessing artifacts, with configuration and preprocessing metadata. It exposes these routes under the `/api/v1` prefix:

- `GET /api/v1/models/xgboost/status`
- `POST /api/v1/models/xgboost/los/predict`
- `POST /api/v1/models/xgboost/subsequent-visit/predict`

The current seven-feature request contract is documented in [Backend README](../../../backend/README.md). The backend integration environment is documented as CPython 3.13.17; this differs from the Python 3.13.18 research environment recorded in the V2 research README.

## Interpretation and restrictions

The subsequent-visit target is a proxy outcome, not confirmed readmission. All integrated predictions remain academic/research demonstrations only. Do not use them for clinical decisions, patient-care actions, or operational alerts.

The historical research artifacts, candidate thresholds, and suggested `/research/*` endpoint paths above should not be used as instructions for the current backend deployment.
