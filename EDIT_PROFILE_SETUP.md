# Edit Profile Setup Guide

This guide will help you set up the Edit Profile functionality in your React Native Expo app with Supabase integration.

## Prerequisites

- Your Supabase project is already configured
- You have the existing `user_profiles` table set up
- Your app has the required dependencies installed (`expo-image-picker`)

## Step 1: Update Database Schema

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the following SQL script to add the new columns:

```sql
-- Add bio column (nullable)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add profile_picture_url column (nullable)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
```

## Step 2: Create Storage Bucket

1. In your Supabase Dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it `avatars`
4. Set it to **Public**
5. Click **Create bucket**

## Step 3: Configure Storage Policies

In the SQL Editor, run these policies for the `avatars` bucket:

```sql
-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view profile pictures
CREATE POLICY "Public access to profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 4: Test the Functionality

1. Start your Expo app
2. Navigate to the Edit Profile screen
3. Test the following features:
   - Loading existing profile data
   - Uploading a profile picture
   - Editing bio and other fields
   - Saving changes

## Features Implemented

### ✅ Profile Data Loading
- Automatically loads existing profile data from Supabase
- Pre-fills all form fields with current values
- Shows loading state while fetching data

### ✅ Profile Picture Upload
- Uses `expo-image-picker` for image selection
- Uploads images to Supabase Storage in the `avatars` bucket
- Handles permissions and error states
- Shows preview of selected image

### ✅ Form Validation
- Validates required fields (Full Name)
- Shows appropriate error messages
- Prevents saving with invalid data

### ✅ Data Persistence
- Saves all profile updates to Supabase
- Updates both database and storage
- Shows success/error feedback
- Handles network errors gracefully

### ✅ UI/UX Features
- Clean, modern design matching your app's theme
- Loading and saving states
- Disabled button during save operations
- Proper error handling with user-friendly messages

## File Structure

```
app/
├── EditProfile.jsx          # Main Edit Profile screen
lib/
├── supabase.js             # Updated with new functions
├── update-profile-schema.sql  # Database migration script
└── EDIT_PROFILE_SETUP.md   # This setup guide
```

## Troubleshooting

### Image Upload Issues
- Ensure the `avatars` bucket exists and is public
- Check that storage policies are correctly configured
- Verify image picker permissions are granted

### Database Issues
- Run the migration script to add new columns
- Check that RLS policies allow user access to their own profiles
- Verify the `user_profiles` table structure

### App Crashes
- Ensure all dependencies are installed
- Check console logs for specific error messages
- Verify Supabase configuration in `constants/index.js`

## Next Steps

1. Test the functionality thoroughly
2. Consider adding image compression for better performance
3. Add profile picture deletion functionality if needed
4. Implement profile picture cropping/editing features
5. Add profile data validation on the server side

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure all database migrations have been applied
4. Test with a fresh user account to isolate issues 