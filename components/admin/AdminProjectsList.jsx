import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { listProjectsByStatus } from '../../lib/supabaseAdmin';

export default function AdminProjectsList({ onSelectProject }) {
  const [status, setStatus] = useState('pending');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listProjectsByStatus(status)
      .then(setProjects)
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {['pending', 'approved', 'disapproved'].map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatus(s)}
            style={{
              backgroundColor: status === s ? '#35359e' : '#e0e7ff',
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 6,
              marginRight: 10,
            }}
          >
            <Text style={{ color: status === s ? '#fff' : '#35359e', fontWeight: 'bold' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>Status: {item.status}</Text>
              <TouchableOpacity onPress={() => onSelectProject(item.id)}>
                <Text style={{ color: '#35359e', marginTop: 8 }}>View</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
} 