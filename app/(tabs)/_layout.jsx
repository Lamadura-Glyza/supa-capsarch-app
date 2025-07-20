import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import COLORS from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.darkprimary,
        tabBarInactiveTintColor: COLORS.primary,
        tabBarStyle: { 
          height: 100, 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'home') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />;
          }
          if (route.name === 'search') {
            return <Feather name="search" size={26} color={color} />;
          }
          if (route.name === 'upload') {
            return <Feather name="plus-circle" size={32} color={color} />;
          }
          if (route.name === 'notifications') {
            return <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={26} color={color} />;
          }
          if (route.name === 'profile') {
            return <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={28} color={color} />;
          }
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', alignContent: 'center', justifyContent: 'center'},
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search'}} />
      <Tabs.Screen name="upload" options={{ title: 'Upload' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications'}} />
      <Tabs.Screen name="profile" options={{ title: 'Profile'}} />
    </Tabs>
  );
} 