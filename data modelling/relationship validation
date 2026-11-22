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

# Optional reference tables if you already have them:
df_patients = pd.DataFrame({"patient_id": df_visits["patient_id"].unique()})
df_medications = pd.DataFrame({"medication_id": df_meds["medication_id"].unique()})


# ==========================================
# 2. RELATIONSHIP & INVARIANT ASSERTIONS
# ==========================================
print("=" * 75)
print("RELATIONSHIP & STRUCTURAL VALIDATION REPORT")
print("=" * 75)

# --- A. Referential Integrity (Orphan Foreign Key Checks) ---
orphan_med_visits = set(df_meds["visit_id"].dropna()) - set(df_visits["visit_id"].dropna())
print(f"\n[1] Orphan 'visit_id' in df_meds not in df_visits: {len(orphan_med_visits)}")
if orphan_med_visits:
    print("    Sample orphan visit_ids:", list(orphan_med_visits)[:10])

if df_patients is not None and "patient_id" in df_patients.columns:
    orphan_visit_patients = set(df_visits["patient_id"].dropna()) - set(df_patients["patient_id"].dropna())
    print(f"[2] Orphan 'patient_id' in df_visits not in df_patients: {len(orphan_visit_patients)}")

if df_medications is not None and "medication_id" in df_medications.columns:
    orphan_med_ids = set(df_meds["medication_id"].dropna()) - set(df_medications["medication_id"].dropna())
    print(f"[3] Orphan 'medication_id' in df_meds not in df_medications: {len(orphan_med_ids)}")


# --- B. Cardinality Checks (1:1 vs 1:N vs N:M) ---
visits_per_patient = df_visits.groupby("patient_id")["visit_id"].count()
multi_visit_patients = (visits_per_patient > 1).sum()
print(f"\n[4] patients -> visits cardinality:")
print(f"    Max visits per patient: {visits_per_patient.max()} | Patients with >1 visit: {multi_visit_patients}")
print(f"    Implied relationship: {'1:N (multiple visits per patient)' if visits_per_patient.max() > 1 else '1:1'}")

meds_per_visit = df_meds.groupby("visit_id")["medication_id"].count()
visits_per_med = df_meds.groupby("medication_id")["visit_id"].count()
dup_visit_med_pairs = df_meds.duplicated(subset=["visit_id", "medication_id"]).sum()
print(f"\n[5] visits <-> medications cardinality:")
print(f"    Max meds per visit: {meds_per_visit.max()} | Max visits per med: {visits_per_med.max()}")
print(f"    Duplicate (visit_id, medication_id) pairs: {dup_visit_med_pairs}")
print("    Implied relationship: N:M (requires bridge table 'visit_medications'; use UNIQUE(visit_id, medication_id) if one row per drug per visit)")


# --- C. Temporal & Chronological Invariants ---
v = df_visits.copy()
for col in ["admit_datetime", "discharge_order_time", "physical_exit_time"]:
    v[col] = pd.to_datetime(v[col], errors="coerce")

order_before_admit = (v["discharge_order_time"] < v["admit_datetime"]).sum()
exit_before_admit = (v["physical_exit_time"] < v["admit_datetime"]).sum()
exit_before_order = (v["physical_exit_time"] < v["discharge_order_time"]).sum()

print(f"\n[6] Visit timestamp ordering checks:")
print(f"    discharge_order_time < admit_datetime: {order_before_admit}")
print(f"    physical_exit_time < admit_datetime:   {exit_before_admit}")
print(f"    physical_exit_time < discharge_order_time: {exit_before_order}")

# Overlapping stays for the same patient (useful for admission/readmission logic)
v_sorted = v.sort_values(["patient_id", "admit_datetime"]).copy()
v_sorted["prev_exit"] = v_sorted.groupby("patient_id")["physical_exit_time"].shift(1)
overlapping_stays = (v_sorted["admit_datetime"] < v_sorted["prev_exit"]).sum()
print(f"    Overlapping visits for same patient (next admit < prev exit): {overlapping_stays}")
