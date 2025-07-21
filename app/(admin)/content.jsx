import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { deleteProjectAsAdmin } from '../../lib/supabaseAdmin';

export default function ContentRemovalScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllProjects = useCallback(async () => {
    try {
      setLoading(true);
      // Using the regular supabase client here since we just need to read all projects,
      // which should be allowed by RLS for authenticated users.
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      setProjects(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAllProjects();
    }, [fetchAllProjects])
  );

  const handleDelete = async (projectId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProjectAsAdmin(projectId);
              setProjects((prev) => prev.filter((p) => p.id !== projectId));
              Alert.alert('Success', 'Project deleted successfully.');
            } catch (e) {
              Alert.alert('Error', `Failed to delete project: ${e.message}`);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemStatus}>{item.status}</Text>
      </View>
      <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={fetchAllProjects} />
      </View>
    );
  }

  return (
    <FlatList
      data={projects}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={<Text style={styles.title}>All Projects</Text>}
      ListEmptyComponent={<Text style={styles.emptyText}>No projects found.</Text>}
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
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemStatus: {
    fontSize: 14,
    color: 'gray',
    textTransform: 'capitalize',
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