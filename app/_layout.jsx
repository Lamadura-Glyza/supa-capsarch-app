import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RefreshProvider } from '../lib/RefreshContext';
import { createDefaultProfile, supabase } from '../lib/supabase';

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
  const [accountError, setAccountError] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Error boundary for the entire component
  const handleError = (error) => {
    console.error('Root layout error:', error);
    setHasError(true);
  };

  useEffect(() => {
    let mounted = true;

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && (isLoading || checkingRole)) {
        console.log('Loading timeout reached, forcing app to proceed');
        setLoadingTimeout(true);
        setIsLoading(false);
        setCheckingRole(false);
      }
    }, 10000); // 10 second timeout

    // Check authentication status
    const checkAuth = async () => {
      try {
        console.log("Starting auth check...");
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
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

    // Wrap the entire effect in try-catch
    try {

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, !!session);
          if (mounted) {
            // Always update state based on session presence
            const newLoginState = !!session;
            console.log('Setting isLoggedIn to:', newLoginState, 'for event:', event);
            setIsLoggedIn(newLoginState);
            setIsLoading(false);
            setAccountError(null); // Clear any previous account errors
            
            // Always re-check role after any auth state change
            if (newLoginState) {
              setCheckingRole(true);
              
              try {
                // Single optimized query to get user profile and validate account
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  console.log('No user found in auth state change');
                  setRole(null);
                  setCheckingRole(false);
                  return;
                }

                const { data: profileData, error: profileError } = await supabase
                  .from('user_profiles')
                  .select('user_id, role')
                  .eq('user_id', user.id)
                  .single();

                if (profileError) {
                  if (profileError.code === 'PGRST116') { // No rows returned
                    console.log('No profile found, creating default profile...');
                    await createDefaultProfile();
                    // After creating profile, get the role
                    const { data: newProfile } = await supabase
                      .from('user_profiles')
                      .select('role')
                      .eq('user_id', user.id)
                      .single();
                    setRole(newProfile?.role || null);
                  } else {
                    console.error('Error fetching user profile:', profileError);
                    setRole(null);
                  }
                } else {
                  setRole(profileData?.role || null);
                }
                setCheckingRole(false);
              } catch (error) {
                console.error('Error in auth state change handler:', error);
                setRole(null);
                setCheckingRole(false);
              }
            } else {
              setRole(null);
            }
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

      // Cleanup subscription and mounted flag
      return () => {
        mounted = false;
        clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    } catch (error) {
      handleError(error);
      if (mounted) {
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    }
  }, []);

  // Note: Role checking is now handled in the auth state change handler above
  // This eliminates redundant database calls and improves performance

  // Account error handler - show error and redirect to login
  if (accountError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#333' }}>
          {accountError}
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#666' }}>
          Please log in with a valid account.
        </Text>
        <TouchableOpacity 
          style={{ padding: 10, backgroundColor: '#35359e', borderRadius: 8 }}
          onPress={() => {
            setAccountError(null);
            setIsLoggedIn(false);
            setIsLoading(false);
          }}
        >
          <Text style={{ color: 'white' }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Global error handler
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

  // Check if environment variables are missing
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

  // Show loading state while checking auth/role
  if (isLoading || checkingRole || (isLoggedIn && role === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#35359e' }}>
        <Text style={{ color: 'white', fontSize: 16 }}>Loading...</Text>
        {loadingTimeout && (
          <TouchableOpacity 
            style={{ marginTop: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 }}
            onPress={() => {
              setLoadingTimeout(false);
              setIsLoading(false);
              setCheckingRole(false);
            }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Route based on role
  return (
    <RefreshProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn && <Stack.Screen name="onboarding" />}
        {!isLoggedIn && <Stack.Screen name="role-selection" />}
        {!isLoggedIn && <Stack.Screen name="signup" />}
        {!isLoggedIn && <Stack.Screen name="(auth)" />}
        {isLoggedIn && role === 'head_admin' && <Stack.Screen name="(adminTabs)" />}
        {isLoggedIn && role !== 'head_admin' && <Stack.Screen name="(tabs)" />}
      </Stack>
    </RefreshProvider>
  );
} 