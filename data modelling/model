CREATE TABLE patients (
  patient_id VARCHAR(32) PRIMARY KEY,
  created_at TIMESTAMP
);

CREATE TABLE wards (
  ward_id SERIAL PRIMARY KEY,
  ward_name VARCHAR(64) UNIQUE NOT NULL,
  total_beds INTEGER NOT NULL
);

CREATE TABLE facility_periods (
  period_id SERIAL PRIMARY KEY,
  period_name VARCHAR(64) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_in_period INTEGER NOT NULL,
  total_available_bed_days INTEGER NOT NULL
);

CREATE TABLE medications (
  medication_id VARCHAR(32) PRIMARY KEY,
  medication_name VARCHAR(128),
  therapeutic_class VARCHAR(64)
);

CREATE TABLE visits (
  visit_id INTEGER PRIMARY KEY,
  patient_id VARCHAR(32) NOT NULL,
  ward_id INTEGER NOT NULL,
  period_id INTEGER,
  admit_datetime TIMESTAMP NOT NULL,
  discharge_order_time TIMESTAMP,
  physical_exit_time TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  FOREIGN KEY (ward_id) REFERENCES wards(ward_id),
  FOREIGN KEY (period_id) REFERENCES facility_periods(period_id)
);

CREATE TABLE visit_medications (
  visit_medication_id SERIAL PRIMARY KEY,
  visit_id INTEGER NOT NULL,
  medication_id VARCHAR(32) NOT NULL,
  prescribed_at TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(visit_id),
  FOREIGN KEY (medication_id) REFERENCES medications(medication_id)
);
