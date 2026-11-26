from typing import Optional

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.services.portable_models import get_xgboost_models

router = APIRouter()


class PredictionInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    AGE_AT_VISIT: Optional[float] = Field(default=None, ge=0, le=120)
    GENDER: Optional[str] = None
    VISIT_TYPE: Optional[str] = None
    ADMISSION_MONTH: Optional[float] = Field(default=None, ge=1, le=12)
    ADMISSION_WEEKDAY: Optional[float] = Field(default=None, ge=0, le=6)
    ADMISSION_HOUR: Optional[float] = Field(default=None, ge=0, le=23)
    PRIOR_VISIT_COUNT: Optional[float] = Field(default=None, ge=0)


def _to_frame(payload: PredictionInput) -> pd.DataFrame:
    return pd.DataFrame([payload.model_dump()])


@router.get("/xgboost/status")
def xgboost_status():
    try:
        models = get_xgboost_models()
        return {
            "success": True,
            "status": "loaded",
            "models": {"los": models["los"].task, "subsequent_visit": models["subsequent_visit"].task},
            "format": "ubj",
            "research_only": True,
            "clinical_deployment_approved": False,
            "operational_alerts_approved": False,
        }
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Portable XGBoost models unavailable: {error}")


@router.post("/xgboost/los/predict")
def predict_los(payload: PredictionInput):
    try:
        model = get_xgboost_models()["los"]
        prediction = float(model.predict(_to_frame(payload))[0])
        return {
            "success": True,
            "task": "los",
            "prediction": prediction,
            "unit": "days",
            "model": "XGBoost",
            "inference_format": "UBJSON",
            "research_only": True,
            "clinical_use": False,
        }
    except Exception as error:
        raise HTTPException(status_code=422, detail=f"LOS prediction failed: {error}")


@router.post("/xgboost/subsequent-visit/predict")
def predict_subsequent_visit(payload: PredictionInput):
    try:
        model = get_xgboost_models()["subsequent_visit"]
        frame = _to_frame(payload)
        probability = float(model.predict_proba(frame)[0, 1])
        standard_decision = int(model.predict(frame)[0])
        experimental_decision = int(model.predict_frozen_threshold(frame)[0])
        return {
            "success": True,
            "task": "subsequent_visit",
            "positive_class_probability": probability,
            "standard_decision": standard_decision,
            "frozen_experimental_threshold": float(model.frozen_threshold),
            "frozen_threshold_decision": experimental_decision,
            "outcome_definition": "30-day subsequent-visit proxy; not confirmed readmission",
            "model": "XGBoost",
            "inference_format": "UBJSON",
            "research_only": True,
            "clinical_use": False,
            "operational_alerts_approved": False,
        }
    except Exception as error:
        raise HTTPException(status_code=422, detail=f"Subsequent-visit prediction failed: {error}")
