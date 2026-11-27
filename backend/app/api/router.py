
from fastapi import APIRouter

from app.api.endpoints import overview
from app.api.endpoints import billing
from app.api.endpoints import visits
from app.api.endpoints import inventory
from app.api.endpoints import workforce
from app.api.endpoints import patients
from app.api.endpoints import models

api_router = APIRouter()

api_router.include_router(
    overview.router,
    prefix="/overview",
    tags=["Overview"]
)

api_router.include_router(
    billing.router,
    prefix="/billing",
    tags=["Billing"]
)

api_router.include_router(
    visits.router,
    prefix="/visits",
    tags=["Visits"]
)

api_router.include_router(
    inventory.router,
    prefix="/inventory",
    tags=["Inventory"]
)

api_router.include_router(
    workforce.router,
    prefix="/workforce",
    tags=["Workforce"]
)

api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["Patients"]
)

api_router.include_router(
    models.router,
    prefix="/models",
    tags=["Research Models"]
)
