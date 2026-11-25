# FastAPI Research Integration Guide

## Integration status

Research demonstration only.

Do not expose these models as clinically validated
prediction services.

## Recommended artifacts

LOS experimental candidate:
models/los_random_forest.joblib

Subsequent visit experimental candidate:
models/subsequent_visit_xgboost.joblib

## Recommended integration sequence

1. Create an isolated Python environment.
2. Install the recorded model dependencies.
3. Verify the artifact SHA-256 checksums.
4. Load only trusted serialized pipelines.
5. Validate the seven original input features.
6. Run a synthetic-input smoke test.
7. Verify prediction shapes and finite outputs.
8. Compare synthetic-input results across environments.
9. Clearly label all outputs as experimental.
10. Keep clinical alerts and operational automation disabled.

## Inference methods

LOS regression:
pipeline.predict(input_dataframe)

Subsequent visit probability:
pipeline.predict_proba(input_dataframe)

The positive-class probability corresponds to class 1.

Verify classifier class ordering before selecting
the probability column.

## Experimental thresholds

Random Forest Classifier:
0.095563329714727988

XGBoost Classifier:
0.085371159017086029

These thresholds are retained for research
reproducibility only.

They must not be treated as approved clinical
decision thresholds.

## Suggested demonstration endpoints

POST /research/predict-los
POST /research/predict-subsequent-visit

Suggested response metadata:

- dataset_version: V2
- research_only: true
- clinical_deployment_approved: false
- operational_alerts_approved: false

Do not describe the subsequent visit probability as a
validated probability of unplanned hospital readmission.

## Environment compatibility

The models were verified in their original Linux
training environment.

Successful loading on a different local operating
system has not yet been established.

FastAPI and Uvicorn versions are not pinned here
because this package documents the model environment,
not a verified API deployment environment.
