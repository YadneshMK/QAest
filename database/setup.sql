-- QAest Database Setup Script
-- Run this script as PostgreSQL superuser

-- Create database
CREATE DATABASE qaest_db;

-- Create user
CREATE USER qaest_user WITH PASSWORD 'qaest_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE qaest_db TO qaest_user;

-- Connect to the database
\c qaest_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO qaest_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO qaest_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO qaest_user;

-- Create extension for UUID generation (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Display success message
SELECT 'QAest database setup completed successfully!' as status; 