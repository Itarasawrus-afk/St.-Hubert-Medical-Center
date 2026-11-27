import numpy as np
import pandas as pd


# ==========================================
# 1. SAMPLE DATA (REPLACE WITH YOUR DATAFRAMES)
# ==========================================
np.random.seed(42)
n_visits = 550
start_date = pd.to_datetime("2023-11-01 00:00")
admit_times = [start_date + pd.Timedelta(days=x) for x in np.random.uniform(0, 25, n_visits)]
los_days = np.clip(np.random.gamma(shape=2.5, scale=1.8, size=n_visits), 0.5, 30)
exit_times = [a + pd.Timedelta(days=d) for a, d in zip(admit_times, los_days)]
order_times = [e - pd.Timedelta(hours=h) for e, h in zip(exit_times, np.random.uniform(1, 5, n_visits))]

df_visits = pd.DataFrame({
    "visit_id": range(1001, 1001 + n_visits),
    "patient_id": [f"P{np.random.randint(1, 401)}" for _ in range(n_visits)],
    "ward": np.random.choice(["Cardiology", "Surgery", "ICU", "General Med"], n_visits, p=[0.2, 0.3, 0.1, 0.4]),
    "admit_datetime": admit_times,
    "discharge_order_time": order_times,
    "physical_exit_time": exit_times,
})

df_meds = pd.DataFrame({
    "visit_id": np.random.choice(df_visits["visit_id"], size=n_visits * 4),
    "medication_id": [f"M{np.random.randint(1, 50)}" for _ in range(n_visits * 4)],
})


# ==========================================
# 2. COLUMN & TABLE PROFILING FUNCTION
# ==========================================
SENTINEL_STRINGS = {"", "na", "n/a", "null", "none", "unknown", "-"}


def profile_dataframe(df: pd.DataFrame, table_name: str, key_cols: list[str] | None = None) -> pd.DataFrame:
    print(f"\n{'=' * 75}")
    print(f"DATA PROFILE: {table_name} ({len(df)} rows x {df.shape[1]} columns)")
    print(f"{'=' * 75}")

    exact_dupes = df.duplicated().sum()
    print(f"Exact duplicate rows: {exact_dupes}")

    if key_cols:
        missing_keys = [c for c in key_cols if c not in df.columns]
        if not missing_keys:
            key_dupes = df.duplicated(subset=key_cols).sum()
            key_nulls = df[key_cols].isna().any(axis=1).sum()
            print(f"Candidate/Primary key {key_cols}: {key_dupes} duplicate combinations | {key_nulls} rows with null key parts")

    rows = []
    for col in df.columns:
        s = df[col]
        dtype_str = str(s.dtype)
        null_cnt = int(s.isna().sum())
        null_pct = (null_cnt / len(df) * 100) if len(df) else 0.0
        distinct_cnt = int(s.nunique(dropna=True))
        distinct_pct = (distinct_cnt / len(df) * 100) if len(df) else 0.0

        sentinel_cnt = 0
        min_val = None
        max_val = None
        p50_val = None
        p95_val = None

        if pd.api.types.is_object_dtype(s) or pd.api.types.is_string_dtype(s):
            non_null_str = s.dropna().astype(str)
            sentinel_cnt = int(non_null_str.str.strip().str.lower().isin(SENTINEL_STRINGS).sum())
            if not non_null_str.empty:
                min_val = non_null_str.min()
                max_val = non_null_str.max()
        elif pd.api.types.is_numeric_dtype(s) and not pd.api.types.is_bool_dtype(s):
            non_null_num = pd.to_numeric(s.dropna(), errors="coerce").dropna()
            if not non_null_num.empty:
                min_val = round(float(non_null_num.min()), 2)
                max_val = round(float(non_null_num.max()), 2)
                p50_val = round(float(np.percentile(non_null_num, 50)), 2)
                p95_val = round(float(np.percentile(non_null_num, 95)), 2)
        elif pd.api.types.is_datetime64_any_dtype(s):
            non_null_dt = pd.to_datetime(s.dropna(), errors="coerce").dropna()
            if not non_null_dt.empty:
                min_val = str(non_null_dt.min())
                max_val = str(non_null_dt.max())

        rows.append({
            "column": col,
            "dtype": dtype_str,
            "nulls": null_cnt,
            "null_%": round(null_pct, 2),
            "sentinels": sentinel_cnt,
            "distinct": distinct_cnt,
            "distinct_%": round(distinct_pct, 2),
            "min": min_val,
            "p50": p50_val,
            "p95": p95_val,
            "max": max_val,
        })

    profile_df = pd.DataFrame(rows)
    print(profile_df.to_string(index=False))

    # Categorical value counts (for low-cardinality text columns)
    for col in df.columns:
        if (pd.api.types.is_object_dtype(df[col]) or pd.api.types.is_string_dtype(df[col])) and df[col].nunique(dropna=False) <= 15:
            print(f"\nValue counts for '{col}' (including NaN):")
            print(df[col].value_counts(dropna=False).to_string())

    return profile_df


# ==========================================
# 3. RUN PROFILES
# ==========================================
visits_profile = profile_dataframe(df_visits, table_name="df_visits", key_cols=["visit_id"])
meds_profile = profile_dataframe(df_meds, table_name="df_meds", key_cols=["visit_id", "medication_id"])
