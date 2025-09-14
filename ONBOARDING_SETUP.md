# Onboarding Flow Implementation

## Overview
This document describes the onboarding flow implementation for the CapstoneArchive React Native (Expo) app.

## Files Created/Modified

### 1. New Files
- `app/onboarding.jsx` - The main onboarding screen
- `app/role-selection.jsx` - Role selection screen for Teacher/Student choice
- `app/signup/teacher.jsx` - Teacher signup screen with simplified form
- `app/signup/_layout.jsx` - Layout for signup directory routing

### 2. Modified Files
- `app/_layout.jsx` - Updated to include onboarding, role selection, and signup screens in navigation stack
- `app/index.jsx` - Updated to redirect to onboarding screen on app start
- `app/(auth)/signup.jsx` - Updated to handle role parameter and show role-specific fields (for students)
- `app/role-selection.jsx` - Updated navigation to route to separate teacher signup screen

## Onboarding Flow

### Screen 1: Onboarding Screen (`app/onboarding.jsx`)
- **Purpose**: First screen users see when opening the app
- **Features**:
  - App logo centered in the middle
  - App name "CapstoneArchive" displayed below logo
  - "Get Started" button at the bottom that routes to role selection
  - "Already have an account? Login" text with clickable "Login" link
  - Uses app's primary color theme (`#35359e`)
  - Responsive design with proper spacing

### Screen 2: Role Selection Screen (`app/role-selection.jsx`)
- **Purpose**: Allows users to choose their role (Teacher or Student)
- **Features**:
  - Title "Continue as:" displayed at the top
  - Two large buttons: "Teacher" and "Student"
  - Teacher button routes to `/signup/teacher`
  - Student button routes to `/signup?role=student`
  - Uses app's primary color theme (`#35359e`)
  - Responsive design with proper spacing

### Screen 3a: Teacher Sign-up Screen (`app/signup/teacher.jsx`)
- **Purpose**: Teacher registration with simplified form
- **Features**:
  - Form fields: Full Name, Email, Password, Confirm Password (all required)
  - Basic validation (required fields, password match, minimum length)
  - Role automatically set to 'teacher'
  - After successful signup, redirects to login screen
  - Has link to go back to login screen

### Screen 3b: Student Sign-up Screen (`app/(auth)/signup.jsx`)
- **Purpose**: Student registration with role-specific fields
- **Features**:
  - Shows selected role at the top ("Signing up as: Student")
  - Year Level and Block fields included for students
  - Role is included in user metadata and profile creation
  - After successful signup, redirects to login screen
  - Has link to go back to login screen

### Screen 3: Login Screen (`app/(auth)/login.jsx`)
- **Purpose**: User authentication (already existed)
- **Navigation**:
  - Accessible from onboarding screen via "Login" link
  - Has link to go to signup screen
  - Has link to forgot password screen

## Navigation Flow

```
App Start → Onboarding Screen
    ↓
    ├── "Get Started" → Role Selection Screen
    │       ↓
    │       ├── "Teacher" → Teacher Signup Screen (/signup/teacher)
    │       └── "Student" → Student Signup Screen (/signup?role=student)
    │               ↓
    │               └── Success → Login Screen
    │
    └── "Login" → Login Screen
            ↓
            └── Success → Main App (Tabs/AdminTabs)
```

## Technical Implementation

### Key Features
1. **Clean Code Principles**: Following Robert C. Martin's clean code principles
   - Single responsibility for each component
   - Clear, descriptive function and variable names
   - Proper separation of concerns

2. **Responsive Design**:
   - Uses `SafeAreaView` for proper device compatibility
   - Flexible layout with `flex` properties
   - Proper spacing and padding for different screen sizes

3. **Accessibility**:
   - Uses `TouchableOpacity` and `Pressable` for proper touch feedback
   - Proper contrast ratios with the color theme
   - Clear visual hierarchy

4. **Navigation**:
   - Uses Expo Router for type-safe navigation
   - Proper screen stacking and routing
   - Consistent navigation patterns

### Color Theme Integration
The onboarding screen uses the existing color constants:
- `COLORS.primary` (`#35359e`) - Background color
- `COLORS.white` (`#FFFFFF`) - Button background and text
- Consistent with existing login and signup screens

### Error Handling
- Proper loading states
- Error message display
- Graceful navigation fallbacks

## Testing
To test the onboarding flow:
1. Start the app with `npm start`
2. The app should automatically redirect to the onboarding screen
3. Test "Get Started" button → should navigate to signup
4. Test "Login" link → should navigate to login
5. Test navigation between signup and login screens
6. Test successful authentication flow

## Future Enhancements
- Add onboarding animations
- Include app feature highlights
- Add skip option for returning users
- Implement onboarding completion tracking
