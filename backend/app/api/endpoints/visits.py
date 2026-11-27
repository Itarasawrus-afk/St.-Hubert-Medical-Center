
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text

from app.database.connection import engine

router = APIRouter()


# ============================================================
# VISIT FILTER OPTIONS
# ============================================================

@router.get("/filters")
def get_visit_filters():
    try:
        with engine.connect() as connection:
            date_range = connection.execute(
                text("""
                    SELECT
                        MIN(VIS_EN) AS minimum_admission_date,
                        MAX(VIS_EN) AS maximum_admission_date
                    FROM vw_visit_los
                    WHERE VIS_EN IS NOT NULL
                """)
            ).mappings().one()

            visit_types = connection.execute(
                text("""
                    SELECT DISTINCT VTYPE_DES
                    FROM vw_visit_los
                    WHERE VTYPE_DES IS NOT NULL
                      AND TRIM(VTYPE_DES) <> ''
                    ORDER BY VTYPE_DES
                """)
            ).scalars().all()

            statuses = connection.execute(
                text("""
                    SELECT DISTINCT VSTAT_DES
                    FROM vw_visit_los
                    WHERE VSTAT_DES IS NOT NULL
                      AND TRIM(VSTAT_DES) <> ''
                    ORDER BY VSTAT_DES
                """)
            ).scalars().all()

        minimum_date = date_range["minimum_admission_date"]
        maximum_date = date_range["maximum_admission_date"]

        return {
            "success": True,
            "data": {
                "minimum_admission_date": (
                    minimum_date.date().isoformat()
                    if hasattr(minimum_date, "date")
                    else minimum_date.isoformat()
                    if minimum_date else None
                ),
                "maximum_admission_date": (
                    maximum_date.date().isoformat()
                    if hasattr(maximum_date, "date")
                    else maximum_date.isoformat()
                    if maximum_date else None
                ),
                "visit_types": visit_types,
                "statuses": statuses
            },
            "message": "Visit filter options retrieved successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve visit filter options: {str(error)}"
        )


# ============================================================
# VISIT RECORDS
# ============================================================

@router.get("")
def get_visits(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    visit_type: Optional[str] = Query(None)
):
    filters = """
        WHERE (:start_date IS NULL OR VIS_EN >= :start_date)
          AND (:end_date IS NULL OR VIS_EN < DATE_ADD(:end_date, INTERVAL 1 DAY))
          AND (:status IS NULL OR VSTAT_DES = :status)
          AND (:visit_type IS NULL OR VTYPE_DES = :visit_type)
    """

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "status": status,
        "visit_type": visit_type,
        "limit": page_size,
        "offset": (page - 1) * page_size
    }

    try:
        with engine.connect() as connection:
            total = connection.execute(
                text(f"""
                    SELECT COUNT(*)
                    FROM vw_visit_los
                    {filters}
                """),
                params
            ).scalar_one()

            records = connection.execute(
                text(f"""
                    SELECT
                        VISIT_ID,
                        VIS_EN,
                        VIS_EX,
                        VSTAT_DES,
                        VTYPE_DES,
                        LOS_DAYS,
                        LOS_HOURS
                    FROM vw_visit_los
                    {filters}
                    ORDER BY VIS_EN DESC
                    LIMIT :limit OFFSET :offset
                """),
                params
            ).mappings().all()

        return {
            "success": True,
            "data": [
                {
                    "visit_id": row["VISIT_ID"],
                    "admission_date": (
                        row["VIS_EN"].isoformat()
                        if row["VIS_EN"] else None
                    ),
                    "exit_date": (
                        row["VIS_EX"].isoformat()
                        if row["VIS_EX"] else None
                    ),
                    "status": row["VSTAT_DES"],
                    "visit_type": row["VTYPE_DES"],
                    "los_days": (
                        float(row["LOS_DAYS"])
                        if row["LOS_DAYS"] is not None else None
                    ),
                    "los_hours": row["LOS_HOURS"]
                }
                for row in records
            ],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_records": total,
                "total_pages": (
                    (total + page_size - 1) // page_size
                )
            },
            "message": "Visit records retrieved successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve visits: {str(error)}"
        )


# ============================================================
# LENGTH OF STAY SUMMARY
# Applies the same filters as the visit records table.
# ============================================================

@router.get("/los-summary")
def get_los_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    visit_type: Optional[str] = Query(None)
):
    query = text("""
        SELECT
            COUNT(*) AS total_visits,
            ROUND(AVG(LOS_DAYS), 2) AS average_los_days,
            ROUND(MIN(LOS_DAYS), 2) AS minimum_los_days,
            ROUND(MAX(LOS_DAYS), 2) AS maximum_los_days,

            SUM(
                CASE WHEN LOS_DAYS > 30 THEN 1 ELSE 0 END
            ) AS stays_over_30_days,

            SUM(
                CASE WHEN LOS_DAYS > 90 THEN 1 ELSE 0 END
            ) AS stays_over_90_days

        FROM vw_visit_los

        WHERE (:start_date IS NULL OR VIS_EN >= :start_date)
          AND (:end_date IS NULL OR VIS_EN < DATE_ADD(:end_date, INTERVAL 1 DAY))
          AND (:status IS NULL OR VSTAT_DES = :status)
          AND (:visit_type IS NULL OR VTYPE_DES = :visit_type)
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(
                query,
                {
                    "start_date": start_date,
                    "end_date": end_date,
                    "status": status,
                    "visit_type": visit_type
                }
            ).mappings().one()

        return {
            "success": True,
            "data": {
                "total_visits": result["total_visits"],
                "average_los_days": float(
                    result["average_los_days"] or 0
                ),
                "minimum_los_days": float(
                    result["minimum_los_days"] or 0
                ),
                "maximum_los_days": float(
                    result["maximum_los_days"] or 0
                ),
                "stays_over_30_days": (
                    result["stays_over_30_days"] or 0
                ),
                "stays_over_90_days": (
                    result["stays_over_90_days"] or 0
                ),
                "interpretation_note": (
                    "Source-derived LOS values. Validate visit timestamp "
                    "definitions before using as hospital performance indicators."
                )
            },
            "message": "Length-of-stay summary retrieved successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve LOS summary: {str(error)}"
        )


# ============================================================
# FILTERED DAILY PATIENT FLOW
# Applies the same filters as the visit records table.
# Counts visit entries by admission date.
# ============================================================

@router.get("/patient-flow")
def get_patient_flow(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    visit_type: Optional[str] = Query(None)
):
    query = text("""
        SELECT
            DATE(VIS_EN) AS flow_date,
            COUNT(*) AS visit_entries
        FROM vw_visit_los
        WHERE VIS_EN IS NOT NULL
          AND (:start_date IS NULL OR VIS_EN >= :start_date)
          AND (:end_date IS NULL OR VIS_EN < DATE_ADD(:end_date, INTERVAL 1 DAY))
          AND (:status IS NULL OR VSTAT_DES = :status)
          AND (:visit_type IS NULL OR VTYPE_DES = :visit_type)
        GROUP BY DATE(VIS_EN)
        ORDER BY flow_date
    """)

    try:
        with engine.connect() as connection:
            records = connection.execute(
                query,
                {
                    "start_date": start_date,
                    "end_date": end_date,
                    "status": status,
                    "visit_type": visit_type
                }
            ).mappings().all()

        return {
            "success": True,
            "data": [
                {
                    "flow_date": (
                        row["flow_date"].isoformat()
                        if row["flow_date"] else None
                    ),
                    "visit_entries": int(row["visit_entries"])
                }
                for row in records
            ],
            "message": "Filtered daily patient flow retrieved successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve patient flow: {str(error)}"
        )
