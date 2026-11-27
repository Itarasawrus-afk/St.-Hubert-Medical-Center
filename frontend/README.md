# St. Hubert Medical Center — Business Intelligence System

## Overview

The St. Hubert Medical Center Business Intelligence (BI) System is an academic application for hospital performance monitoring, operational analysis, patient-flow assessment, and experimental predictive analytics.

The frontend is a React application built with Vite. It communicates with the FastAPI backend through REST endpoints. The frontend and backend are separate services and must be configured to use matching API URLs.

**Use limitation:** This is an academic/research demonstration. Predictive outputs are not approved for clinical decisions, patient-care workflows, or operational alerts. The subsequent-visit outcome is a proxy target, not confirmed readmission.

## Technology

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Routing | React Router |
| Charts | Recharts |
| Icons | Lucide React |
| Backend API | Python, FastAPI |
| Database | MySQL |
| Predictive integration | Portable XGBoost inference service in the backend |

See `package.json` and `package-lock.json` for the frontend dependency declarations and resolved versions.

## Application areas

The application includes executive dashboard, patient-flow and length-of-stay analysis, patient directory and record views, and a research/demo prediction interface. The backend also exposes billing, inventory, and workforce API groups; the exact operations available in a given revision are documented by the FastAPI OpenAPI schema.

## Local development

### Prerequisites

- Node.js and npm compatible with the checked-in lockfile
- A running backend API
- Authorized access to the configured backend database when database-backed views are used

### Install dependencies

From the `frontend/` directory:

```bash
npm ci
```

### Configure the API base URL

Create a local `.env` file using `.env.example` as a starting point:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

The value must point to the FastAPI API base and include the `/api/v1` prefix. Do not commit local environment files or secrets.

### Start the development server

```bash
npm run dev
```

Vite normally serves the development application at `http://localhost:5173`.

### Create a production build

```bash
npm run build
```

Vite writes the production output to `frontend/dist/`. The repository's `deploy/build.sh` script runs the locked frontend install and build, then copies the output into `deploy/site/` for the static-site workflow.

## Backend API

The frontend uses the FastAPI service under the `/api/v1` prefix. Configure `VITE_API_BASE_URL` to match the backend environment.

The backend currently registers these API groups:

- `overview`
- `billing`
- `visits`
- `inventory`
- `workforce`
- `patients`
- `models`

For exact endpoint paths, request fields, and response schemas, consult the backend's interactive OpenAPI documentation at `/docs` while the service is running. The backend setup, seven-feature prediction input contract, and model artifact layout are documented in [backend/README.md](../backend/README.md).

## Predictive model limitations

The integrated prediction endpoints are for academic evaluation and demonstration only.

- Predictions are not clinical recommendations.
- The models are not approved for clinical deployment or operational alerting.
- The subsequent-visit target is a proxy and must not be described as confirmed readmission.
- Experimental thresholds must not be used as approved clinical or operational decision thresholds.

## Data protection

- Do not commit database credentials, API secrets, or local `.env` files.
- Do not commit private patient-level datasets or personally identifiable information.
- Review generated build output and staged changes before publishing.
- Use only authorized and appropriately protected data when running the application.

## Deployment boundary

The repository's GitHub Actions workflow deploys the static frontend site. It does **not** deploy the FastAPI backend. The production frontend must be built with the confirmed production `VITE_API_BASE_URL`, and the backend must separately allow the production frontend origin through its CORS configuration.

See the repository [Deployment Overview](../DEPLOYMENT.md) and [Backend Deployment Handoff](../backend/DEPLOYMENT_HANDOFF.md).

## Project classification

**Project type:** Academic Business Intelligence and Predictive Analytics Demonstration  
**Predictive model status:** Research only; not approved for clinical deployment or operational alerts.
