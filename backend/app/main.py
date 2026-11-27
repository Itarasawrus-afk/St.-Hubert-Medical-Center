
from fastapi import FastAPI
from app.api.router import api_router
from app.database.connection import test_connection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="St. Hubert Medical Center API",
    description="Healthcare Intelligence and Analytics Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "success": True,
        "message": "St. Hubert Medical Center API is running."
    }


@app.get("/health")
def health_check():
    try:
        database = test_connection()

        return {
            "success": True,
            "api_status": "healthy",
            "database_status": "connected",
            "database": database
        }

    except Exception:
        return {
            "success": False,
            "api_status": "running",
            "database_status": "disconnected"
        }
