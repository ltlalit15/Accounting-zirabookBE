-- 1. Platform Users (Super Admin + SaaS staff)
CREATE TABLE IF NOT EXISTS platform_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN','ADMIN','STAFF') DEFAULT 'ADMIN',
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Master Modules
CREATE TABLE IF NOT EXISTS modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  `key` VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  base_price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  invoice_limit INT DEFAULT 0,
  additional_invoice_price DECIMAL(10,2) DEFAULT 0,
  user_limit INT DEFAULT 1,
  storage_capacity_gb INT DEFAULT 5,
  billing_cycle ENUM('Monthly','Quarterly','Yearly') DEFAULT 'Monthly',
  status ENUM('Active','Inactive') DEFAULT 'Active',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan ↔ Modules (with optional per-module price)
CREATE TABLE IF NOT EXISTS plan_modules (
  plan_id INT NOT NULL,
  module_id INT NOT NULL,
  module_price DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (plan_id, module_id),
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  start_date DATE,
  expire_date DATE,
  plan_id INT NOT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Optional: Company Users table (future use)
CREATE TABLE IF NOT EXISTS company_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  name VARCHAR(100),
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('COMPANY_ADMIN','STAFF') DEFAULT 'COMPANY_ADMIN',
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Seed master modules
INSERT IGNORE INTO modules (`key`, label) VALUES
('ACCOUNT','Account'),
('INVENTORY','Inventory'),
('POS','POS'),
('SALES','Sales'),
('PURCHASE','Purchase'),
('GST_REPORT','GST Report'),
('USER_MANAGEMENT','User Management');
