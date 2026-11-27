# Deployment Overview

## Current deployment boundary

The repository contains a GitHub Actions workflow named **Deploy paid site** at `.github/workflows/paid-site.yml`. The workflow prepares a bounded static-site package from the frontend build output and runs the configured static-site deployment process.

**This workflow does not deploy the FastAPI backend.** Backend hosting, Python runtime, API networking, database connectivity, secrets, and model-artifact availability must be configured and deployed separately. See [Backend Deployment Handoff](backend/DEPLOYMENT_HANDOFF.md).

## Frontend static-site build

The committed build script is `deploy/build.sh`. It:

1. Installs frontend dependencies using `npm ci` from the lockfile.
2. Runs `npm run build` in `frontend/`.
3. Copies the Vite production output from `frontend/dist/` into `deploy/site/`.

To build locally:

```bash
bash deploy/build.sh
```

The expected static entry point is `deploy/site/index.html`. Only files intended to be publicly served should be placed in the deployment site directory. Do not put `.env` files, credentials, database files, private datasets, or patient-level exports in the static build output.

## Frontend API configuration

The frontend reads `VITE_API_BASE_URL`. The checked-in example is:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Set the production API base URL in the frontend build environment before generating the production bundle. The value must point to the deployed FastAPI service and include the `/api/v1` prefix. Do not publish an example or placeholder hostname as a real endpoint.

The backend CORS allowlist currently contains only the local Vite origins `http://localhost:5173` and `http://127.0.0.1:5173`. The production frontend origin must be reviewed and explicitly configured before browser-based production access is expected to work.

## Backend deployment is separate

The FastAPI application is in `backend/`. It requires:

- The documented Python runtime and pinned dependencies in `backend/requirements.txt`.
- Secure production database environment variables.
- The required MySQL schema and authorized data.
- The portable XGBoost model artifacts under `backend/model_artifacts/xgboost_portable/`.
- A production process manager, network configuration, HTTPS, logging, monitoring, and CORS configuration.

The repository does not provide a complete backend hosting configuration in the static-site workflow. Do not infer that a successful frontend deployment means the API, database, or model service is deployed.

## Database migrations

The workflow also contains a migration-validation stage for numbered SQL migration pairs under `deploy/migrations/`. Each migration is expected to have a matching verification file. This is a separate schema-change mechanism; it is not a substitute for the project's database setup, data-loading process, or backend deployment. Review the workflow and migration files before introducing a production schema change.

## Deployment verification

After the frontend is published, verify:

- The static site serves its expected `index.html` and assets.
- The production frontend build uses the confirmed API base URL.
- The browser can reach the API from the production origin after CORS is configured.
- The backend `GET /health` endpoint reports database connectivity.
- The model status endpoint reports successful loading in the deployed backend environment.
- Prediction endpoints are tested only with synthetic or otherwise approved non-identifying research/demo inputs.

For detailed backend responsibilities and checks, use [Backend Deployment Handoff](backend/DEPLOYMENT_HANDOFF.md).

## Safety and data handling

Do not deploy patient-level data, private exports, credentials, local environment files, or unapproved research artifacts as public static assets. Predictive models remain research/demo only and are not approved for clinical decisions, operational alerts, or patient-care workflows.
