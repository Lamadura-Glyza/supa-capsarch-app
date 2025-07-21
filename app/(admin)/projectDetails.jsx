import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { approveProject, disapproveProject, getProjectById } from '../../lib/supabaseAdmin';

export default function ProjectDetailsScreen() {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const projectData = await getProjectById(projectId);
      setProject(projectData);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveProject(projectId);
      Alert.alert('Success', 'Project approved successfully.');
      router.back();
    } catch (e) {
      Alert.alert('Error', `Failed to approve project: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisapprove = async () => {
    setIsSubmitting(true);
    try {
      await disapproveProject(projectId, notes);
      Alert.alert('Success', 'Project disapproved successfully.');
      router.back();
    } catch (e) {
      Alert.alert('Error', `Failed to disapprove project: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={fetchProject} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text>Project not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.label}>Status</Text>
      <Text style={styles.value}>{project.status}</Text>
      <Text style={styles.label}>Submitted By</Text>
      <Text style={styles.value}>{project.user_id}</Text>
      <Text style={styles.label}>Description</Text>
      <Text style={styles.value}>{project.description}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Disapproval notes (required if disapproving)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Approve" onPress={handleApprove} disabled={isSubmitting} />
        <Button title="Disapprove" color="red" onPress={handleDisapprove} disabled={isSubmitting || !notes} />
      </View>
    </ScrollView>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
}); 