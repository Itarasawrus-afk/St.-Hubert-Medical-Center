/* ============================================================================
   ST. HUBERT MEDICAL CENTER - MASTER CURATED DATABASE VERIFICATION
   MySQL 8.0 | READ-ONLY AUDIT | SAFE TO RUN MORE THAN ONCE

   Purpose:
   - Compare each raw staging table with its curated counterpart.
   - Check the derived MATERIAL supertype (MDCN + EQPM).
   - Verify inventory partition processing and curated row totals.
   - Count curated entity tables, inventory control tables, and foreign keys.

   This script DOES NOT INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE data.
   Run the entire file in MySQL Workbench with the schemas already present.
   ============================================================================ */

/* 1. Source-to-curated row-count reconciliation.
      Every source/curated pair should match the expected total.
      MATERIAL is derived from MDCN + EQPM, so its source total is their sum.
      Note: exact COUNT(*) on INVN scans a very large table and may take time. */
SELECT
    'ALGY' AS entity,
    (SELECT COUNT(*) FROM st_hubert_staging.raw_algy) AS staging_rows,
    (SELECT COUNT(*) FROM st_hubert_curated.algy) AS curated_rows,
    44 AS expected_rows,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_algy) = 44
           AND (SELECT COUNT(*) FROM st_hubert_curated.algy) = 44
         THEN 'PASS' ELSE 'CHECK' END AS audit_status
UNION ALL SELECT 'APPT', (SELECT COUNT(*) FROM st_hubert_staging.raw_appt), (SELECT COUNT(*) FROM st_hubert_curated.appt), 974032,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_appt) = 974032 AND (SELECT COUNT(*) FROM st_hubert_curated.appt) = 974032 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'BILL', (SELECT COUNT(*) FROM st_hubert_staging.raw_bill), (SELECT COUNT(*) FROM st_hubert_curated.bill), 917331,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_bill) = 917331 AND (SELECT COUNT(*) FROM st_hubert_curated.bill) = 917331 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'DIAG', (SELECT COUNT(*) FROM st_hubert_staging.raw_diag), (SELECT COUNT(*) FROM st_hubert_curated.diag), 1602174,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_diag) = 1602174 AND (SELECT COUNT(*) FROM st_hubert_curated.diag) = 1602174 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'DPMT', (SELECT COUNT(*) FROM st_hubert_staging.raw_dpmt), (SELECT COUNT(*) FROM st_hubert_curated.dpmt), 30,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_dpmt) = 30 AND (SELECT COUNT(*) FROM st_hubert_curated.dpmt) = 30 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'EQPM', (SELECT COUNT(*) FROM st_hubert_staging.raw_eqpm), (SELECT COUNT(*) FROM st_hubert_curated.eqpm), 10190,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_eqpm) = 10190 AND (SELECT COUNT(*) FROM st_hubert_curated.eqpm) = 10190 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'INSR', (SELECT COUNT(*) FROM st_hubert_staging.raw_insr), (SELECT COUNT(*) FROM st_hubert_curated.insr), 457072,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_insr) = 457072 AND (SELECT COUNT(*) FROM st_hubert_curated.insr) = 457072 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'MDBL', (SELECT COUNT(*) FROM st_hubert_staging.raw_mdbl), (SELECT COUNT(*) FROM st_hubert_curated.mdbl), 465152,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_mdbl) = 465152 AND (SELECT COUNT(*) FROM st_hubert_curated.mdbl) = 465152 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'MDCN', (SELECT COUNT(*) FROM st_hubert_staging.raw_mdcn), (SELECT COUNT(*) FROM st_hubert_curated.mdcn), 346302,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_mdcn) = 346302 AND (SELECT COUNT(*) FROM st_hubert_curated.mdcn) = 346302 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'MEDT', (SELECT COUNT(*) FROM st_hubert_staging.raw_medt), (SELECT COUNT(*) FROM st_hubert_curated.medt), 312870,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_medt) = 312870 AND (SELECT COUNT(*) FROM st_hubert_curated.medt) = 312870 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'PATN', (SELECT COUNT(*) FROM st_hubert_staging.raw_patn), (SELECT COUNT(*) FROM st_hubert_curated.patn), 351765,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_patn) = 351765 AND (SELECT COUNT(*) FROM st_hubert_curated.patn) = 351765 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'PMNT', (SELECT COUNT(*) FROM st_hubert_staging.raw_pmnt), (SELECT COUNT(*) FROM st_hubert_curated.pmnt), 2774514,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_pmnt) = 2774514 AND (SELECT COUNT(*) FROM st_hubert_curated.pmnt) = 2774514 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'PTAL', (SELECT COUNT(*) FROM st_hubert_staging.raw_ptal), (SELECT COUNT(*) FROM st_hubert_curated.ptal), 644303,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_ptal) = 644303 AND (SELECT COUNT(*) FROM st_hubert_curated.ptal) = 644303 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'ROMS', (SELECT COUNT(*) FROM st_hubert_staging.raw_roms), (SELECT COUNT(*) FROM st_hubert_curated.roms), 24302,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_roms) = 24302 AND (SELECT COUNT(*) FROM st_hubert_curated.roms) = 24302 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'SPLY', (SELECT COUNT(*) FROM st_hubert_staging.raw_sply), (SELECT COUNT(*) FROM st_hubert_curated.sply), 721134,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_sply) = 721134 AND (SELECT COUNT(*) FROM st_hubert_curated.sply) = 721134 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'STFF', (SELECT COUNT(*) FROM st_hubert_staging.raw_stff), (SELECT COUNT(*) FROM st_hubert_curated.stff), 5496,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_stff) = 5496 AND (SELECT COUNT(*) FROM st_hubert_curated.stff) = 5496 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'TMMD', (SELECT COUNT(*) FROM st_hubert_staging.raw_tmmd), (SELECT COUNT(*) FROM st_hubert_curated.tmmd), 4305489,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_tmmd) = 4305489 AND (SELECT COUNT(*) FROM st_hubert_curated.tmmd) = 4305489 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'TRTM', (SELECT COUNT(*) FROM st_hubert_staging.raw_trtm), (SELECT COUNT(*) FROM st_hubert_curated.trtm), 917191,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_trtm) = 917191 AND (SELECT COUNT(*) FROM st_hubert_curated.trtm) = 917191 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'VIST', (SELECT COUNT(*) FROM st_hubert_staging.raw_vist), (SELECT COUNT(*) FROM st_hubert_curated.vist), 917331,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_vist) = 917331 AND (SELECT COUNT(*) FROM st_hubert_curated.vist) = 917331 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'VNDR', (SELECT COUNT(*) FROM st_hubert_staging.raw_vndr), (SELECT COUNT(*) FROM st_hubert_curated.vndr), 13562,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_vndr) = 13562 AND (SELECT COUNT(*) FROM st_hubert_curated.vndr) = 13562 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'VPMT', (SELECT COUNT(*) FROM st_hubert_staging.raw_vpmt), (SELECT COUNT(*) FROM st_hubert_curated.vpmt), 1802488,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_vpmt) = 1802488 AND (SELECT COUNT(*) FROM st_hubert_curated.vpmt) = 1802488 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'INVN', (SELECT COUNT(*) FROM st_hubert_staging.raw_invn), (SELECT COUNT(*) FROM st_hubert_curated.invn), 90731353,
    CASE WHEN (SELECT COUNT(*) FROM st_hubert_staging.raw_invn) = 90731353 AND (SELECT COUNT(*) FROM st_hubert_curated.invn) = 90731353 THEN 'PASS' ELSE 'CHECK' END
UNION ALL SELECT 'MATERIAL (MDCN + EQPM)',
    (SELECT COUNT(*) FROM st_hubert_staging.raw_mdcn) + (SELECT COUNT(*) FROM st_hubert_staging.raw_eqpm),
    (SELECT COUNT(*) FROM st_hubert_curated.material), 356492,
    CASE WHEN ((SELECT COUNT(*) FROM st_hubert_staging.raw_mdcn) + (SELECT COUNT(*) FROM st_hubert_staging.raw_eqpm)) = 356492
           AND (SELECT COUNT(*) FROM st_hubert_curated.material) = 356492
         THEN 'PASS' ELSE 'CHECK' END
ORDER BY entity;

/* 2. Inventory partition-loader audit.
      Expected: 98 manifest entries, 98 completed log entries,
      and 90,731,353 rows inserted/logged. */
SELECT
    (SELECT COUNT(*) FROM st_hubert_curated.phase2h_invn_file_manifest) AS files_expected,
    (SELECT COUNT(*) FROM st_hubert_curated.phase2h_invn_file_log) AS files_logged_completed,
    (SELECT COALESCE(SUM(rows_inserted), 0) FROM st_hubert_curated.phase2h_invn_file_log) AS rows_logged_inserted,
    (SELECT COUNT(*) FROM st_hubert_curated.invn) AS curated_inventory_rows,
    CASE
      WHEN (SELECT COUNT(*) FROM st_hubert_curated.phase2h_invn_file_manifest) = 98
       AND (SELECT COUNT(*) FROM st_hubert_curated.phase2h_invn_file_log) = 98
       AND (SELECT COALESCE(SUM(rows_inserted), 0) FROM st_hubert_curated.phase2h_invn_file_log) = 90731353
       AND (SELECT COUNT(*) FROM st_hubert_curated.invn) = 90731353
      THEN 'PASS' ELSE 'CHECK' END AS inventory_loader_status;

/* 3. Curated table inventory. Expected: 23 business/entity tables.
      The two phase2h_* inventory control tables are additional operational tables. */
SELECT
    SUM(CASE WHEN table_name NOT LIKE 'phase2h\_%' THEN 1 ELSE 0 END) AS entity_base_tables,
    SUM(CASE WHEN table_name LIKE 'phase2h\_%' THEN 1 ELSE 0 END) AS inventory_control_tables,
    COUNT(*) AS total_base_tables
FROM information_schema.tables
WHERE table_schema = 'st_hubert_curated'
  AND table_type = 'BASE TABLE';

/* 4. Foreign-key relationship inventory. */
SELECT
    kcu.TABLE_NAME AS child_table,
    kcu.COLUMN_NAME AS child_column,
    kcu.REFERENCED_TABLE_NAME AS parent_table,
    kcu.REFERENCED_COLUMN_NAME AS parent_column,
    kcu.CONSTRAINT_NAME AS foreign_key_name
FROM information_schema.KEY_COLUMN_USAGE AS kcu
WHERE kcu.CONSTRAINT_SCHEMA = 'st_hubert_curated'
  AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY child_table, child_column;

/* 5. Foreign-key count summary. */
SELECT COUNT(*) AS curated_foreign_key_columns
FROM information_schema.KEY_COLUMN_USAGE
WHERE CONSTRAINT_SCHEMA = 'st_hubert_curated'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

/* END OF READ-ONLY VERIFICATION SCRIPT */
