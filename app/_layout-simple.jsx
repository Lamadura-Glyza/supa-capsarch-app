import { Stack } from 'expo-router';
import React from 'react';
import { RefreshProvider } from '../lib/RefreshContext';

export default function RootLayout() {
  return (
    <RefreshProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(adminTabs)" />
      </Stack>
    </RefreshProvider>
  );
}
