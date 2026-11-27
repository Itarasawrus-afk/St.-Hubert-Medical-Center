# Backend

The backend is a FastAPI application that exposes the St. Hubert Medical Center BI API, accesses MySQL through the project's database layer, and provides the integrated portable XGBoost prediction endpoints.

## Runtime and dependencies

The portable XGBoost integration is documented for **CPython 3.13.17** in a new isolated environment. The backend dependencies are pinned in `requirements.txt`; the model loader also checks dependency versions recorded in each model configuration.

Use PowerShell from the `backend/` directory:

```powershell
py -3.13 --version
py -3.13 -m venv .venv_bi_xgb
.\.venv_bi_xgb\Scripts\python.exe -m pip install --upgrade pip
.\.venv_bi_xgb\Scripts\python.exe -m pip install -r requirements.txt
```

Do not reuse the previously used Python 3.15 or `.venv_models` environments for this integration. Do not change pinned dependencies casually: verify any change against the model configuration and test model loading.

## Environment configuration

Copy `.env.example` to a local `.env` file and supply the authorized database connection values.

| Variable | Local example/default | Description |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_PORT` | `3310` | MySQL port |
| `DB_NAME` | `st_hubert_analytics` | Database name |
| `DB_USER` | placeholder | Database account |
| `DB_PASSWORD` | placeholder | Database password |

The actual `.env` file is local configuration and must not be committed. Use a dedicated least-privilege database account and a secrets mechanism in hosted environments. Confirm the schema and required views are present before testing BI endpoints.

## Run the API

From the `backend/` directory:

```powershell
.\.venv_bi_xgb\Scripts\python.exe -m uvicorn main:app --reload
```

Local base URL: `http://127.0.0.1:8000`

- API root: `GET /`
- Health check, including database connectivity: `GET /health`
- Interactive API documentation: `/docs`

The application registers its API router under `/api/v1`.

## API groups

The router currently includes these endpoint groups:

- `/api/v1/overview`
- `/api/v1/billing`
- `/api/v1/visits`
- `/api/v1/inventory`
- `/api/v1/workforce`
- `/api/v1/patients`
- `/api/v1/models`

Consult the live OpenAPI schema at `/docs` for the exact operations, request models, and response schemas for the checked-out revision.

## Portable XGBoost integration

The integrated inference artifacts are stored under:

```text
model_artifacts/
└── xgboost_portable/
    ├── feature_contract.json
    ├── los/
    │   ├── los_preprocessor.joblib
    │   ├── los_xgboost.ubj
    │   ├── model_config.json
    │   └── preprocessing_metadata.json
    └── subsequent_visit/
        ├── subsequent_visit_preprocessor.joblib
        ├── subsequent_visit_xgboost.ubj
        ├── model_config.json
        └── preprocessing_metadata.json
```

The inference service uses the fitted preprocessing object serialized with joblib and loads each XGBoost booster from its native UBJSON model file. The configuration and metadata files are part of the artifact contract; keep each task's files together. The loader validates recorded SHA-256 hashes, dependency versions, feature contracts, transformed feature information, booster metadata, and classifier class ordering. A mismatch is expected to prevent loading.

### Model endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/models/xgboost/status` | Check the integrated model service |
| POST | `/api/v1/models/xgboost/los/predict` | Estimate length of stay |
| POST | `/api/v1/models/xgboost/subsequent-visit/predict` | Estimate the subsequent-visit proxy probability |

Both prediction endpoints use these seven input fields:

- `AGE_AT_VISIT`
- `GENDER`
- `VISIT_TYPE`
- `ADMISSION_MONTH`
- `ADMISSION_WEEKDAY`
- `ADMISSION_HOUR`
- `PRIOR_VISIT_COUNT`

Fields may be null according to the current request model. The API rejects additional fields. Do not send patient identifiers, target variables, realized LOS, or exit status to these prediction endpoints. Use synthetic or otherwise approved non-identifying research/demo inputs for testing.

A successful status response should be checked in the actual runtime environment; the presence of artifact files alone does not prove that the service can load them.

## Research-use restriction

The integrated models are for academic research and technical demonstration only. They are not approved for clinical deployment, clinical decisions, operational alerts, or patient-care actions. The subsequent-visit target is a proxy and must not be described as confirmed readmission.

## Related documentation

- [Portable XGBoost integration notes](XGBOOST_INTEGRATION_README.txt)
- [Backend deployment handoff](DEPLOYMENT_HANDOFF.md)
- [V2 modeling research and held-out evaluation](../predictive%20model/St_Hubert_V2/README.md)
