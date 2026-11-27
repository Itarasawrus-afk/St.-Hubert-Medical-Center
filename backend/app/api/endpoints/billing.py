
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text

from app.database.connection import engine

router = APIRouter()


@router.get("/summary")
def get_billing_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    query = text("""
        SELECT
            SUM(bill_count) AS total_billing_records,
            SUM(distinct_patients_billed) AS patient_billing_group_count,
            SUM(total_billed_amount) AS total_billed_amount,
            CASE
                WHEN SUM(bill_count) > 0
                THEN SUM(total_billed_amount) / SUM(bill_count)
                ELSE 0
            END AS average_bill_amount
        FROM vw_billing_summary
        WHERE (:start_date IS NULL OR BILL_DATE >= :start_date)
          AND (:end_date IS NULL OR BILL_DATE <= :end_date)
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(
                query,
                {
                    "start_date": start_date,
                    "end_date": end_date
                }
            ).mappings().one()

        return {
            "success": True,
            "data": {
                "total_billing_records": result["total_billing_records"] or 0,
                "patient_billing_group_count": result["patient_billing_group_count"] or 0,
                "total_billed_amount": float(result["total_billed_amount"] or 0),
                "average_bill_amount": float(result["average_bill_amount"] or 0)
            },
            "message": "Billing summary retrieved successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve billing summary: {str(error)}"
        )


@router.get("/trends")
def get_billing_trends(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    query = text("""
        SELECT
            BILL_DATE,
            SUM(bill_count) AS bill_count,
            SUM(total_billed_amount) AS total_billed_amount,
            SUM(average_bill_amount * bill_count)
                / NULLIF(SUM(bill_count), 0) AS average_bill_amount
        FROM vw_billing_summary
        WHERE (:start_date IS NULL OR BILL_DATE >= :start_date)
          AND (:end_date IS NULL OR BILL_DATE <= :end_date)
        GROUP BY BILL_DATE
        ORDER BY BILL_DATE
    """)

    try:
        with engine.connect() as connection:
            results = connection.execute(
                query,
                {
                    "start_date": start_date,
                    "end_date": end_date
                }
            ).mappings().all()

        return {
            "success": True,
            "data": [
                {
                    "billing_date": row["BILL_DATE"].isoformat(),
                    "bill_count": row["bill_count"],
                    "total_billed_amount": float(row["total_billed_amount"] or 0),
                    "average_bill_amount": float(row["average_bill_amount"] or 0)
                }
                for row in results
            ],
            "message": "Billing trends retrieved successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve billing trends: {str(error)}"
        )
