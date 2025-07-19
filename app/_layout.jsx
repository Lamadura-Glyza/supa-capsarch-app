import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import SplashScreen from '../components/SplashScreen';
import { RefreshProvider } from '../lib/RefreshContext';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  console.log('Render state - showSplash:', showSplash, 'isLoading:', isLoading, 'isLoggedIn:', isLoggedIn);
  
  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <RefreshProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="(auth)" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </RefreshProvider>
  );
} 