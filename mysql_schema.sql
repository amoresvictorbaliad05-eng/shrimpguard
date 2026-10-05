-- ShrimpGuard MySQL schema
-- Import this file with a MySQL account that can create databases.

CREATE DATABASE IF NOT EXISTS shrimpguard_users
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS shrimpguard_sensors
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shrimpguard_users.users (
    name VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    last_login DATETIME NULL,
    PRIMARY KEY (email),
    UNIQUE KEY uq_users_name (name),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shrimpguard_users.roles (
    id INT NOT NULL AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_role_name (role_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shrimpguard_sensors.pond_readings (
    id INT NOT NULL AUTO_INCREMENT,
    temperature FLOAT NOT NULL,
    ph FLOAT NOT NULL,
    salinity FLOAT NOT NULL,
    turbidity FLOAT NOT NULL,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ix_pond_readings_recorded_at (recorded_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shrimpguard_sensors.alert_logs (
    id INT NOT NULL AUTO_INCREMENT,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ix_alert_logs_created_at (created_at)
) ENGINE=InnoDB;
