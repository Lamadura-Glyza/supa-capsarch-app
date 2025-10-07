import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { getLoginErrorMessage } from '../lib/loginMessageStore';
import { RefreshProvider } from '../lib/RefreshContext';
import { getUserProfile, supabase } from '../lib/supabase';

console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
console.log("EXPO_PUBLIC_SUPABASE_URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET");
console.log("EXPO_PUBLIC_SUPABASE_SERVICE_KEY:", process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY ? "SET" : "NOT SET");
console.log("=== END DEBUG ===");

// Test Supabase client initialization
try {
  console.log("Testing Supabase client initialization...");
  const { supabase } = require('../lib/supabase');
  console.log("Supabase client created successfully");
} catch (error) {
  console.error("Error creating Supabase client:", error);
}

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPendingTeacher, setIsPendingTeacher] = useState(false); // 🧩 Added flag
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Check authentication status
    const checkAuth = async () => {
      try {
        console.log("Starting auth check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session check error:', sessionError);
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
          }
          return;
        }
        console.log('Initial auth check - session:', !!session);
        if (mounted) {
          setIsLoggedIn(!!session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, !!session);

          // Handle pending/rejected teacher redirect back to login
          if (event === 'SIGNED_OUT') {
            const message = getLoginErrorMessage();
            if (message) {
              console.log('Redirecting back to login with message:', message);
              router.replace({ pathname: '/login', params: { errorMessage: message } });
              return;
            }
          }

          if (mounted) {
            const newLoginState = !!session;
            console.log('Setting isLoggedIn to:', newLoginState, 'for event:', event);
            setIsLoggedIn(newLoginState);
            setIsLoading(false);

            if (newLoginState) {
              setCheckingRole(true);
              getUserProfile().then(async (profile) => {
                // No auto sign-outs; login gate happens before session creation
                setRole(profile?.role);
                setCheckingRole(false);
              }).catch((error) => {
                console.error('Error fetching user profile:', error);
                setRole(null);
                setCheckingRole(false);
              });
            } else {
              setRole(null);
            }
          }

          if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            console.log('Token refreshed or user updated, session is still valid');
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
            setRole(null);
          }
        }
      }
    );

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Check user role after login
  useEffect(() => {
    if (!isLoggedIn) return;
    setCheckingRole(true);

    getUserProfile().then(async (profile) => {
      if (profile?.role === 'teacher') {
        if (profile?.status === 'pending') {
          console.log('Redirecting pending teacher to PendingApprovalScreen');
          setIsPendingTeacher(true);
          setCheckingRole(false);
          setTimeout(() => {
            router.replace('/pending-approval?status=pending');
          }, 150);
          return;
        }

        if (profile?.status === 'rejected') {
          console.log('Redirecting rejected teacher to PendingApprovalScreen');
          setIsPendingTeacher(true);
          setCheckingRole(false);
          setTimeout(() => {
            router.replace('/pending-approval?status=rejected');
          }, 150);
          return;
        }
      }

      setIsPendingTeacher(false);
      setRole(profile?.role);
      setCheckingRole(false);
    }).catch((error) => {
      console.error('Error fetching user profile:', error);
      setRole(null);
      setCheckingRole(false);
    });
  }, [isLoggedIn]);

  // Error handling
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#333' }}>
          Something went wrong. Please restart the app.
        </Text>
        <TouchableOpacity 
          style={{ padding: 10, backgroundColor: '#35359e', borderRadius: 8 }}
          onPress={() => setHasError(false)}
        >
          <Text style={{ color: 'white' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#333' }}>
          App configuration is missing. Please contact support.
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
          This is a configuration issue that needs to be fixed by the developer.
        </Text>
      </View>
    );
  }

  if (isLoading || checkingRole) {
    return <ActivityIndicator size="large" color="#35359e" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // ✅ Routing logic based on role and status
  return (
    <RefreshProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn && <Stack.Screen name="(auth)" />}
        {!isLoggedIn && <Stack.Screen name="pending-approval" />}
        {isLoggedIn && (role === 'admin' || role === 'teacher_admin') && (
          <Stack.Screen name="(adminTabs)" />
        )}
        {isLoggedIn && !(role === 'admin' || role === 'teacher_admin') && (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </RefreshProvider>
  );
}
