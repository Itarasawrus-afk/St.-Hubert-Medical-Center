# Analytics Database

This directory is intended to contain the MySQL analytics schema and its implementation scripts.

## Intended files

- `st_hubert_analytics_structure.sql` — initial analytics table definitions.
- `23_master_analytics_layer_batched_inventory.sql` — master analytics implementation, including data transfer from `st_hubert_curated`, batched inventory loading, and analytical views.

## Prerequisites

- MySQL 8.0.46
- A populated and verified `st_hubert_curated` schema
- Adequate storage and execution time for the inventory migration (the curated inventory source contains approximately 90.7 million rows)

## Execution notes

The master implementation uses `st_hubert_analytics` and reads from `st_hubert_curated`. Review the script and take a backup before execution. The script is designed to avoid dropping or truncating source tables and to support resuming inventory batches.

The initial structure file is not necessarily the final column definition: the master implementation applies data-type alignment changes. Follow the master script's instructions and verify the resulting schema after execution.

Do not treat the analytics layer as complete until all expected table counts and analytical views have been checked in MySQL.
