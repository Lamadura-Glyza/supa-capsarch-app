import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import SplashScreen from '../components/SplashScreen';
import { RefreshProvider } from '../lib/RefreshContext';
import { getUserProfile, supabase } from '../lib/supabase';

console.log("EXPO_PUBLIC_SUPABASE_URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
console.log("EXPO_PUBLIC_SUPABASE_SERVICE_KEY:", process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY);

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Check authentication status
    const checkAuth = async () => {
      try {
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
            }).catch(() => setCheckingRole(false));
          } else {
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
    }).catch(() => setCheckingRole(false));
  }, [isLoggedIn]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || isLoading || checkingRole || (isLoggedIn && role === null)) {
    return <SplashScreen />;
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