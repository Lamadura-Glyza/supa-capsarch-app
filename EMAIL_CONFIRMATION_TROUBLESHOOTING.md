# Email Confirmation Troubleshooting Guide

## Issue Fixed
I've updated your signup flow to properly handle email confirmation. The main changes include:

### 1. **Improved Signup Flow** (`app/(auth)/signup.jsx` & `app/signup/teacher.jsx`)
- Better error handling for different signup scenarios
- Proper detection of email confirmation requirement
- Clear user feedback messages
- Rate limiting error handling

### 2. **Enhanced Supabase Integration** (`lib/supabase.js`)
- Detailed logging for signup process
- Better error message handling
- User confirmation status tracking

## How Email Confirmation Works Now

### Normal Flow:
1. User fills out signup form
2. `signUpWithEmail()` is called
3. Supabase creates user account but **doesn't** create a session
4. User receives confirmation email
5. User clicks link in email to confirm
6. User can then log in normally

### What the Code Now Handles:
- ✅ **User created, needs confirmation**: Shows "Check your email" message
- ✅ **User already exists**: Shows appropriate error
- ✅ **Rate limiting**: Shows "wait a few minutes" message
- ✅ **Invalid email/password**: Shows specific error messages
- ✅ **Network errors**: Shows generic error message

## Testing the Fix

### 1. **Test Signup Process**
```bash
# Start your development server
npm start
# or
expo start
```

### 2. **Check Console Logs**
Look for these log messages:
- `Signing up with metadata: {...}`
- `Signup result: { hasData: true, hasError: false, hasUser: true, hasSession: false }`
- `User created, email confirmation required`

### 3. **Expected Behavior**
- User fills signup form
- Clicks "Signup" button
- Sees "Account created successfully! Please check your email to confirm your account, then log in."
- Gets redirected to login page
- Receives confirmation email

## Common Issues & Solutions

### Issue 1: "No user data returned from signup"
**Cause**: Supabase configuration issue or network problem
**Solution**: 
- Check your Supabase project is active
- Verify environment variables are set
- Check network connection

### Issue 2: "Signup failed. Please try again"
**Cause**: Server error or invalid data
**Solution**:
- Check console logs for specific error
- Verify email format is valid
- Ensure password meets requirements (6+ characters)

### Issue 3: "Too many signup attempts"
**Cause**: Rate limiting from Supabase
**Solution**:
- Wait 1-15 minutes before trying again
- Check Supabase dashboard for rate limit settings

### Issue 4: No confirmation email received
**Cause**: Email delivery issue
**Solution**:
- Check spam/junk folder
- Verify email address is correct
- Check Supabase email settings in dashboard
- Try a different email address

## Supabase Configuration Check

### 1. **Verify Email Settings**
Go to your Supabase dashboard:
1. Navigate to "Authentication" → "Settings"
2. Check "Email" section
3. Ensure "Enable email confirmations" is ON
4. Verify "Site URL" is set correctly

### 2. **Check Rate Limits**
1. Go to "Authentication" → "Settings"
2. Check "Rate Limits" section
3. Adjust if needed (default is usually 3 emails per hour)

### 3. **Verify SMTP Settings**
1. Go to "Authentication" → "Settings"
2. Check "SMTP Settings"
3. Ensure they're configured correctly

## Environment Variables

Make sure your `.env` file contains:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Debug Steps

### 1. **Check Console Logs**
Look for these specific log messages:
```
Signing up with metadata: { full_name: "...", role: "student", ... }
Email: user@example.com
Password length: 8
Signup result: { hasData: true, hasError: false, hasUser: true, hasSession: false, userConfirmed: false }
User created, email confirmation required
```

### 2. **Test with Different Emails**
- Try with a Gmail address
- Try with a different domain
- Check if emails arrive in spam folder

### 3. **Check Supabase Dashboard**
- Go to "Authentication" → "Users"
- Look for your test user
- Check if user is "Unconfirmed" status

## Next Steps

1. **Test the signup process** with a new email address
2. **Check console logs** for the detailed signup information
3. **Verify email delivery** by checking your inbox/spam folder
4. **Test login** after email confirmation

## If Issues Persist

1. **Check Supabase Status**: Visit https://status.supabase.com
2. **Review Supabase Logs**: Check your project's logs in the dashboard
3. **Contact Support**: If the issue is with Supabase configuration

The signup flow should now work correctly with proper email confirmation handling!
