import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProjectStatusList from '../components/UserProjectStatusList';
import { getCurrentUser } from '../lib/supabase';

export default function ProjectStatusScreen() {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    getCurrentUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id || null);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      }}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={28} color="#35359e" />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          fontSize: 20,
          fontWeight: 'bold',
          color: '#35359e',
          textAlign: 'center',
          marginRight: 28, // to balance space due to icon on the left
        }}>
          Project Status
        </Text>
      </View>

      {/* Project List */}
      <View style={{ flex: 1, padding: 16 }}>
        <UserProjectStatusList userId={currentUserId} />
      </View>
    </SafeAreaView>
  );
}