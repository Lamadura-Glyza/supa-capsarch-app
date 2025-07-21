import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getPendingProjects } from '../../lib/supabaseAdmin';

export default function ProjectModerationScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingProjects = useCallback(async () => {
    try {
      setLoading(true);
      const pendingProjects = await getPendingProjects();
      setProjects(pendingProjects);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPendingProjects();
    }, [fetchPendingProjects])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push({ pathname: '/(admin)/projectDetails', params: { projectId: item.id } })}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemStatus}>{item.status}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={fetchPendingProjects} />
      </View>
    );
  }

  return (
    <FlatList
      data={projects}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={<Text style={styles.title}>Pending Projects</Text>}
      ListEmptyComponent={<Text style={styles.emptyText}>No pending projects.</Text>}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemStatus: {
    fontSize: 14,
    color: 'orange',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
}); 