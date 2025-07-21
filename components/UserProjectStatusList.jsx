import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { getUserProjects } from '../lib/supabase';

export default function UserProjectStatusList({ userId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getUserProjects(userId)
      .then(setProjects)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#35359e" />;

  if (projects.length === 0) {
    return <Text style={{ textAlign: 'center', marginTop: 40 }}>You have not uploaded any projects yet.</Text>;
  }

  return (
    <FlatList
      data={projects}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#eee'
        }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
          <Text>Status: <Text style={{
            color:
              item.status === 'approved' ? 'green' :
              item.status === 'disapproved' ? 'red' :
              '#888'
          }}>{item.status || 'pending'}</Text></Text>
          {item.status === 'disapproved' && item.admin_notes && (
            <Text style={{ color: '#ff6b6b', marginTop: 4 }}>Reason: {item.admin_notes}</Text>
          )}
        </View>
      )}
    />
  );
} 