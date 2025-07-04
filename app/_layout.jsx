import { Slot, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import SplashScreen from '../components/SplashScreen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Replace with real auth logic

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return (
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Show tabs if logged in
  return <Slot />;
} 