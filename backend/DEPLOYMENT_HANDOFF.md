# Backend Deployment Handoff

## St. Hubert Medical Center BI Project

**Document purpose:** Handoff reference for the team responsible for
deploying the St. Hubert Medical Center BI application backend.

**Status:** Prepared for deployment-team review. This document does not
indicate that the backend has been deployed or that production
infrastructure has been provisioned.

------------------------------------------------------------------------

## 1. System overview

The project uses a React/Vite frontend and a FastAPI backend.

-   **Frontend:** React with Vite.
-   **Backend:** FastAPI.
-   **Database:** MySQL, accessed through SQLAlchemy and PyMySQL.
-   **Predictive models:** Portable XGBoost pipelines for length of stay
    (LOS) and 30-day subsequent-visit proxy prediction.
-   **API prefix:** `/api/v1`.

The current repository workflow packages and deploys the static
frontend. It does **not** deploy the FastAPI backend. Backend hosting,
runtime configuration, database connectivity, and production API
exposure must be handled separately by the deployment team.

## 2. Backend runtime and dependencies

The backend integration documentation specifies **CPython 3.13.17** and
a new virtual environment for the portable XGBoost integration.

The backend dependency file is:

`backend/requirements.txt`

Install dependencies from that file in the deployment environment. The
model loader also checks installed package versions against each model's
`model_config.json`; a mismatch causes model loading to fail.

Do not casually upgrade or replace pinned dependencies. Confirm any
proposed runtime or dependency change against the model configuration
and test the resulting environment before deployment.

Example local startup command (for reference only):

``` powershell
cd backend
.\.venv_bi_xgb\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

The deployment team should choose the production process manager, bind
address, port, service supervision, and network exposure appropriate to
its hosting environment.

## 3. Database configuration

The backend reads these environment variables through
`backend/app/config.py`:

  -----------------------------------------------------------------------
  Variable                Local default / example Production requirement
  ----------------------- ----------------------- -----------------------
  `DB_HOST`               `127.0.0.1`             Set to the production
                                                  database host

  `DB_PORT`               `3310`                  Set to the production
                                                  MySQL port

  `DB_NAME`               `st_hubert_analytics`   Confirm the production
                                                  database name

  `DB_USER`               Placeholder in          Supply a dedicated
                          `.env.example`          database account

  `DB_PASSWORD`           Placeholder in          Supply through a secure
                          `.env.example`          secrets mechanism
  -----------------------------------------------------------------------

The template is `backend/.env.example`. It contains placeholders, not
production credentials.

**Do not upload or commit the actual backend `.env` file.** Production
credentials should be provided through the deployment platform's
secret/environment-variable mechanism. Do not assume that the local
database address `127.0.0.1:3310` is valid in production.

The backend's `/health` endpoint calls the database connection test. A
healthy API process does not by itself prove database connectivity;
check the returned database status as part of deployment verification.

## 4. API application and routes

The FastAPI application is defined in `backend/main.py`. The API router
is registered with the prefix `/api/v1`.

The router currently registers these groups:

-   `/api/v1/overview`
-   `/api/v1/billing`
-   `/api/v1/visits`
-   `/api/v1/inventory`
-   `/api/v1/workforce`
-   `/api/v1/patients`
-   `/api/v1/models`

Application-level endpoints:

  -----------------------------------------------------------------------
  Method                  Path                    Purpose
  ----------------------- ----------------------- -----------------------
  GET                     `/`                     Basic API-running
                                                  response

  GET                     `/health`               API and database
                                                  connectivity check

  GET                     `/docs`                 FastAPI interactive API
                                                  documentation, if
                                                  enabled in the deployed
                                                  configuration
  -----------------------------------------------------------------------

### Predictive model endpoints

  ---------------------------------------------------------------------------------------------------
  Method                  Path                                                Purpose
  ----------------------- --------------------------------------------------- -----------------------
  GET                     `/api/v1/models/xgboost/status`                     Loads/checks both
                                                                              portable models and
                                                                              reports status

  POST                    `/api/v1/models/xgboost/los/predict`                Returns an LOS
                                                                              prediction in days

  POST                    `/api/v1/models/xgboost/subsequent-visit/predict`   Returns
                                                                              subsequent-visit proxy
                                                                              probability and
                                                                              decision outputs
  ---------------------------------------------------------------------------------------------------

Both prediction endpoints accept the following seven fields. They are
optional in the current Pydantic request model; additional fields are
rejected.

  Field                 Validation
  --------------------- -----------------
  `AGE_AT_VISIT`        0 to 120
  `GENDER`              Optional string
  `VISIT_TYPE`          Optional string
  `ADMISSION_MONTH`     1 to 12
  `ADMISSION_WEEKDAY`   0 to 6
  `ADMISSION_HOUR`      0 to 23
  `PRIOR_VISIT_COUNT`   0 or greater

The API should be tested using non-identifying research/demo inputs. Do
not send patient identifiers, target variables, realized LOS, or exit
status to these prediction endpoints.

## 5. Portable XGBoost model artifacts

The model loader resolves the artifact directory to:

`backend/model_artifacts/xgboost_portable/`

It loads two tasks:

-   `los`
-   `subsequent_visit`

The loader uses UBJSON native XGBoost model files. It loads the fitted
scikit-learn preprocessor with joblib and loads the XGBoost model
through XGBoost's native `load_model()` method.

Before loading, the pipeline verifies SHA-256 hashes for the
preprocessor and native model files against values in the task's
`model_config.json`. It also checks dependency versions and validates
the feature contract, transformed feature contract, booster feature
count, boosting rounds, objective, best iteration, and (for
classification) class order.

The model files and their corresponding configuration and preprocessing
artifacts must remain together in their expected task directories. Do
not rename, omit, or independently replace individual artifacts. A hash
mismatch or compatibility mismatch is expected to stop model loading.

The SHA-256 check confirms that an artifact matches the hash recorded in
its configuration; it is not, by itself, proof of the publisher's
identity. Deploy from a reviewed, trusted repository revision.

## 6. Frontend API URL and CORS

The frontend reads:

`VITE_API_BASE_URL`

The current local example is:

`http://127.0.0.1:8000/api/v1`

For production, the deployment team must provide the actual HTTPS API
base URL **before the frontend production build is generated**. The
final value must include the `/api/v1` prefix. Do not use an example
hostname as a real deployment setting.

The current `backend/main.py` CORS allowlist contains only these local
origins:

-   `http://localhost:5173`
-   `http://127.0.0.1:5173`

The deployment team must arrange for the actual production frontend
origin to be allowed by the backend. The project domain discussed for
the frontend is `https://sthubertmc.com`; confirm the final canonical
origin and whether a `www` origin is also used before configuring CORS.
Do not use a wildcard origin as a shortcut when credentials are enabled.

## 7. Deployment-team responsibilities

The following production tasks are outside the current local project
configuration and must be completed by the deployment team:

1.  Select and provision the backend hosting/runtime environment.
2.  Install the required Python runtime and pinned backend dependencies.
3.  Configure secure production database connectivity and credentials.
4.  Ensure the required MySQL schema/data is available through the
    approved database deployment process.
5.  Deploy the backend code and all required model artifacts from the
    reviewed repository revision.
6.  Configure the production frontend origin in CORS.
7.  Provide the production API base URL to the frontend build process.
8.  Configure HTTPS, routing, process supervision, logging, monitoring,
    and appropriate network/security controls.
9.  Run the post-deployment checks below.
10. Coordinate DNS and domain configuration with the team responsible
    for the frontend/domain.

The current frontend static-site workflow should not be treated as a
backend deployment mechanism.

## 8. Post-deployment verification checklist

-   [ ] Backend process starts successfully using the approved
    production runtime.
-   [ ] `GET /` returns the expected API-running response.
-   [ ] `GET /health` reports successful database connectivity.
-   [ ] `GET /api/v1/models/xgboost/status` reports both models loaded.
-   [ ] LOS prediction endpoint accepts a valid research/demo payload.
-   [ ] Subsequent-visit endpoint accepts a valid research/demo payload.
-   [ ] Frontend production build uses the confirmed production API base
    URL.
-   [ ] Browser requests from the production frontend origin pass CORS
    checks.
-   [ ] Relevant overview and Billing BI API requests work against
    production.
-   [ ] Logs and error handling do not expose database credentials or
    sensitive patient data.

A successful model status response should be verified in the deployed
environment; the existence of model files in the repository alone does
not prove that production loading succeeds.

## 9. Research and clinical-use restrictions

The predictive models are for research and technical demonstration only.

-   The LOS model output is a model prediction, not a clinical
    directive.
-   The subsequent-visit model predicts a **30-day subsequent-visit
    proxy**, not confirmed readmission.
-   The models are not approved for clinical deployment, clinical
    decisions, or operational alerts.
-   Do not connect these outputs to clinical workflows or use them to
    trigger patient-care actions.

These restrictions must remain visible in deployment documentation and
any user-facing model interface.

## 10. Current handoff status and boundaries

### Reviewed in the project discussion

-   FastAPI application and router registration.
-   Model prediction endpoint definitions and input validation.
-   Portable model loader and compatibility/integrity checks.
-   Backend database environment-variable configuration and example
    template.
-   Frontend API client route alignment.
-   Frontend API URL example.

### Still requires deployment-team confirmation or execution

-   Production Python/runtime and dependency installation.
-   Production database host, schema/data, credentials, and
    connectivity.
-   Backend hosting and service configuration.
-   Production CORS origin.
-   Production API hostname and HTTPS.
-   Production frontend build with the confirmed API URL.
-   Post-deployment integration verification.

This handoff is based on the code and configuration reviewed during
project preparation. It is not a complete security audit, infrastructure
validation, clinical validation, or confirmation of production
deployment.

**Repository and release control:** No GitHub push or production
deployment is authorized by this document. Deploy only after the project
owner approves the reviewed repository revision and the deployment team
confirms its target environment.
