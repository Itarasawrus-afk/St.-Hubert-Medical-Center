# Predictive Model Card

## Project

St. Hubert Medical Center BI Project

Dataset version: V2

Intended use: academic research and demonstration.

## Prediction tasks

1. Length of Stay (LOS) regression.
2. 30-day subsequent visit proxy classification.

## Training and evaluation

Patient-grouped training, validation and held-out test
partitions were used.

Model selection and experimental threshold selection
were performed using validation data.

Held-out test results were not used to revise selections.

## Primary experimental LOS model

Model: Random Forest Regressor

Held-out test records: 115809

- MAE: 49.030186 days
- RMSE: 57.066287 days
- R2: 0.032048

Proposal MAE target: below 1 day.
Target achieved: No.

The model explains only a small proportion of observed
LOS variability. Predictions concentrate around central
target values and have substantial errors for short
and long stays.

## Primary experimental classifier

Model: XGBoost Classifier

Held-out test records: 109245
Positive records: 12696
Negative records: 96549

- ROC-AUC: 0.502348
- Average precision: 0.117015
- Brier score: 0.102805
- Log loss: 0.359778

Frozen experimental threshold:
0.085371159017086029

- Precision: 0.116187
- Recall: 0.996928
- F1: 0.208120
- Predicted positive rate:
  99.717150%

Proposal ROC-AUC target: above 0.80.
Proposal average precision target: above 0.75.

Targets achieved: No.

The classifier exhibits approximately chance-level
discrimination. The experimental threshold flags nearly
all held-out visit records.

## Limitations

- Large LOS prediction errors.
- Weak classification discrimination.
- Probability errors worse than the constant
  training-prevalence baseline.
- Experimental thresholds have excessive alert burden.
- Default and proposal thresholds flag no test records.
- No useful highest-risk-decile enrichment.
- Subsequent visit proxy is not validated readmission.
- No established temporal or external generalizability.
- No reported patient-grouped confidence intervals.
- Source timestamp semantics and outcome definitions
  require further verification.
- Random Forest predictions may exhibit negligible
  floating-point variation near decision boundaries.

## Deployment assessment

Clinical deployment approved: No.
Operational alerts approved: No.
Research artifact export approved: Yes.

The primary experimental candidates are comparative
research selections, not clinically validated models.
