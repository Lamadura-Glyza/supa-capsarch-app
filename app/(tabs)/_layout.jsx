import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import COLORS from '../../constants/colors';
import { getUnreadNotificationCount } from '../../lib/supabase';

function NotificationTabIcon({ color, focused }) {
  const [unread, setUnread] = useState(0);
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      getUnreadNotificationCount().then(count => { if (mounted) setUnread(count); });
      return () => { mounted = false; };
    }, [])
  );
  useEffect(() => {
    let mounted = true;
    const poll = () => {
      getUnreadNotificationCount().then(count => { if (mounted) setUnread(count); });
    };
    const interval = setInterval(poll, 5000); // 5 seconds
    poll(); // initial fetch
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  return (
    <View>
      <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={26} color={color} />
      {unread > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -6,
          backgroundColor: 'red',
          borderRadius: 8,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </View>
  );
}

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
            return <NotificationTabIcon color={color} focused={focused} />;
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