
import secrets
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from pydantic import field_validator
from app.database.connection import engine

router = APIRouter()


# ==================================================
# PATIENT INPUT SCHEMAS
# ==================================================

GENDER_MAPPING = {
    0: "Male",
    1: "Female",
    2: "Other"
}


class PatientCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)

    middle_name: Optional[str] = Field(default=None, max_length=50)

    gender_code: Optional[int] = Field(default=None, ge=0, le=2)
    date_of_birth: Optional[date] = None

    contact_number: Optional[str] = Field(default=None, max_length=30)
    email_address: Optional[str] = Field(default=None, max_length=150)

    emergency_first_name: Optional[str] = Field(default=None, max_length=50)
    emergency_middle_name: Optional[str] = Field(default=None, max_length=50)
    emergency_last_name: Optional[str] = Field(default=None, max_length=50)
    emergency_contact_number: Optional[str] = Field(default=None, max_length=30)

    blood_type: Optional[str] = Field(default=None, max_length=10)
    marital_status: Optional[str] = Field(default=None, max_length=30)

    national_id_series: Optional[str] = Field(default=None, max_length=50)
    national_id_type: Optional[str] = Field(default=None, max_length=50)
    national_id_number: Optional[str] = Field(default=None, max_length=100)
    national_id_expiry: Optional[date] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    middle_name: Optional[str] = Field(default=None, max_length=50)

    gender_code: Optional[int] = Field(default=None, ge=0, le=2)
    date_of_birth: Optional[date] = None

    contact_number: Optional[str] = Field(default=None, max_length=30)
    email_address: Optional[str] = Field(default=None, max_length=150)

    emergency_first_name: Optional[str] = Field(default=None, max_length=50)
    emergency_middle_name: Optional[str] = Field(default=None, max_length=50)
    emergency_last_name: Optional[str] = Field(default=None, max_length=50)
    emergency_contact_number: Optional[str] = Field(default=None, max_length=30)

    blood_type: Optional[str] = Field(default=None, max_length=10)
    marital_status: Optional[str] = Field(default=None, max_length=30)

    national_id_series: Optional[str] = Field(default=None, max_length=50)
    national_id_type: Optional[str] = Field(default=None, max_length=50)
    national_id_number: Optional[str] = Field(default=None, max_length=100)
    national_id_expiry: Optional[date] = None

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value):
        if value is not None and value > date.today():
            raise ValueError("Date of birth cannot be in the future.")
        return value

    @field_validator("marital_status")
    @classmethod
    def validate_marital_status(cls, value):
        if value is not None:
            value = value.strip()

            if value == "":
                return None

            allowed_values = {"Married", "Unmarried"}

            if value not in allowed_values:
                raise ValueError(
                    "Marital status must be Married or Unmarried."
                )

        return value


# ==================================================
# DATABASE FIELD MAPPINGS
# ==================================================

FIELD_MAPPING = {
    "first_name": "F_NAME",
    "middle_name": "M_NAME",
    "last_name": "L_NAME",
    "date_of_birth": "DT_BRT",
    "contact_number": "CON_NO",
    "email_address": "EM_ADD",
    "emergency_first_name": "EC_F_NAME",
    "emergency_middle_name": "EC_M_NAME",
    "emergency_last_name": "EC_L_NAME",
    "emergency_contact_number": "EC_CON_NO",
    "blood_type": "B_TYPE",
    "marital_status": "MAR_ST",
    "national_id_series": "NAT_ID_S",
    "national_id_type": "NAT_ID_T",
    "national_id_number": "NAT_ID_N",
    "national_id_expiry": "NAT_ID_E",
}


# ==================================================
# PATIENT ID GENERATION
# ==================================================

def generate_patient_id(connection):
    """
    Generates a new 20-character patient ID:
    SH + 18 hexadecimal characters.
    Existing patient IDs are never modified.
    """

    for _ in range(10):
        patient_id = "SH" + secrets.token_hex(9).upper()

        existing = connection.execute(
            text("""
                SELECT 1
                FROM patn
                WHERE PAT_ID = :patient_id
                LIMIT 1
            """),
            {"patient_id": patient_id}
        ).first()

        if existing is None:
            return patient_id

    raise HTTPException(
        status_code=500,
        detail="Unable to generate a unique patient ID."
    )


# ==================================================
# PATIENT SUMMARY
# Existing cached implementation retained
# ==================================================

@router.get("/")
def patient_summary():

    query = text("""
        SELECT
            COUNT(*) AS total_patients,
            SUM(eligible_completed_visits) AS total_eligible_visits,
            SUM(visits_followed_by_30d_subsequent_visit)
                AS total_subsequent_visits,
            ROUND(
                AVG(pct_visits_followed_by_30d_subsequent_visit),
                2
            ) AS average_patient_subsequent_visit_rate,
            ROUND(
                SUM(visits_followed_by_30d_subsequent_visit)
                / NULLIF(SUM(eligible_completed_visits), 0) * 100,
                2
            ) AS overall_visit_subsequent_rate
        FROM patient_30d_visit_summary_cache
    """)

    with engine.connect() as connection:
        result = connection.execute(query).mappings().one()

    return {
        "success": True,
        "data": dict(result),
        "message": "Patient summary retrieved successfully."
    }


# ==================================================
# CREATE PATIENT
# POST /patients/
# ==================================================

@router.post("/", status_code=201)
def create_patient(
    patient: PatientCreate,
    updated_by: str = Query(default="DEMO_ADMIN", max_length=100)
):

    data = patient.model_dump()

    if data["gender_code"] is not None:
        data["gender_description"] = GENDER_MAPPING[data["gender_code"]]
    else:
        data["gender_description"] = None

    insert_query = text("""
        INSERT INTO patn (
            PAT_ID,
            F_NAME,
            M_NAME,
            L_NAME,
            GEN_CD,
            GEN_DES,
            DT_BRT,
            CON_NO,
            EM_ADD,
            EC_F_NAME,
            EC_M_NAME,
            EC_L_NAME,
            EC_CON_NO,
            B_TYPE,
            MAR_ST,
            NAT_ID_S,
            NAT_ID_T,
            NAT_ID_N,
            NAT_ID_E
        )
        VALUES (
            :patient_id,
            :first_name,
            :middle_name,
            :last_name,
            :gender_code,
            :gender_description,
            :date_of_birth,
            :contact_number,
            :email_address,
            :emergency_first_name,
            :emergency_middle_name,
            :emergency_last_name,
            :emergency_contact_number,
            :blood_type,
            :marital_status,
            :national_id_series,
            :national_id_type,
            :national_id_number,
            :national_id_expiry
        )
    """)

    status_query = text("""
        INSERT INTO patient_record_status (
            PAT_ID,
            IS_ACTIVE,
            UPDATED_BY
        )
        VALUES (
            :patient_id,
            1,
            :updated_by
        )
    """)

    try:
        with engine.begin() as connection:

            patient_id = generate_patient_id(connection)

            parameters = {
                "patient_id": patient_id,
                **data
            }

            connection.execute(insert_query, parameters)

            connection.execute(
                status_query,
                {
                    "patient_id": patient_id,
                    "updated_by": updated_by
                }
            )

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Patient could not be created because of a database conflict."
        )

    return {
        "success": True,
        "data": {
            "patient_id": patient_id,
            "is_active": True
        },
        "message": "Patient created successfully."
    }


# ==================================================
# PATIENT DIRECTORY
# Register before /{patient_id}
# ==================================================


@router.get("/directory")
def patient_directory(
    search: str = Query(default="", max_length=100),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: str = Query(default="active"),
    gender: str = Query(default=""),
    sort_by: str = Query(default="patient_id"),
    sort_order: str = Query(default="asc")
):
    # Validate filter parameters
    if status not in {"active", "inactive", "all"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid patient status filter."
        )

    if gender not in {"", "Male", "Female", "Other"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid gender filter."
        )

    # Whitelist sort columns to prevent SQL injection
    sort_columns = {
        "patient_id": "p.PAT_ID",
        "name": """
            LOWER(CONCAT(
                COALESCE(p.F_NAME, ''), ' ',
                COALESCE(p.M_NAME, ''), ' ',
                COALESCE(p.L_NAME, '')
            ))
        """,
        "date_of_birth": "p.DT_BRT"
    }

    if sort_by not in sort_columns:
        raise HTTPException(
            status_code=400,
            detail="Invalid sorting field."
        )

    if sort_order not in {"asc", "desc"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid sorting order."
        )

    offset = (page - 1) * page_size
    search_value = search.strip()

    conditions = []
    params = {
        "limit": page_size,
        "offset": offset
    }

    # Record status filter
    if status == "active":
        conditions.append("COALESCE(prs.IS_ACTIVE, 1) = 1")

    elif status == "inactive":
        conditions.append("COALESCE(prs.IS_ACTIVE, 1) = 0")

    # Gender filter
    if gender:
        conditions.append("p.GEN_DES = :gender")
        params["gender"] = gender

    # Search filter
    if search_value:
        conditions.append("""
            (
                p.PAT_ID LIKE :search
                OR p.F_NAME LIKE :search
                OR p.M_NAME LIKE :search
                OR p.L_NAME LIKE :search
                OR CONCAT(
                    COALESCE(p.F_NAME, ''), ' ',
                    COALESCE(p.M_NAME, ''), ' ',
                    COALESCE(p.L_NAME, '')
                ) LIKE :search
            )
        """)

        params["search"] = f"%{search_value}%"

    filters = (
        "WHERE " + " AND ".join(conditions)
        if conditions else ""
    )

    sort_column = sort_columns[sort_by]
    direction = sort_order.upper()

    count_query = text(f"""
        SELECT COUNT(*)
        FROM patn p
        LEFT JOIN patient_record_status prs
            ON p.PAT_ID = prs.PAT_ID
        {filters}
    """)

    data_query = text(f"""
        SELECT
            p.PAT_ID,
            p.F_NAME,
            p.M_NAME,
            p.L_NAME,
            p.GEN_DES,
            p.DT_BRT,
            p.CON_NO,
            p.EM_ADD,
            p.MAR_ST,
            p.NAT_ID_N,
            COALESCE(prs.IS_ACTIVE, 1) AS IS_ACTIVE
        FROM patn p
        LEFT JOIN patient_record_status prs
            ON p.PAT_ID = prs.PAT_ID
        {filters}
        ORDER BY
            {sort_column} {direction},
            p.PAT_ID ASC
        LIMIT :limit OFFSET :offset
    """)

    with engine.connect() as connection:
        total = connection.execute(
            count_query,
            params
        ).scalar_one()

        rows = connection.execute(
            data_query,
            params
        ).mappings().all()

    return {
        "success": True,
        "data": [dict(row) for row in rows],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total,
            "total_pages": (
                (total + page_size - 1) // page_size
            )
        },
        "message": "Patient directory retrieved successfully."
    }



# ==================================================
# UPDATE PATIENT
# PUT /patients/{patient_id}
# ==================================================

@router.put("/{patient_id}")
def update_patient(
    patient_id: str,
    patient: PatientUpdate
):

    updates = patient.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No patient fields were provided for updating."
        )

    sql_updates = {}
    parameters = {"patient_id": patient_id}

    for field, value in updates.items():

        if field == "gender_code":
            if value is not None:
                sql_updates["GEN_CD"] = value
                sql_updates["GEN_DES"] = GENDER_MAPPING[value]
            else:
                sql_updates["GEN_CD"] = None
                sql_updates["GEN_DES"] = None

        elif field in FIELD_MAPPING:
            column = FIELD_MAPPING[field]
            sql_updates[column] = value

    if not sql_updates:
        raise HTTPException(
            status_code=400,
            detail="No valid patient fields were provided."
        )

    assignments = []

    for index, (column, value) in enumerate(sql_updates.items()):
        parameter_name = f"value_{index}"
        assignments.append(f"{column} = :{parameter_name}")
        parameters[parameter_name] = value

    update_query = text(f"""
        UPDATE patn
        SET {", ".join(assignments)}
        WHERE PAT_ID = :patient_id
    """)

    with engine.begin() as connection:

        exists = connection.execute(
            text("""
                SELECT 1
                FROM patn
                WHERE PAT_ID = :patient_id
            """),
            {"patient_id": patient_id}
        ).first()

        if exists is None:
            raise HTTPException(
                status_code=404,
                detail="Patient record not found."
            )

        connection.execute(update_query, parameters)

    return {
        "success": True,
        "data": {
            "patient_id": patient_id,
            "updated_fields": list(updates.keys())
        },
        "message": "Patient record updated successfully."
    }


# ==================================================
# DEACTIVATE PATIENT
# PATCH /patients/{patient_id}/deactivate
# ==================================================

@router.patch("/{patient_id}/deactivate")
def deactivate_patient(
    patient_id: str,
    updated_by: str = Query(default="DEMO_ADMIN", max_length=100)
):

    with engine.begin() as connection:

        exists = connection.execute(
            text("""
                SELECT 1
                FROM patn
                WHERE PAT_ID = :patient_id
            """),
            {"patient_id": patient_id}
        ).first()

        if exists is None:
            raise HTTPException(
                status_code=404,
                detail="Patient record not found."
            )

        connection.execute(
            text("""
                INSERT INTO patient_record_status (
                    PAT_ID,
                    IS_ACTIVE,
                    UPDATED_BY
                )
                VALUES (
                    :patient_id,
                    0,
                    :updated_by
                )
                ON DUPLICATE KEY UPDATE
                    IS_ACTIVE = 0,
                    UPDATED_BY = :updated_by
            """),
            {
                "patient_id": patient_id,
                "updated_by": updated_by
            }
        )

    return {
        "success": True,
        "data": {
            "patient_id": patient_id,
            "is_active": False
        },
        "message": "Patient deactivated successfully."
    }


# ==================================================
# REACTIVATE PATIENT
# PATCH /patients/{patient_id}/reactivate
# ==================================================

@router.patch("/{patient_id}/reactivate")
def reactivate_patient(
    patient_id: str,
    updated_by: str = Query(default="DEMO_ADMIN", max_length=100)
):

    with engine.begin() as connection:

        exists = connection.execute(
            text("""
                SELECT 1
                FROM patn
                WHERE PAT_ID = :patient_id
            """),
            {"patient_id": patient_id}
        ).first()

        if exists is None:
            raise HTTPException(
                status_code=404,
                detail="Patient record not found."
            )

        connection.execute(
            text("""
                INSERT INTO patient_record_status (
                    PAT_ID,
                    IS_ACTIVE,
                    UPDATED_BY
                )
                VALUES (
                    :patient_id,
                    1,
                    :updated_by
                )
                ON DUPLICATE KEY UPDATE
                    IS_ACTIVE = 1,
                    UPDATED_BY = :updated_by
            """),
            {
                "patient_id": patient_id,
                "updated_by": updated_by
            }
        )

    return {
        "success": True,
        "data": {
            "patient_id": patient_id,
            "is_active": True
        },
        "message": "Patient reactivated successfully."
    }


# ==================================================
# PATIENT RECORD DETAIL
# ==================================================

@router.get("/{patient_id}/record")
def get_patient_record(patient_id: str):

    patient_query = text("""
        SELECT
            p.PAT_ID,
            p.F_NAME,
            p.M_NAME,
            p.L_NAME,
            p.GEN_CD,
            p.GEN_DES,
            p.DT_BRT,
            p.CON_NO,
            p.EM_ADD,
            p.EC_F_NAME,
            p.EC_M_NAME,
            p.EC_L_NAME,
            p.EC_CON_NO,
            p.MAR_ST,
            p.NAT_ID_S,
            p.NAT_ID_T,
            p.NAT_ID_N,
            p.NAT_ID_E,
            COALESCE(prs.IS_ACTIVE, 1) AS IS_ACTIVE
        FROM patn p
        LEFT JOIN patient_record_status prs
            ON p.PAT_ID = prs.PAT_ID
        WHERE p.PAT_ID = :patient_id
    """)

    visits_query = text("""
        SELECT
            VISIT_ID,
            VIS_EN,
            VIS_EX,
            VSTAT_CD,
            VSTAT_DES,
            VTYPE_CD,
            VTYPE_DES,
            ROM_ID
        FROM vist
        WHERE PAT_ID = :patient_id
        ORDER BY VIS_EN DESC
        LIMIT 100
    """)

    summary_query = text("""
        SELECT
            PAT_ID,
            eligible_completed_visits,
            visits_followed_by_30d_subsequent_visit,
            pct_visits_followed_by_30d_subsequent_visit
        FROM patient_30d_visit_summary_cache
        WHERE PAT_ID = :patient_id
    """)

    with engine.connect() as connection:

        patient = connection.execute(
            patient_query,
            {"patient_id": patient_id}
        ).mappings().first()

        if patient is None:
            raise HTTPException(
                status_code=404,
                detail="Patient record not found."
            )

        visits = connection.execute(
            visits_query,
            {"patient_id": patient_id}
        ).mappings().all()

        summary = connection.execute(
            summary_query,
            {"patient_id": patient_id}
        ).mappings().first()

    return {
        "success": True,
        "data": {
            "patient": dict(patient),
            "visits": [dict(row) for row in visits],
            "subsequent_visit_summary": (
                dict(summary) if summary else None
            )
        },
        "message": "Patient record retrieved successfully."
    }


# ==================================================
# EXISTING PATIENT SUBSEQUENT-VISIT SUMMARY
# ==================================================

@router.get("/{patient_id}")
def get_patient_summary(patient_id: str):

    query = text("""
        SELECT
            PAT_ID,
            eligible_completed_visits,
            visits_followed_by_30d_subsequent_visit,
            pct_visits_followed_by_30d_subsequent_visit
        FROM patient_30d_visit_summary_cache
        WHERE PAT_ID = :patient_id
    """)

    patient_check = text("""
        SELECT PAT_ID
        FROM patn
        WHERE PAT_ID = :patient_id
    """)

    with engine.connect() as connection:
        patient = connection.execute(
            patient_check,
            {"patient_id": patient_id}
        ).first()

        if patient is None:
            raise HTTPException(
                status_code=404,
                detail="Patient record not found."
            )

        result = connection.execute(
            query,
            {"patient_id": patient_id}
        ).mappings().first()

    return {
        "success": True,
        "data": dict(result) if result else None,
        "message": "Patient summary retrieved successfully."
    }
