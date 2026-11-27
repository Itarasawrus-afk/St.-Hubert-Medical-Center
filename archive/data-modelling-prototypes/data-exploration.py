import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


# ==========================================
# 1. LOAD OR EXPLORE SAMPLE DATA
# ==========================================
# Replace this block with your actual loaded DataFrames (df_visits, df_meds)
# from your Kaggle dataset or pipeline.
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
# 2. EXPLORATORY FEATURE SLICES (NO HARD CONSTRAINTS)
# ==========================================
visits = df_visits.copy()
visits["admit_datetime"] = pd.to_datetime(visits["admit_datetime"], errors="coerce")
visits["discharge_order_time"] = pd.to_datetime(visits["discharge_order_time"], errors="coerce")
visits["physical_exit_time"] = pd.to_datetime(visits["physical_exit_time"], errors="coerce")

visits["los_days"] = (visits["physical_exit_time"] - visits["admit_datetime"]).dt.total_seconds() / 86400
visits["discharge_delay_hrs"] = (visits["physical_exit_time"] - visits["discharge_order_time"]).dt.total_seconds() / 3600
visits["admit_dow"] = visits["admit_datetime"].dt.day_name()
visits["admit_hour"] = visits["admit_datetime"].dt.hour

meds_per_visit = (
    df_meds.groupby("visit_id")["medication_id"]
    .nunique()
    .rename("unique_meds")
)
visits = visits.join(meds_per_visit, on="visit_id")
visits["unique_meds"] = visits["unique_meds"].fillna(0)

# Repeat-visit behavior (exploratory cohort view)
visits_sorted = visits.sort_values(["patient_id", "admit_datetime"])
visits_sorted["visit_seq"] = visits_sorted.groupby("patient_id").cumcount() + 1
visits_sorted["days_since_prev_exit"] = (
    visits_sorted["admit_datetime"] - visits_sorted.groupby("patient_id")["physical_exit_time"].shift(1)
).dt.total_seconds() / 86400


# ==========================================
# 3. SHAPE, COHORTS & PATTERNS TO INVESTIGATE
# ==========================================
print("=== DATASET SHAPE & TIME WINDOW ===")
print(f"Visits: {len(visits)} rows x {visits.shape[1]} cols | Meds links: {len(df_meds)} rows")
print(f"Admit span: {visits['admit_datetime'].min()} -> {visits['admit_datetime'].max()}\n")

print("=== WARD & ADMISSION DAY HYPOTHESIS CHECK ===")
ward_summary = visits.groupby("ward").agg(
    visit_count=("visit_id", "count"),
    unique_patients=("patient_id", "nunique"),
    median_los_days=("los_days", "median"),
    p90_los_days=("los_days", lambda s: np.nanpercentile(s.dropna(), 90) if len(s.dropna()) else np.nan),
    median_delay_hrs=("discharge_delay_hrs", "median"),
    median_meds=("unique_meds", "median"),
)
print(ward_summary.round(2).to_string(), "\n")

print("=== ADMISSIONS BY DAY OF WEEK ===")
dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
print(visits["admit_dow"].value_counts().reindex(dow_order).to_string(), "\n")

print("=== REPEAT VISITOR COHORT ===")
patient_visit_counts = visits.groupby("patient_id")["visit_id"].count()
print(patient_visit_counts.value_counts().sort_index().rename("num_patients").to_frame().to_string(), "\n")

readmit_gaps = visits_sorted["days_since_prev_exit"].dropna()
if not readmit_gaps.empty:
    print("Days since previous physical exit (repeat visits):")
    print(readmit_gaps.describe(percentiles=[0.1, 0.25, 0.5, 0.75, 0.9]).round(2).to_string(), "\n")

print("=== ROUGH NUMERIC CORRELATIONS (EXPLORATORY) ===")
corr_cols = ["los_days", "discharge_delay_hrs", "unique_meds", "admit_hour"]
print(visits[corr_cols].corr(numeric_only=True).round(3).to_string())


# ==========================================
# 4. QUICK VISUAL EXPLORATION
# ==========================================
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# Length of stay distribution (skew check)
axes[0, 0].hist(visits["los_days"].dropna(), bins=25, edgecolor="black")
axes[0, 0].set_title("Length of Stay Distribution (Days)")
axes[0, 0].set_xlabel("LOS (Days)")
axes[0, 0].set_ylabel("Visits")

# LOS by ward (spread & outliers)
wards_present = [w for w in visits["ward"].dropna().unique()]
los_by_w = [visits.loc[visits["ward"] == w, "los_days"].dropna() for w in wards_present]
axes[0, 1].boxplot(los_by_w, labels=wards_present)
axes[0, 1].set_title("Length of Stay by Ward")
axes[0, 1].set_ylabel("LOS (Days)")
axes[0, 1].tick_params(axis="x", rotation=20)

# Admissions by hour of day (line graph)
hourly_counts = (
    visits["admit_hour"]
    .dropna()
    .astype(int)
    .value_counts()
    .reindex(range(24), fill_value=0)
)
axes[1, 0].plot(hourly_counts.index, hourly_counts.values, marker="o")
axes[1, 0].set_title("Admissions by Hour of Day")
axes[1, 0].set_xlabel("Hour (0-23)")
axes[1, 0].set_ylabel("Visits")
axes[1, 0].set_xticks(range(0, 24, 2))
axes[1, 0].grid(True, alpha=0.3)

# Unique medications vs. LOS (complexity vs. stay)
axes[1, 1].scatter(visits["unique_meds"], visits["los_days"], alpha=0.5)
axes[1, 1].set_title("Unique Medications vs. Length of Stay")
axes[1, 1].set_xlabel("Unique Medications per Visit")
axes[1, 1].set_ylabel("LOS (Days)")

plt.tight_layout()
plt.show()
