-- MySQL dump 10.13  Distrib 9.5.0, for Linux (aarch64)
--
-- Host: localhost    Database: parking
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '3c94a7c2-fd18-11f0-a25d-f6a0e294a7be:1-98';

--
-- Table structure for table `Admin`
--

DROP TABLE IF EXISTS `Admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
INSERT INTO `Admin` VALUES (1,'agustin','123123');
/*!40000 ALTER TABLE `Admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Estacionamiento`
--

DROP TABLE IF EXISTS `Estacionamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Estacionamiento` (
  `estacionamiento_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`estacionamiento_id`),
  KEY `fk_usuario_estacionamiento` (`usuario_id`),
  CONSTRAINT `fk_usuario_estacionamiento` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Estacionamiento`
--

LOCK TABLES `Estacionamiento` WRITE;
/*!40000 ALTER TABLE `Estacionamiento` DISABLE KEYS */;
INSERT INTO `Estacionamiento` VALUES (1,'mi casa','calle falsa 333',4,1),(2,'estacionamiento 2','liropeya 123',4,1),(3,'Agustin parking','18 de julio y tu vieja',4,1),(4,'estacionamiento nuevo2','18 de julio y ejido',5,1),(5,'la casa de carlos','casa de carlos',5,1);
/*!40000 ALTER TABLE `Estacionamiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Lugar`
--

DROP TABLE IF EXISTS `Lugar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Lugar` (
  `lugar_id` int NOT NULL AUTO_INCREMENT,
  `piso_id` int NOT NULL,
  `codigo_lugar` varchar(20) NOT NULL,
  `tipo_lugar` enum('Normal','Discapacitados','Electrico') NOT NULL,
  `estado` enum('Disponible','Ocupado','Reservado','Mantenimiento') NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`lugar_id`),
  UNIQUE KEY `codigo_lugar` (`codigo_lugar`),
  KEY `piso_id` (`piso_id`),
  CONSTRAINT `Lugar_ibfk_1` FOREIGN KEY (`piso_id`) REFERENCES `Piso` (`piso_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Lugar`
--

LOCK TABLES `Lugar` WRITE;
/*!40000 ALTER TABLE `Lugar` DISABLE KEYS */;
INSERT INTO `Lugar` VALUES (1,1,'A-20','Electrico','Disponible',1),(2,1,'A-02','Discapacitados','Disponible',1),(4,1,'A-01','Electrico','Disponible',1),(5,2,'Z-1','Normal','Disponible',1),(6,2,'Z-2','Normal','Disponible',1),(7,8,'1-suputa madre','Normal','Disponible',1),(8,8,'1-suputa madre2','Discapacitados','Disponible',1),(9,4,'A-12345','Normal','Disponible',0),(23,3,'ZY-','Normal','Disponible',1),(25,7,'3-','Discapacitados','Disponible',1),(27,3,'hola','Normal','Disponible',1),(28,4,'hola3','Electrico','Disponible',0),(29,4,'hola2','Electrico','Disponible',1),(30,4,'hola1','Electrico','Disponible',1),(31,5,'A1','Electrico','Disponible',1),(32,5,'A2','Electrico','Disponible',1),(33,5,'A3','Electrico','Disponible',1),(34,3,'B-','Normal','Disponible',1),(35,3,'ABC-','Electrico','Disponible',1);
/*!40000 ALTER TABLE `Lugar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Piso`
--

DROP TABLE IF EXISTS `Piso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Piso` (
  `piso_id` int NOT NULL AUTO_INCREMENT,
  `estacionamiento_id` int NOT NULL,
  `numero_piso` int NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `capacidad` int DEFAULT '0',
  PRIMARY KEY (`piso_id`),
  KEY `estacionamiento_id` (`estacionamiento_id`),
  CONSTRAINT `Piso_ibfk_1` FOREIGN KEY (`estacionamiento_id`) REFERENCES `Estacionamiento` (`estacionamiento_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Piso`
--

LOCK TABLES `Piso` WRITE;
/*!40000 ALTER TABLE `Piso` DISABLE KEYS */;
INSERT INTO `Piso` VALUES (1,1,4,'este ahora es ese',1,0),(2,1,3,'ah este si es el bueno',1,0),(3,2,1,'sada',1,0),(4,4,1,'piso normal',1,0),(5,4,1,'piso 1',1,0),(6,4,1,'Este piso',1,0),(7,3,1,'esta casa',1,0),(8,5,1,'planta baja',1,0);
/*!40000 ALTER TABLE `Piso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reserva`
--

DROP TABLE IF EXISTS `Reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reserva` (
  `reserva_id` int NOT NULL AUTO_INCREMENT,
  `lugar_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `fecha_salida` datetime DEFAULT NULL,
  `estado_reserva` enum('Activa','Completada','Cancelada') NOT NULL,
  PRIMARY KEY (`reserva_id`),
  KEY `lugar_id` (`lugar_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `Reserva_ibfk_1` FOREIGN KEY (`lugar_id`) REFERENCES `Lugar` (`lugar_id`),
  CONSTRAINT `Reserva_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reserva`
--

LOCK TABLES `Reserva` WRITE;
/*!40000 ALTER TABLE `Reserva` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Usuario`
--

DROP TABLE IF EXISTS `Usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Usuario` (
  `usuario_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(150) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` varchar(20) DEFAULT 'pendiente',
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telefono` (`telefono`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Usuario`
--

LOCK TABLES `Usuario` WRITE;
/*!40000 ALTER TABLE `Usuario` DISABLE KEYS */;
INSERT INTO `Usuario` VALUES (1,'ojo mirate esta','opa','opa@gmail.com','2918376','ajsdsb','pendiente'),(2,'carlos paastor','carlos','cpastor@windows.com','1235567890','123456789000','pendiente'),(3,'carlos ney','ney','ney@brasil.com','102936','$2b$10$.Pbc8eXl5vk/ETlKoP.R6.QYsYJ7sntU8H2dUk7cUTETgTzzG73PC','pendiente'),(4,'agustin','Agustin','agustin@gmail.com','123','$2b$10$hlH/dVHzK1qNNpwN53EdGeBiJ28SUdLz1uDE/QasPkQX1mfYVltfe','boss'),(5,'nuevo','nuevo','nuevo@gmail.com','111','$2b$10$DHXLfiCfpbMQYjezb9CAneZzHT4bqrNGWWLICwavwhdoQm.Ovey2C','boss'),(6,'nuevo2','nuevo2','nuevo2@gmail.com','0000','$2b$10$yX4vHBfSTomBrZlHERKfEeVAIyLzKyY3QK1lJ3Ktbzkqk9mRQ4ooi','boss');
/*!40000 ALTER TABLE `Usuario` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-08 20:19:58
