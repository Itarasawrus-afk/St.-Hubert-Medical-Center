ST. HUBERT BACKEND - PORTABLE XGBOOST INTEGRATION

This is an additive integration package based on the uploaded backend app.zip, main.py, and requirements.txt. Existing API endpoint modules are retained. The only router change registers /models routes.

IMPORTANT RUNTIME REQUIREMENT
Use CPython 3.13.17 and a NEW virtual environment. Do not use the existing Python 3.15 or .venv_models environments. The six model dependencies are pinned exactly as verified. Existing backend dependency pins are retained.

INSTALLATION (PowerShell, from the backend folder)
  py -3.13 --version
  py -3.13 -m venv .venv_bi_xgb
  .\.venv_bi_xgb\Scripts\python.exe -m pip install --upgrade pip
  .\.venv_bi_xgb\Scripts\python.exe -m pip install -r requirements.txt

Keep your existing .env file in this backend folder. Do not upload it or include it in ZIP/Git.

RUN
  .\.venv_bi_xgb\Scripts\python.exe -m uvicorn main:app --reload

TEST
  http://127.0.0.1:8000/models/xgboost/status
  http://127.0.0.1:8000/docs

POST /api/v1/models/xgboost/los/predict
POST /api/v1/models/xgboost/subsequent-visit/predict

Both POST routes accept exactly these seven fields:
AGE_AT_VISIT, GENDER, VISIT_TYPE, ADMISSION_MONTH, ADMISSION_WEEKDAY, ADMISSION_HOUR, PRIOR_VISIT_COUNT. Fields may be null. Do not send patient identifiers, target variables, realized LOS, or exit status.

Example JSON body:
{
  "AGE_AT_VISIT": 45,
  "GENDER": "Female",
  "VISIT_TYPE": "Diagnosis",
  "ADMISSION_MONTH": 6,
  "ADMISSION_WEEKDAY": 2,
  "ADMISSION_HOUR": 10,
  "PRIOR_VISIT_COUNT": 1
}

Research/demo only. These models are not approved for clinical deployment or operational alerts. The subsequent-visit target is a proxy, not confirmed readmission. Do not connect to clinical workflows.

If installation fails due to dependency resolution, stop and send the complete output. Do not change dependency pins. Preserve your backend backup.
