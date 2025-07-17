import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#35359e', marginBottom: 24 }}>Profile Tab</Text>
      <TouchableOpacity
        onPress={handleLogout}
        style={{ backgroundColor: '#35359e', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
} 