import { Stack } from 'expo-router'

const AuthLayout = () => {
  return (
    <Stack initialRouteName="welcome">
      <Stack.Screen name='welcome' options={{ headerShown: false }} />
      <Stack.Screen name='role-select' options={{ headerShown: false }} />
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='signup' options={{ headerShown: false }} />
      <Stack.Screen name='teacher-signup' options={{ headerShown: false }} />
    </Stack>
  )
}

export default AuthLayout
