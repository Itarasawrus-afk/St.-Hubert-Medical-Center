
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from app.database.connection import engine
from datetime import date
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
import logging
import time

router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    force=True
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ============================================================
# EXECUTIVE DASHBOARD OVERVIEW
# ============================================================

@router.get("")
def get_overview():
    start_time = time.perf_counter()

    query = text("""
        SELECT
            (SELECT COUNT(*) FROM patn) AS total_patients,
            (SELECT COUNT(*) FROM vist) AS total_visits,
            (SELECT COUNT(*) FROM appt) AS total_appointments,
            (SELECT COUNT(*) FROM bill) AS total_billing_records
    """)

    try:
        with engine.connect() as connection:
            row = connection.execute(query).mappings().one()

        data = {
            "total_patients": row["total_patients"],
            "total_visits": row["total_visits"],
            "total_appointments": row["total_appointments"],
            "total_billing_records": row["total_billing_records"]
        }

        elapsed = time.perf_counter() - start_time

        logger.info(
            "OVERVIEW query completed in %.3f seconds",
            elapsed
        )

        return {
            "success": True,
            "data": data,
            "message": "Overview metrics retrieved successfully."
        }

    except Exception:
        logger.exception("OVERVIEW query failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve overview metrics."
        )


# ============================================================
# OVERVIEW TREND QUERIES
# ============================================================

def execute_trend_query(query_name, sql, params):
    start_time = time.perf_counter()

    try:
        with engine.connect() as connection:
            result = connection.execute(
                text(sql),
                params
            ).mappings().all()

        elapsed = time.perf_counter() - start_time

        logger.info(
            "TRENDS query [%s]: %.3f seconds | Rows: %s",
            query_name,
            elapsed,
            len(result)
        )

        return [dict(row) for row in result]

    except Exception:
        logger.exception(
            "TRENDS query [%s] failed",
            query_name
        )
        raise


# ============================================================
# OVERVIEW TRENDS ENDPOINT
# ============================================================

@router.get("/trends")
def get_overview_trends(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    total_start = time.perf_counter()

    params = {
        "start_date": start_date,
        "end_date": end_date
    }

    flow_query = """
        SELECT
            flow_date,
            visit_entries,
            distinct_patients_entered
        FROM vw_daily_patient_flow
        WHERE
            (:start_date IS NULL OR flow_date >= :start_date)
            AND
            (:end_date IS NULL OR flow_date <= :end_date)
        ORDER BY flow_date
    """

    # Optimized: uses the generated VIS_EX_DATE column
    # and idx_vist_exit_date_patient index.
    exits_query = """
        SELECT
            VIS_EX_DATE AS exit_date,
            COUNT(*) AS visit_exits,
            COUNT(DISTINCT PAT_ID) AS distinct_patients_exited
        FROM vist
        WHERE
            VIS_EX_DATE IS NOT NULL
            AND
            (:start_date IS NULL OR VIS_EX_DATE >= :start_date)
            AND
            (:end_date IS NULL OR VIS_EX_DATE <= :end_date)
        GROUP BY VIS_EX_DATE
        ORDER BY VIS_EX_DATE
    """

    appointments_query = """
        SELECT
            appointment_date,
            appointment_count,
            distinct_patients
        FROM vw_appointment_trends
        WHERE
            (:start_date IS NULL OR appointment_date >= :start_date)
            AND
            (:end_date IS NULL OR appointment_date <= :end_date)
        ORDER BY appointment_date
    """

    try:
        with ThreadPoolExecutor(max_workers=3) as executor:

            flow_future = executor.submit(
                execute_trend_query,
                "patient_flow",
                flow_query,
                params
            )

            exits_future = executor.submit(
                execute_trend_query,
                "visit_exits",
                exits_query,
                params
            )

            appointments_future = executor.submit(
                execute_trend_query,
                "appointment_trends",
                appointments_query,
                params
            )

            flow = flow_future.result()
            exits = exits_future.result()
            appointments = appointments_future.result()

        elapsed = time.perf_counter() - total_start

        logger.info(
            "TRENDS TOTAL: %.3f seconds | "
            "Patient flow: %s | Visit exits: %s | Appointments: %s",
            elapsed,
            len(flow),
            len(exits),
            len(appointments)
        )

        return {
            "success": True,
            "data": {
                "patient_flow": flow,
                "visit_exits": exits,
                "appointment_trends": appointments
            },
            "message": "Overview trends retrieved successfully."
        }

    except Exception:
        logger.exception("OVERVIEW trends query failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve overview trends."
        )
