# St. Hubert Medical Center â€” Business Intelligence System

## Project Overview

The St. Hubert Medical Center Business Intelligence (BI) System is an academic project designed to support hospital performance monitoring, operational analysis, patient-flow assessment, and predictive analytics.

The system provides a centralized interface for exploring hospital operational data and selected patient-level information. It also integrates experimental machine learning models for length-of-stay estimation and subsequent-visit risk prediction.

This project is intended for academic demonstration and research purposes. Its predictive outputs are not approved for clinical decision-making or operational alerts.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Database | MySQL |
| API communication | REST API |
| Predictive modeling | XGBoost and supporting Python ML libraries |

## System Modules

### 1. Executive BI Dashboard
Provides a high-level overview of hospital activity and performance indicators.

### 2. Patient Flow & Length of Stay
Provides patient-flow analysis, visit filtering, and length-of-stay summaries.

### 3. Clinical Risk & Prediction
Integrates experimental XGBoost prediction endpoints for:
- Length-of-stay estimation
- Subsequent-visit probability estimation

The models are presented for research and demonstration only. Predictions should not be interpreted as clinical recommendations.

### 4. Patient Directory
Provides searchable and paginated access to patient directory records.

### 5. Patient Record Detail
Displays selected patient demographic information and visit history, including the available subsequent-visit summary.

## System Architecture

The application uses a frontend-backend-database architecture:

1. **Frontend:** React provides the user interface and sends requests to the backend API.
2. **Backend:** FastAPI handles API requests, retrieves data, and invokes the predictive model services.
3. **Database:** MySQL stores the underlying hospital data accessed by the backend.

The frontend and backend run as separate services during local development.

## Repository Structure

```text
St.-Hubert-Medical-Center/
â”œâ”€â”€ .github/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ database/
â”‚   â”‚   â”œâ”€â”€ ml/
â”‚   â”‚   â””â”€â”€ services/
â”‚   â”œâ”€â”€ model_artifacts/
â”‚   â”œâ”€â”€ main.py
â”‚   â””â”€â”€ requirements.txt
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ index.html
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ vite.config.js
â”œâ”€â”€ database/
â”œâ”€â”€ data modelling/
â””â”€â”€ data_documentation/
```

*The structure above summarizes the main project areas. Individual files and supporting assets may vary.*

## Requirements

- Node.js 20 LTS (recommended)
- Python environment compatible with the backend dependencies
- MySQL Server
- Git

## Local Development Setup

### 1. Database

1. Install and start MySQL.
2. Configure the database connection using the backend environment variables.
3. Ensure the required database and views are available.
4. Do not commit database credentials or patient-level data to the public repository.

Refer to the `database/` and `data_documentation/` directories for the project's database-related materials.

### 2. Backend Setup

Open a terminal in the `backend/` directory.

Create and activate a Python virtual environment, then install the backend dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure the backend environment variables using the appropriate local configuration. Do not commit the actual `.env` file.

Start the FastAPI development server:

```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Backend API:
`http://127.0.0.1:8000`

Interactive API documentation:
`http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open another terminal in the `frontend/` directory.

Install the dependencies:

```powershell
npm install
```

Create a local `.env` file containing the frontend API base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Start the Vite development server:

```powershell
npm run dev
```

Open the application at:

`http://localhost:5173`

If the backend is hosted at a different address, update `VITE_API_BASE_URL` accordingly.

## API Overview

The backend exposes REST endpoints under `/api/v1`.

The implemented endpoint groups include:

| Endpoint | Purpose |
|---|---|
| `/overview` | Executive dashboard metrics |
| `/overview/trends` | Dashboard trends |
| `/visits` | Visit records and filtering |
| `/visits/los-summary` | Length-of-stay summaries |
| `/visits/filters` | Available visit filters |
| `/visits/patient-flow` | Patient-flow aggregation |
| `/patients/` | Patient records |
| `/patients/directory` | Patient directory |
| `/patients/{patient_id}/record` | Patient record detail |
| `/models/xgboost/status` | Predictive model availability |
| `/models/xgboost/los/predict` | Length-of-stay prediction |
| `/models/xgboost/subsequent-visit/predict` | Subsequent-visit prediction |

Additional billing, inventory, and workforce endpoints are also present in the backend.

For the complete API schema and interactive testing interface, open the FastAPI Swagger documentation at `/docs`.

## Predictive Model Limitations

The integrated predictive models are intended for academic evaluation and demonstration.

Important limitations:

- The models are not approved for clinical deployment.
- Predictions must not be used as a substitute for professional clinical judgment.
- The subsequent-visit outcome is a proxy target and should not be described as confirmed readmission.
- Model performance limitations must be considered when interpreting predictions.
- The experimental prediction thresholds are not approved for operational alerting.

The model outputs should therefore be interpreted as experimental analytical results, not validated clinical decisions.

## Data and Privacy Considerations

This repository is intended for project development, academic demonstration, and evaluation.

- Do not commit database passwords, API secrets, or other credentials.
- Do not commit private patient-level datasets or personally identifiable information.
- Keep local `.env` files and virtual environments out of version control.
- Use appropriately authorized and protected data when running the application.

## Production Build

To generate the frontend production build:

```powershell
cd frontend
npm run build
```

Vite generates the production files in:

```text
frontend/dist/
```

For deployment, the frontend static build and FastAPI backend must be hosted and configured to communicate with one another. The backend must also have access to the required MySQL database and model artifacts.

Deployment configuration, environment variables, CORS settings, and database connectivity must be reviewed for the target hosting environment.

## Project Purpose

The St. Hubert Medical Center BI System demonstrates how business intelligence, hospital operational data, and experimental predictive analytics can be integrated into a unified application to support data exploration and management-oriented analysis.

**Project classification:** Academic Business Intelligence and Predictive Analytics Demonstration
**Predictive model status:** Research only; not approved for clinical deployment or operational alerts.
