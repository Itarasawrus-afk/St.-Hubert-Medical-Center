# Archived Data-Modelling Prototypes

This directory preserves four early data-modelling and validation prototypes from the project's `data modelling/` directory.

## Contents

- `data-exploration.py` — exploratory summaries and visualizations for synthetic visit and medication data.
- `data-profiling.py` — column-level profiling and duplicate/key checks using synthetic data.
- `proposed-data-model.sql` — an illustrative relational schema for patients, wards, facility periods, medications, visits, and visit-medication links.
- `relationship-validation.py` — referential-integrity, cardinality, and timestamp-order checks against synthetic data.

## Important limitations

The Python scripts generate their own sample data (550 synthetic visits and associated synthetic medication records). They do not load the St. Hubert production database, curated analytics tables, or the predictive-model datasets.

The SQL file is a proposed schema example. It is not the authoritative schema or a migration for the application's current database.

These files are retained for historical and academic reference. They are not part of the active BI application pipeline, backend API, or current XGBoost prediction integration. Do not interpret their sample outputs as findings about actual hospital operations or patient records.

## Dependencies

The Python prototypes use NumPy and pandas; the exploration script also uses Matplotlib. They are not required to run the BI application.
