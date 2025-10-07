import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import COLORS from '../../constants/colors';

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.darkprimary || '#35359e',
        tabBarInactiveTintColor: COLORS.primary || '#888',
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
          if (route.name === 'dashboard') {
            return <MaterialCommunityIcons name={focused ? 'view-dashboard' : 'view-dashboard-outline'} size={28} color={color} />;
          }
          if (route.name === 'teachers') {
            return <Ionicons name={focused ? 'people' : 'people-outline'} size={28} color={color} />;
          }
          if (route.name === 'analytics') {
            return <MaterialCommunityIcons name={focused ? 'chart-bar' : 'chart-bar'} size={28} color={color} />;
          }
          if (route.name === 'profile') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={28} color={color} />;
          }
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', alignContent: 'center', justifyContent: 'center' },
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="teachers" options={{ title: 'Teachers' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
} 