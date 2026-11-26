# Curated Database

This directory is intended to contain the curated database schema, migration scripts, and verification scripts.

## Intended files

- `st_hubert_curated_schema.sql` — schema-only export for recreating curated table structures.
- `20_master_curated_database_verification.sql` — verification queries for the curated database.

## Notes

The curated database is populated from the staging layer. A schema-only export does not include the patient-level records. Do not commit populated database dumps or raw patient-level data to this repository.

Run the verification script only after the curated database has been populated. Record the verification results separately.
