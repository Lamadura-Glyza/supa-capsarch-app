-- Add department column to user_profiles table
-- Run this in your Supabase SQL Editor

-- Add department column (nullable)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Update existing profiles to have a default department value
UPDATE user_profiles 
SET department = 'Not specified' 
WHERE department IS NULL;

-- Make department column required for future inserts (optional)
-- ALTER TABLE user_profiles ALTER COLUMN department SET NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'department';
