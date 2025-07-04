import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import SplashScreen from "../components/SplashScreen";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      router.replace("/(auth)/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <View />; // This won't be shown as we navigate away
}