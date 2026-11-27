
from fastapi import APIRouter, Query
from sqlalchemy import text

from app.database.connection import engine

router = APIRouter()


@router.get("/summary")
def inventory_summary():
    query = text("""
        SELECT
            COUNT(*) AS total_movement_records,
            COUNT(DISTINCT MAT_SKU) AS unique_materials,
            MIN(MOVEMENT_DATE) AS earliest_movement,
            MAX(MOVEMENT_DATE) AS latest_movement,
            SUM(RECEIVED_QUANTITY) AS total_received,
            SUM(ISSUED_QUANTITY) AS total_issued,
            SUM(CLOSED_QUANTITY) AS total_closing_quantity
        FROM vw_inventory_daily_movement
    """)

    with engine.connect() as connection:
        result = connection.execute(query).mappings().one()

    return {
        "success": True,
        "data": dict(result),
        "message": "Inventory summary retrieved successfully."
    }


@router.get("/movements")
def inventory_movements(
    start_date: str | None = None,
    end_date: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    filters = []
    params = {
        "limit": page_size,
        "offset": (page - 1) * page_size
    }

    if start_date:
        filters.append("MOVEMENT_DATE >= :start_date")
        params["start_date"] = start_date

    if end_date:
        filters.append("MOVEMENT_DATE <= :end_date")
        params["end_date"] = end_date

    where_clause = (
        "WHERE " + " AND ".join(filters)
        if filters else ""
    )

    count_query = text(f"""
        SELECT COUNT(*)
        FROM vw_inventory_daily_movement
        {where_clause}
    """)

    data_query = text(f"""
        SELECT
            MOVEMENT_DATE,
            MAT_SKU,
            INVENTORY_RECORDS,
            OPENING_QUANTITY,
            RECEIVED_QUANTITY,
            ISSUED_QUANTITY,
            CLOSED_QUANTITY
        FROM vw_inventory_daily_movement
        {where_clause}
        ORDER BY MOVEMENT_DATE DESC, MAT_SKU
        LIMIT :limit OFFSET :offset
    """)

    with engine.connect() as connection:
        total_records = connection.execute(
            count_query, params
        ).scalar_one()

        rows = connection.execute(
            data_query, params
        ).mappings().all()

    return {
        "success": True,
        "data": [dict(row) for row in rows],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": (
                (total_records + page_size - 1) // page_size
            )
        },
        "message": "Inventory movements retrieved successfully."
    }
