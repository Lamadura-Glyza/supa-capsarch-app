# 🔧 RLS Policy Fix for User Profile Display Issue

## Problem Description
When users log in to different accounts, they cannot see the full names or profile pictures of other users who uploaded projects. This is caused by restrictive Row Level Security (RLS) policies on the `user_profiles` table.

## Root Cause
The current RLS policies on the `user_profiles` table only allow users to read their own profile, preventing them from seeing other users' profile information (names and profile pictures) in project posts.

## Solution
Apply the SQL script to fix the RLS policies so that:
1. **All authenticated users can READ all user profiles** (for displaying in project posts)
2. **Users can only INSERT/UPDATE/DELETE their own profile** (for security)

## How to Apply the Fix

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
**Option A: If you got a "policy already exists" error:**
1. Copy the contents of `debug-and-fix-rls.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

**Option B: If no errors occurred:**
1. Copy the contents of `complete-rls-fix.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify the Fix
After running the script, you should see:
- ✅ 4 policies created for `user_profiles` table
- ✅ 4 policies created for `storage.objects` (avatars bucket)
- ✅ Verification queries showing the policies are active

### Step 4: Test the Fix
1. Run the `test-user-profiles-access.sql` script to verify everything is working
2. Check that all projects show user profile data
3. Verify no projects are missing user profile information

## What the Fix Does

### User Profiles Table Policies:
- **"Allow reading all user profiles"**: Allows any authenticated user to read all user profiles
- **"Users can insert own profile"**: Users can only create their own profile
- **"Users can update own profile"**: Users can only update their own profile  
- **"Users can delete own profile"**: Users can only delete their own profile

### Storage Policies (Avatars):
- **Public access to profile pictures**: Allows viewing of profile pictures
- **User-specific upload/update/delete**: Users can only manage their own pictures

## Expected Results
After applying this fix:
- ✅ Users can see other users' full names in project posts
- ✅ Users can see other users' profile pictures in project posts
- ✅ Users can still only edit their own profile information
- ✅ Profile pictures are publicly accessible for display

## Testing the Fix
1. Log in with User A and upload a project
2. Log in with User B and check if User A's name and profile picture appear in the project post
3. Verify that User B can still only edit their own profile

## Troubleshooting
If the issue persists after applying the fix:

1. **Check Console Logs**: Look for RLS-related errors in the browser console
2. **Verify Policies**: Run the verification queries in the SQL script
3. **Check User Profiles**: Ensure all users have profiles created
4. **Storage Bucket**: Verify the `avatars` bucket exists and is public

## Security Note
This fix maintains security by:
- Only allowing authenticated users to read profiles
- Restricting all write operations to own profile only
- Maintaining proper storage access controls

The fix enables the social aspect of the app (seeing who posted what) while maintaining data privacy and security. 