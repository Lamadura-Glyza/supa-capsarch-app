import { router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    // Redirect to onboarding screen
    router.replace('/onboarding');
  }, []);

  return null;
}