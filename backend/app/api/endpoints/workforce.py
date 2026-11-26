from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from decimal import Decimal

from app.database.connection import SessionLocal

router = APIRouter()


def convert_decimals(record):
    """Convert Decimal values to JSON-compatible floats."""
    if record is None:
        return None

    return {
        key: float(value) if isinstance(value, Decimal) else value
        for key, value in record.items()
    }


@router.get("/summary")
def get_workforce_summary():
    db = SessionLocal()

    try:
        query = text("""
            SELECT
                COUNT(*) AS total_departments,
                COALESCE(SUM(staff_records), 0) AS total_staff_records,
                COALESCE(SUM(distinct_staff_members), 0)
                    AS total_department_staff_members,
                COALESCE(SUM(sum_recorded_annual_salary), 0)
                    AS total_recorded_annual_salary,
                COALESCE(SUM(sum_recorded_monthly_salary), 0)
                    AS total_recorded_monthly_salary
            FROM vw_department_workforce
        """)

        result = db.execute(query).mappings().first()

        return {
            "success": True,
            "data": convert_decimals(dict(result)),
            "message": "Workforce summary retrieved successfully."
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve workforce summary."
        )

    finally:
        db.close()


@router.get("/departments")
def get_workforce_departments():
    db = SessionLocal()

    try:
        query = text("""
            SELECT
                DEP_ID,
                DEP_NAME,
                DEP_LOC,
                distinct_staff_members,
                staff_records,
                sum_recorded_annual_salary,
                sum_recorded_monthly_salary
            FROM vw_department_workforce
            ORDER BY distinct_staff_members DESC
        """)

        results = db.execute(query).mappings().all()

        departments = [
            convert_decimals(dict(row))
            for row in results
        ]

        return {
            "success": True,
            "data": departments,
            "message": "Department workforce records retrieved successfully."
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve department workforce records."
        )

    finally:
        db.close()