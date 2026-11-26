-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: st_hubert_analytics
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `st_hubert_analytics`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `st_hubert_analytics` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `st_hubert_analytics`;

--
-- Table structure for table `algy`
--

DROP TABLE IF EXISTS `algy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `algy` (
  `ALG_ID` varchar(3) NOT NULL,
  `ALG_NAME` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ALG_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `appt`
--

DROP TABLE IF EXISTS `appt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appt` (
  `REFR_NO` varchar(20) NOT NULL,
  `PAT_ID` varchar(20) NOT NULL,
  `APT_TIME` datetime DEFAULT NULL,
  `CTD_ID` varchar(20) DEFAULT NULL,
  `DOC_ID` varchar(20) DEFAULT NULL,
  `ASTAT_CD` int DEFAULT NULL,
  `ASTAT_DES` varchar(100) DEFAULT NULL,
  `ATYPE_CD` int DEFAULT NULL,
  `ATYPE_DES` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`REFR_NO`),
  KEY `ix_appt_pat_id` (`PAT_ID`),
  CONSTRAINT `fk_appt_pat_id_patn` FOREIGN KEY (`PAT_ID`) REFERENCES `patn` (`PAT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill`
--

DROP TABLE IF EXISTS `bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill` (
  `BILL_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) NOT NULL,
  `PAT_ID` varchar(20) NOT NULL,
  `BILL_DATE` date DEFAULT NULL,
  `BILL_AMT` decimal(12,2) DEFAULT NULL,
  `BSTAT_CD` int DEFAULT NULL,
  `BSTAT_DES` varchar(100) DEFAULT NULL,
  `BTYPE_CD` int DEFAULT NULL,
  PRIMARY KEY (`BILL_ID`),
  KEY `ix_bill_pat_id` (`PAT_ID`),
  CONSTRAINT `fk_bill_pat_id_patn` FOREIGN KEY (`PAT_ID`) REFERENCES `patn` (`PAT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `diag`
--

DROP TABLE IF EXISTS `diag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diag` (
  `DIAG_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) NOT NULL,
  `DIG_TOT` decimal(12,2) DEFAULT NULL,
  `DIG_EN` datetime DEFAULT NULL,
  `DIG_SEQ` int DEFAULT NULL,
  `DIG_CD` varchar(20) DEFAULT NULL,
  `DIG_DES` varchar(200) DEFAULT NULL,
  `DSTAT_CD` int DEFAULT NULL,
  `DSTAT_DES` varchar(100) DEFAULT NULL,
  `DTYPE_CD` int DEFAULT NULL,
  `DTYPE_DES` varchar(100) DEFAULT NULL,
  `ROM_ID` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`DIAG_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dpmt`
--

DROP TABLE IF EXISTS `dpmt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dpmt` (
  `DEP_ID` varchar(20) NOT NULL,
  `DEP_NAME` varchar(100) DEFAULT NULL,
  `DEP_DES` varchar(200) DEFAULT NULL,
  `DEP_LOC` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`DEP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eqpm`
--

DROP TABLE IF EXISTS `eqpm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eqpm` (
  `EQP_ID` varchar(20) NOT NULL,
  `EQP_NAME` varchar(100) DEFAULT NULL,
  `TYPE_CD` int DEFAULT NULL,
  `TYPE_DES` varchar(100) DEFAULT NULL,
  `EQP_CAT__1` varchar(50) DEFAULT NULL,
  `EQP_CAT__2` varchar(50) DEFAULT NULL,
  `EQP_CAT__3` varchar(50) DEFAULT NULL,
  `MODL_NO` varchar(50) DEFAULT NULL,
  `STRG_LOC` varchar(100) DEFAULT NULL,
  `ESTAT_CD` int DEFAULT NULL,
  `ESTAT_DES` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`EQP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `insr`
--

DROP TABLE IF EXISTS `insr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insr` (
  `POL_NO` varchar(30) NOT NULL,
  `PAT_ID` varchar(20) NOT NULL,
  `COM_NAME` varchar(100) DEFAULT NULL,
  `ITYPE_CD` int DEFAULT NULL,
  `ITYPE_DES` varchar(100) DEFAULT NULL,
  `POL_ST` date DEFAULT NULL,
  `POL_ED` date DEFAULT NULL,
  `ISTAT_CD` int DEFAULT NULL,
  `ISTAT_DES` varchar(100) DEFAULT NULL,
  `CON_NO` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`POL_NO`),
  KEY `ix_insr_pat_id` (`PAT_ID`),
  CONSTRAINT `fk_insr_pat_id_patn` FOREIGN KEY (`PAT_ID`) REFERENCES `patn` (`PAT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invn`
--

DROP TABLE IF EXISTS `invn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invn` (
  `INVN_ID` bigint NOT NULL AUTO_INCREMENT,
  `MAT_SKU` varchar(20) NOT NULL,
  `INGTN_TS` datetime NOT NULL,
  `OPEN_QTY` decimal(12,2) DEFAULT NULL,
  `OPEN_STF` varchar(20) DEFAULT NULL,
  `RCVD_QTY` decimal(12,2) DEFAULT NULL,
  `RCVD_STF` varchar(20) DEFAULT NULL,
  `ISSD_QTY` decimal(12,2) DEFAULT NULL,
  `ISSD_STF` varchar(20) DEFAULT NULL,
  `CLSD_QTY` decimal(12,2) DEFAULT NULL,
  `CLSD_STF` varchar(20) DEFAULT NULL,
  `VRFC_STF` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`INVN_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material` (
  `MATERIAL_ID` bigint NOT NULL AUTO_INCREMENT,
  `MATERIAL_TYPE` varchar(20) NOT NULL,
  `SOURCE_MAT_SKU` varchar(20) NOT NULL,
  PRIMARY KEY (`MATERIAL_ID`),
  UNIQUE KEY `uq_material_material_type_source_mat_sku` (`MATERIAL_TYPE`,`SOURCE_MAT_SKU`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mdbl`
--

DROP TABLE IF EXISTS `mdbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mdbl` (
  `MDBL_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) NOT NULL,
  `PAT_ID` varchar(20) NOT NULL,
  `BILL_DATE` date DEFAULT NULL,
  `BILL_AMT` decimal(12,2) DEFAULT NULL,
  `BSTAT_CD` int DEFAULT NULL,
  `BSTAT_DES` varchar(100) DEFAULT NULL,
  `BTYPE_CD` int DEFAULT NULL,
  PRIMARY KEY (`MDBL_ID`),
  KEY `ix_mdbl_pat_id` (`PAT_ID`),
  CONSTRAINT `fk_mdbl_pat_id_patn` FOREIGN KEY (`PAT_ID`) REFERENCES `patn` (`PAT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mdcn`
--

DROP TABLE IF EXISTS `mdcn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mdcn` (
  `MED_ID` varchar(20) NOT NULL,
  `MED_NAME` varchar(100) DEFAULT NULL,
  `TYPE_CD` int DEFAULT NULL,
  `TYPE_DES` varchar(100) DEFAULT NULL,
  `FORM_CD` int DEFAULT NULL,
  `FORM_DES` varchar(100) DEFAULT NULL,
  `STRN_NO` decimal(10,2) DEFAULT NULL,
  `STRN_UN` varchar(10) DEFAULT NULL,
  `STRG_CD` int DEFAULT NULL,
  `STRG_DES` varchar(100) DEFAULT NULL,
  `FMQTY_NO` decimal(10,2) DEFAULT NULL,
  `FMQTY_UN` varchar(10) DEFAULT NULL,
  `MSTAT_CD` int DEFAULT NULL,
  `MSTAT_DES` varchar(100) DEFAULT NULL,
  `EXP_MON` int DEFAULT NULL,
  `UN_P_CS` int DEFAULT NULL,
  `COST_UN` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`MED_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medt`
--

DROP TABLE IF EXISTS `medt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medt` (
  `MEDT_RECORD_ID` bigint NOT NULL AUTO_INCREMENT,
  `MEDT_ID` varchar(20) NOT NULL,
  `TEAM_NO` int DEFAULT NULL,
  `STF_ID` varchar(20) NOT NULL,
  `ROLE_CD` int DEFAULT NULL,
  `ROLE_DES` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`MEDT_RECORD_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patn`
--

DROP TABLE IF EXISTS `patn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patn` (
  `PAT_ID` varchar(20) NOT NULL,
  `F_NAME` varchar(50) DEFAULT NULL,
  `L_NAME` varchar(50) DEFAULT NULL,
  `M_NAME` varchar(50) DEFAULT NULL,
  `GEN_CD` int DEFAULT NULL,
  `GEN_DES` varchar(50) DEFAULT NULL,
  `DT_BRT` date DEFAULT NULL,
  `CON_NO` varchar(30) DEFAULT NULL,
  `EM_ADD` varchar(150) DEFAULT NULL,
  `EC_F_NAME` varchar(50) DEFAULT NULL,
  `EC_L_NAME` varchar(50) DEFAULT NULL,
  `EC_M_NAME` varchar(50) DEFAULT NULL,
  `EC_CON_NO` varchar(30) DEFAULT NULL,
  `B_TYPE` varchar(10) DEFAULT NULL,
  `MAR_ST` varchar(30) DEFAULT NULL,
  `NAT_ID_S` varchar(50) DEFAULT NULL,
  `NAT_ID_T` varchar(50) DEFAULT NULL,
  `NAT_ID_N` varchar(100) DEFAULT NULL,
  `NAT_ID_E` date DEFAULT NULL,
  PRIMARY KEY (`PAT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pmnt`
--

DROP TABLE IF EXISTS `pmnt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pmnt` (
  `PMNT_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) NOT NULL,
  `PAT_ID` varchar(20) NOT NULL,
  `BTYPE_CD` varchar(20) DEFAULT NULL,
  `TOT_PMNT` decimal(12,2) DEFAULT NULL,
  `PMNT_TMS` int DEFAULT NULL,
  `PMNT_NO` int DEFAULT NULL,
  `PMNT_DATE` date DEFAULT NULL,
  `PMNT_AMT` decimal(12,2) DEFAULT NULL,
  `METH_CD` int DEFAULT NULL,
  `METH_DES` varchar(100) DEFAULT NULL,
  `PSTAT_CD` int DEFAULT NULL,
  `PSTAT_DES` varchar(100) DEFAULT NULL,
  `PMNT_IF` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`PMNT_ID`),
  KEY `ix_pmnt_pat_id` (`PAT_ID`),
  CONSTRAINT `fk_pmnt_pat_id_patn` FOREIGN KEY (`PAT_ID`) REFERENCES `patn` (`PAT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ptal`
--

DROP TABLE IF EXISTS `ptal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ptal` (
  `PATIENT_ALLERGY_ID` bigint NOT NULL AUTO_INCREMENT,
  `PAT_ID` varchar(20) NOT NULL,
  `ALG_ID` varchar(3) NOT NULL,
  `SVR_CD` int DEFAULT NULL,
  `SVR_DES` varchar(100) DEFAULT NULL,
  `RCT_CD` int DEFAULT NULL,
  `RCT_DES` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`PATIENT_ALLERGY_ID`),
  KEY `ix_ptal_pat_id` (`PAT_ID`),
  KEY `ix_ptal_alg_id` (`ALG_ID`),
  CONSTRAINT `fk_ptal_alg_id_algy` FOREIGN KEY (`ALG_ID`) REFERENCES `algy` (`ALG_ID`),
  CONSTRAINT `fk_ptal_pat_id_patn` FOREIGN KEY (`PAT_ID`) REFERENCES `patn` (`PAT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roms`
--

DROP TABLE IF EXISTS `roms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roms` (
  `ROOM_RECORD_ID` bigint NOT NULL AUTO_INCREMENT,
  `ROM_ID` varchar(20) NOT NULL,
  `DEP_ID` varchar(20) DEFAULT NULL,
  `PRPS_CD` int DEFAULT NULL,
  `PRPS_DES` varchar(100) DEFAULT NULL,
  `RTYPE_CD` int DEFAULT NULL,
  `RTYPE_DES` varchar(100) DEFAULT NULL,
  `CPCT_NO` int DEFAULT NULL,
  PRIMARY KEY (`ROOM_RECORD_ID`),
  KEY `ix_roms_dep_id` (`DEP_ID`),
  CONSTRAINT `fk_roms_dep_id_dpmt` FOREIGN KEY (`DEP_ID`) REFERENCES `dpmt` (`DEP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sply`
--

DROP TABLE IF EXISTS `sply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sply` (
  `SPL_ID` varchar(20) NOT NULL,
  `MAT_SKU` varchar(20) NOT NULL,
  `MATERIAL_ID` bigint NOT NULL,
  `VEN_ACC` varchar(20) DEFAULT NULL,
  `BTCH_NO` varchar(30) DEFAULT NULL,
  `BTCH_SZ` int DEFAULT NULL,
  `MFG_DATE` date DEFAULT NULL,
  `SPL_QTY` decimal(12,2) DEFAULT NULL,
  `SPL_UOM` varchar(10) DEFAULT NULL,
  `SPL_UCT` decimal(12,2) DEFAULT NULL,
  `WHS_LOC` varchar(50) DEFAULT NULL,
  `PAL_ID` varchar(20) DEFAULT NULL,
  `RCVD_DATE` date DEFAULT NULL,
  `RCVD_QTY` decimal(12,2) DEFAULT NULL,
  `RCVD_STF` varchar(20) DEFAULT NULL,
  `VRFC_DATE` date DEFAULT NULL,
  `VRFC_STF` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`SPL_ID`),
  KEY `ix_sply_material_id` (`MATERIAL_ID`),
  KEY `ix_sply_ven_acc` (`VEN_ACC`),
  CONSTRAINT `fk_sply_material_id_material` FOREIGN KEY (`MATERIAL_ID`) REFERENCES `material` (`MATERIAL_ID`),
  CONSTRAINT `fk_sply_ven_acc_vndr` FOREIGN KEY (`VEN_ACC`) REFERENCES `vndr` (`VEN_ACC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stff`
--

DROP TABLE IF EXISTS `stff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stff` (
  `STAFF_RECORD_ID` bigint NOT NULL AUTO_INCREMENT,
  `STF_ID` varchar(20) NOT NULL,
  `F_NAME` varchar(50) DEFAULT NULL,
  `L_NAME` varchar(50) DEFAULT NULL,
  `M_NAME` varchar(50) DEFAULT NULL,
  `GEN_CD` int DEFAULT NULL,
  `GEN_DES` varchar(20) DEFAULT NULL,
  `DT_BRT` date DEFAULT NULL,
  `DEP_ID` varchar(20) DEFAULT NULL,
  `ROLE_CD` int DEFAULT NULL,
  `ROLE_DES` varchar(100) DEFAULT NULL,
  `CON_NO` varchar(30) DEFAULT NULL,
  `EM_ADD` varchar(150) DEFAULT NULL,
  `STAT_CD` int DEFAULT NULL,
  `STAT_DES` varchar(100) DEFAULT NULL,
  `HIRE_DATE` date DEFAULT NULL,
  `ROLE_DATE` date DEFAULT NULL,
  `SAL_YR` decimal(12,2) DEFAULT NULL,
  `SAL_MN` decimal(12,2) DEFAULT NULL,
  `INGST_TMSTMP` datetime DEFAULT NULL,
  PRIMARY KEY (`STAFF_RECORD_ID`),
  KEY `ix_stff_dep_id` (`DEP_ID`),
  CONSTRAINT `fk_stff_dep_id_dpmt` FOREIGN KEY (`DEP_ID`) REFERENCES `dpmt` (`DEP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tmmd`
--

DROP TABLE IF EXISTS `tmmd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tmmd` (
  `TMMD_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) NOT NULL,
  `MEDS_TOT` decimal(12,2) DEFAULT NULL,
  `MEDS_SEQ` int DEFAULT NULL,
  `MED_ID` varchar(20) NOT NULL,
  `QTY_NO` decimal(12,2) DEFAULT NULL,
  `DOS_CD` int DEFAULT NULL,
  `DOS_DES` varchar(100) DEFAULT NULL,
  `FREQ_CD` int DEFAULT NULL,
  `FREQ_DES` varchar(100) DEFAULT NULL,
  `RUTE_CD` int DEFAULT NULL,
  `RUTE_DES` varchar(100) DEFAULT NULL,
  `UNIT_DOS` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`TMMD_ID`),
  KEY `ix_tmmd_med_id` (`MED_ID`),
  CONSTRAINT `fk_tmmd_med_id_mdcn` FOREIGN KEY (`MED_ID`) REFERENCES `mdcn` (`MED_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trtm`
--

DROP TABLE IF EXISTS `trtm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trtm` (
  `TRTM_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) NOT NULL,
  `TRTM_TOT` decimal(12,2) DEFAULT NULL,
  `TRTM_EN` datetime DEFAULT NULL,
  `TTYPE_CD` int DEFAULT NULL,
  `TTYPE_DES` varchar(100) DEFAULT NULL,
  `TRTM_CD` varchar(20) DEFAULT NULL,
  `TSTAT_CD` int DEFAULT NULL,
  `TRTM_DES` varchar(200) DEFAULT NULL,
  `TSTAT_DES` varchar(100) DEFAULT NULL,
  `TRTM_SEQ` int DEFAULT NULL,
  PRIMARY KEY (`TRTM_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vist`
--

DROP TABLE IF EXISTS `vist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vist` (
  `VISIT_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) NOT NULL,
  `PAT_ID` varchar(20) NOT NULL,
  `MEDT_ID` varchar(20) DEFAULT NULL,
  `VIS_EN` datetime DEFAULT NULL,
  `VIS_EX` datetime DEFAULT NULL,
  `VSTAT_CD` int DEFAULT NULL,
  `VSTAT_DES` varchar(100) DEFAULT NULL,
  `VTYPE_CD` int DEFAULT NULL,
  `VTYPE_DES` varchar(100) DEFAULT NULL,
  `ROM_ID` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`VISIT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vndr`
--

DROP TABLE IF EXISTS `vndr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vndr` (
  `VEN_ACC` varchar(20) NOT NULL,
  `VEN_NAME` varchar(100) DEFAULT NULL,
  `VEN_TYPE` varchar(50) DEFAULT NULL,
  `LCNS_NO` varchar(30) DEFAULT NULL,
  `CTRY_NAME` varchar(50) DEFAULT NULL,
  `CTRY_CD` varchar(10) DEFAULT NULL,
  `CTRY_CON_NO` varchar(30) DEFAULT NULL,
  `VSTAT_CD` int DEFAULT NULL,
  `VSTAT_DES` varchar(100) DEFAULT NULL,
  `INGST_TMSTMP` datetime DEFAULT NULL,
  PRIMARY KEY (`VEN_ACC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vpmt`
--

DROP TABLE IF EXISTS `vpmt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vpmt` (
  `VPMT_ID` bigint NOT NULL AUTO_INCREMENT,
  `REFR_NO` varchar(20) DEFAULT NULL,
  `SPL_ID` varchar(20) NOT NULL,
  `SPL_CST` decimal(12,2) DEFAULT NULL,
  `PMNT_TRM` int DEFAULT NULL,
  `TRM_NO` int DEFAULT NULL,
  `VPMT_AMT` decimal(12,2) DEFAULT NULL,
  `PMNT_DATE` date DEFAULT NULL,
  `PMNT_DUE` decimal(12,2) DEFAULT NULL,
  `VPSTATUS_CD` int DEFAULT NULL,
  `VPSTATUS_DES` varchar(100) DEFAULT NULL,
  `VEN_ACC` varchar(20) DEFAULT NULL,
  `ACC_NO` varchar(20) DEFAULT NULL,
  `WRE_NO` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`VPMT_ID`),
  KEY `ix_vpmt_ven_acc` (`VEN_ACC`),
  KEY `ix_vpmt_spl_id` (`SPL_ID`),
  CONSTRAINT `fk_vpmt_spl_id_sply` FOREIGN KEY (`SPL_ID`) REFERENCES `sply` (`SPL_ID`),
  CONSTRAINT `fk_vpmt_ven_acc_vndr` FOREIGN KEY (`VEN_ACC`) REFERENCES `vndr` (`VEN_ACC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'st_hubert_analytics'
--

--
-- Dumping routines for database 'st_hubert_analytics'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-22 23:52:32
