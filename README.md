# St. Hubert Medical Center Business Intelligence System

An academic Business Intelligence (BI) application for exploring hospital operational data, patient flow, length of stay (LOS), and selected performance indicators. The repository also contains experimental predictive-model integrations for research and demonstration.

> **Use limitation:** This project is an academic/research demonstration. Predictive outputs are not approved for clinical decision-making, patient-care workflows, or operational alerts. The subsequent-visit model targets a 30-day subsequent-visit proxy; it must not be represented as a validated readmission model.

## Project components

| Directory | Purpose |
|---|---|
| `frontend/` | React and Vite web application |
| `backend/` | FastAPI application, database access, API routes, and model inference integration |
| `backend/model_artifacts/` | Portable XGBoost model and preprocessing artifacts required by the integrated inference service |
| `database/` | Curated and analytics database materials |
| `data_documentation/` | ERD text, column inventory, row counts, and database validation summaries |
| `predictive model/St_Hubert_V2/` | Research notebooks, evaluation results, and documentation for the V2 modeling work |
| `deploy/` and `.github/` | Static frontend build and deployment workflow assets |

## Architecture

The application uses three main runtime components:

1. **Frontend:** React/Vite provides the browser interface.
2. **Backend:** FastAPI exposes REST endpoints under `/api/v1`, reads the configured MySQL database, and serves the integrated prediction endpoints.
3. **Database:** MySQL provides the relational data used by the BI API.

The frontend and backend are separate services. The current GitHub Actions deployment workflow prepares and deploys the static frontend site; it does not deploy the FastAPI backend. Backend hosting and database connectivity require a separate deployment configuration.

## Quick start

Read the component-specific guides before running the application:

- [Frontend setup and development](frontend/README.md)
- [Backend setup, API, and model integration](backend/README.md)
- [Database materials](database/README.md)
- [Data documentation and validation files](data_documentation/README.md)
- [Predictive Modeling V2 research documentation](predictive%20model/St_Hubert_V2/README.md)
- [Deployment overview](DEPLOYMENT.md)
- [Backend deployment handoff](backend/DEPLOYMENT_HANDOFF.md)

### Prerequisites

- Node.js and npm compatible with the frontend lockfile
- CPython 3.13.17 for the currently documented portable XGBoost backend environment
- MySQL Server with an authorized project database
- Git

### Start locally

1. Configure the backend environment and database connection by following [Backend README](backend/README.md).
2. Start the FastAPI service from the `backend/` directory.
3. Configure `frontend/.env` using the provided `frontend/.env.example`.
4. Install frontend dependencies and start Vite from the `frontend/` directory.

Do not commit local `.env` files, credentials, private patient-level datasets, or unapproved data exports.

## Predictive-model research and limitations

The V2 research documentation reports held-out evaluation results and explains that the proposal metric targets were not achieved. The currently integrated backend separately packages portable XGBoost inference artifacts. These are distinct documentation contexts: the backend integration describes what the application currently loads, while the V2 research directory records the modeling experiments and evaluation history.

The prediction endpoints accept a defined seven-feature input contract. Their outputs are experimental estimates only. In particular, a subsequent visit within 30 days is a proxy outcome and is not equivalent to confirmed readmission.

## Data protection

- Use only authorized data and approved environments.
- Keep credentials and populated patient-level databases out of version control.
- Review files, notebook outputs, logs, and staged changes for personal or sensitive information before committing.
- Use the supplied environment templates as examples; never publish real secrets.

## Project status

This repository contains an academic BI application and experimental predictive analytics. A successful local build or model load does not establish production readiness, clinical validity, or approval for patient-care use.
