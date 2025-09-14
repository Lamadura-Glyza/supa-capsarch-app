# Department Field Setup Guide

This guide will help you add the department field to your user profiles and ensure it's properly stored and displayed in your database.

## Problem Description

The department field was added to the signup form but the data was not being stored in the database because:
1. The `user_profiles` table didn't have a `department` column
2. The profile creation functions weren't handling the department field
3. The profile display wasn't showing the actual department value

## What Has Been Fixed

### 1. Updated Signup Process
- ✅ Department field added to signup form with options: BSIT, BSHM, BEED, BSED, BPED, BSENTREP
- ✅ Department data is now passed to `createUserProfile` function immediately after signup
- ✅ Department is included in user metadata and profile creation

### 2. Updated Database Functions
- ✅ `createUserProfile` function now includes department field
- ✅ `createDefaultProfile` function now includes department field  
- ✅ `getUserProfile` function now retrieves department field
- ✅ `updateUserProfile` function now handles department field updates

### 3. Updated Profile Display
- ✅ Profile screen now shows actual department from database instead of hardcoded "BSIT"
- ✅ EditProfile screen now includes department editing capability
- ✅ Department field is properly loaded and saved during profile updates

## Database Setup Required

### Step 1: Add Department Column
Run this SQL script in your Supabase SQL Editor:

```sql
-- Add department column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Update existing profiles to have a default department value
UPDATE user_profiles 
SET department = 'Not specified' 
WHERE department IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'department';
```

### Step 2: Verify Table Structure
Your `user_profiles` table should now have these columns:
- `user_id` (UUID, primary key)
- `full_name` (TEXT)
- `email` (TEXT)
- `year_level` (TEXT)
- `block` (TEXT)
- `department` (TEXT) ← NEW COLUMN
- `gender` (TEXT)
- `bio` (TEXT, nullable)
- `profile_picture_url` (TEXT, nullable)
- `role` (TEXT, default: 'user')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Files Modified

### 1. `app/(auth)/signup.jsx`
- Added department state variable
- Added department validation
- Added department to user metadata
- Added department to profile creation after signup

### 2. `lib/supabase.js`
- Updated `createUserProfile` function
- Updated `createDefaultProfile` function
- Updated `getUserProfile` function
- Updated `updateUserProfile` function

### 3. `app/(tabs)/profile.jsx`
- Updated department display to show actual value from profile

### 4. `app/EditProfile.jsx`
- Added department state variable
- Added department loading from profile
- Added department picker in edit form
- Added department to profile save data

## Testing the Fix

### 1. Test New User Signup
1. Create a new account with department selection
2. Verify department is stored in database
3. Check profile display shows correct department

### 2. Test Existing Users
1. Existing users will have "Not specified" as department
2. They can update their department through Edit Profile
3. Changes should persist in database

### 3. Test Profile Updates
1. Edit profile and change department
2. Save changes
3. Verify department is updated in database
4. Verify profile display shows updated department

## Troubleshooting

### Department Not Showing
- Check if `user_profiles` table has `department` column
- Verify the SQL script was run successfully
- Check browser console for any errors

### Department Not Saving
- Verify `updateUserProfile` function includes department
- Check if RLS policies allow department updates
- Verify user has permission to update their profile

### Department Not Loading
- Check if `getUserProfile` function selects department field
- Verify profile data includes department in response
- Check if department value is null/undefined

## Next Steps

1. **Run the SQL script** to add the department column
2. **Test with a new user** to verify signup works
3. **Test with existing users** to verify they can update department
4. **Monitor database** to ensure department data is being stored
5. **Consider adding validation** to ensure department is always selected

## Verification Commands

After running the SQL script, you can verify the setup with these queries:

```sql
-- Check if department column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'department';

-- Check existing department values
SELECT user_id, full_name, department 
FROM user_profiles 
LIMIT 10;

-- Check for any null department values
SELECT COUNT(*) 
FROM user_profiles 
WHERE department IS NULL;
```

The department field should now be fully functional in your app!
