from functools import lru_cache
from pathlib import Path

from app.ml.portable_pipeline import load_portable_pipeline

PACKAGE_ROOT = Path(__file__).resolve().parents[2] / "model_artifacts" / "xgboost_portable"


@lru_cache(maxsize=1)
def get_xgboost_models():
    """Load both verified portable XGBoost pipelines once per API process."""
    los_model = load_portable_pipeline(
        package_root=PACKAGE_ROOT, task="los", model_format="ubj"
    )
    subsequent_visit_model = load_portable_pipeline(
        package_root=PACKAGE_ROOT, task="subsequent_visit", model_format="ubj"
    )
    return {"los": los_model, "subsequent_visit": subsequent_visit_model}
