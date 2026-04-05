-- Migration: Add last_login and last_activity_at columns to users table
-- Purpose: Track user login and activity timestamps for the OTP logout functionality
-- Date: April 5, 2026

-- Add missing columns to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;

-- Confirm the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
ORDER BY ordinal_position;
