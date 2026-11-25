# Predictive Model Feature Contract

All five fitted pipelines expect the following seven
original input features in the recorded order.

| Feature | Input type | Meaning |
|---|---|---|
| AGE_AT_VISIT | Numeric | Age at visit |
| GENDER | Categorical | Recorded gender |
| VISIT_TYPE | Categorical | Recorded visit type |
| ADMISSION_MONTH | Integer | Admission month |
| ADMISSION_WEEKDAY | Integer | Admission weekday |
| ADMISSION_HOUR | Integer | Admission hour |
| PRIOR_VISIT_COUNT | Integer | Prior visit count |

## Observed categorical vocabulary

GENDER:
- Female
- Male
- Other

VISIT_TYPE:
- Diagnosis
- Treatment

## Fitted preprocessing

Numeric inputs:
- Median imputation
- Standard scaling

Categorical inputs:
- Most-frequent imputation
- One-hot encoding
- Unknown categories handled by the fitted encoder

The verified fitted preprocessing produces ten
transformed features.

Do not independently fit or recreate preprocessing
during inference.

Pass the seven original features to the complete
serialized pipeline.

## Excluded inputs

Patient identifiers and outcome targets are not model
input features.

Exit status and realized LOS are not inputs to the
subsequent visit classifier.

## Input semantics

Future integrations must reproduce the training
dataset's feature definitions, category encoding,
weekday convention, and prior-visit counting rules.

Do not assume that a technically valid input is a
clinically meaningful input.
