# Data Documentation

This directory contains database documentation and validation summaries used by the St. Hubert Medical Center BI project. The filenames below reflect the files currently present in this directory.

## Contents

| File | Description |
|---|---|
| `ERD_Relationship_Text.txt` | Textual entity-relationship and table relationship descriptions |
| `st_hubert_curated_columns.tsv` | Curated table and column reference |
| `TABLE_ROW_COUNTS.csv` | Table row-count summary |
| `PRIMARY_KEY_VALIDATION.csv` | Primary-key validation results |
| `FOREIGN_KEY_VALIDATION.csv` | Foreign-key validation results |
| `FINAL_AUDIT_METRICS.csv` | Final database audit metrics |
| `MATERIAL_MAPPING_SUMMARY.csv` | Material mapping summary |
| `MATERIAL_TABLE_COLUMN_INVENTORY.csv` | Material table and column inventory |

These are documentation and aggregate validation artifacts. The directory listing currently does not include a separate `fk_relationship_audit.csv` file; consult the foreign-key validation report and ERD text for the relationship documentation available in this repository.

## Handling and review

Before committing changes, review documentation and exports for patient identifiers, personal information, credentials, local machine paths, or other sensitive details. Do not add populated patient-level data or private source datasets to this directory.

For database-layer context, see [database/README.md](../database/README.md).
