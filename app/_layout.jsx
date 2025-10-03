import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
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
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

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
            // Always re-check role after any auth state change
            if (newLoginState) {
              setCheckingRole(true);
              getUserProfile().then(profile => {
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
      subscription.unsubscribe();
    };
  }, []);

  // Check user role after login
  useEffect(() => {
    if (!isLoggedIn) return;
    setCheckingRole(true);
    getUserProfile().then(profile => {
      setRole(profile?.role);
      setCheckingRole(false);
    }).catch((error) => {
      console.error('Error fetching user profile:', error);
      setRole(null);
      setCheckingRole(false);
    });
  }, [isLoggedIn]);


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

  if (isLoading || checkingRole || (isLoggedIn && role === null)) {
    return <ActivityIndicator size="large" color="#35359e" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // Route based on role
  return (
    <RefreshProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="(auth)" />
        ) : role === 'admin' ? (
          <Stack.Screen name="(adminTabs)" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </RefreshProvider>
  );
} 