-- Migration script to add bio and profile_picture_url columns to user_profiles table
-- Run this script in your Supabase SQL editor to update the existing table

-- Add bio column (nullable)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add profile_picture_url column (nullable)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create storage bucket for avatars if it doesn't exist
-- Note: You'll need to create this bucket manually in Supabase Dashboard
-- Go to Storage > Create a new bucket named 'avatars'
-- Set it to public and configure RLS policies

-- Optional: Add comments to document the new columns
COMMENT ON COLUMN user_profiles.bio IS 'User bio/description text';
COMMENT ON COLUMN user_profiles.profile_picture_url IS 'URL to user profile picture stored in Supabase Storage'; 