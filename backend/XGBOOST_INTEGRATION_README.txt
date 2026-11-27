ST. HUBERT MEDICAL CENTER — PORTABLE XGBOOST BACKEND INTEGRATION

For the current implementation and complete setup instructions, see:
  backend/README.md
  backend/DEPLOYMENT_HANDOFF.md

RUNTIME
Use CPython 3.13.17 and a NEW virtual environment from the backend folder.
Do not reuse the previously used Python 3.15 or .venv_models environments.
Do not change pinned dependencies without validating model compatibility.

PowerShell setup (from backend):
  py -3.13 --version
  py -3.13 -m venv .venv_bi_xgb
  .\.venv_bi_xgb\Scripts\python.exe -m pip install --upgrade pip
  .\.venv_bi_xgb\Scripts\python.exe -m pip install -r requirements.txt

Keep the actual .env file local. Do not upload it or include it in Git.

RUN
  .\.venv_bi_xgb\Scripts\python.exe -m uvicorn main:app --reload

LOCAL DOCUMENTATION
  http://127.0.0.1:8000/docs

MODEL ENDPOINTS
  GET  /api/v1/models/xgboost/status
  POST /api/v1/models/xgboost/los/predict
  POST /api/v1/models/xgboost/subsequent-visit/predict

Both POST routes use exactly these seven input fields:
  AGE_AT_VISIT
  GENDER
  VISIT_TYPE
  ADMISSION_MONTH
  ADMISSION_WEEKDAY
  ADMISSION_HOUR
  PRIOR_VISIT_COUNT

Fields may be null according to the request schema. Additional fields are rejected.
Do not send patient identifiers, target variables, realized LOS, or exit status.

PORTABLE ARTIFACTS
The integrated service loads task-specific artifacts from:
  backend/model_artifacts/xgboost_portable/

The LOS and subsequent_visit task directories contain native XGBoost UBJSON
models, joblib preprocessing artifacts, configuration, and preprocessing
metadata. Keep each task's files together. The loader performs integrity,
dependency, and feature-contract checks.

RESEARCH / DEMONSTRATION ONLY
These models are not approved for clinical deployment, clinical decisions,
patient-care workflows, or operational alerts. The subsequent-visit target is
a proxy, not confirmed readmission.

If installation or model loading fails, preserve the complete error output.
Do not change dependency pins or replace artifacts as an ad hoc workaround.
