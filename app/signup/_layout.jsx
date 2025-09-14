import { Stack } from 'expo-router';
import React from 'react';

const SignupLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="teacher" />
    </Stack>
  );
};

export default SignupLayout;
