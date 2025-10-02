-- AHRP Report System Database Setup
-- Run this script in MySQL to create the necessary database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS ahrp_reports;
USE ahrp_reports;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    discriminator VARCHAR(10),
    avatar VARCHAR(255),
    email VARCHAR(255),
    role ENUM('support', 'moderator', 'admin', 'owner') DEFAULT 'support',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    reporter_discord_id VARCHAR(255),
    reporter_name VARCHAR(255) NOT NULL,
    report_type ENUM('player', 'bug', 'feedback', 'other') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
    assigned_to INT NULL,
    evidence_urls JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_type (report_type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_discord_id (reporter_discord_id)
);

-- Create report_comments table
CREATE TABLE IF NOT EXISTS report_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id INT,
    commenter_name VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_report_id (report_id),
    INDEX idx_created_at (created_at)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Create sessions table (for express-session)
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
);

-- Insert default admin user (replace discord_id with your actual Discord ID)
INSERT IGNORE INTO users (discord_id, username, discriminator, role) 
VALUES ('YOUR_DISCORD_ID_HERE', 'Admin', '0001', 'owner');

-- Create analytics view for reporting
CREATE OR REPLACE VIEW report_analytics AS
SELECT 
    DATE(created_at) as report_date,
    report_type,
    status,
    priority,
    COUNT(*) as count
FROM reports 
GROUP BY DATE(created_at), report_type, status, priority;

-- Show table structure
SHOW TABLES;
DESCRIBE users;
DESCRIBE reports;