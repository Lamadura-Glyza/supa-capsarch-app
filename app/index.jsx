import React, { useState } from 'react';
import SplashScreen from '../components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return showSplash ? <SplashScreen /> : <SignupScreen/>;
}