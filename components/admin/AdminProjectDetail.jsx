import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { approveProject, disapproveProject, getProjectById } from '../../lib/supabaseAdmin';

export default function AdminProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProjectById(projectId).then(setProject);
  }, [projectId]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveProject(projectId);
      Alert.alert('Success', 'Project approved!');
      onBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisapprove = async () => {
    setLoading(true);
    try {
      await disapproveProject(projectId, notes);
      Alert.alert('Success', 'Project disapproved!');
      onBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Back" onPress={onBack} />
      <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{project.title}</Text>
      <Text>{project.description}</Text>
      <Text>Status: {project.status}</Text>
      <Text>Submitted by: {project.user_id}</Text>
      <TextInput
        placeholder="Disapproval notes (optional)"
        value={notes}
        onChangeText={setNotes}
        style={{ borderWidth: 1, borderColor: '#ccc', marginVertical: 12, padding: 8, borderRadius: 6 }}
      />
      <Button title="Approve" onPress={handleApprove} disabled={loading} />
      <Button title="Disapprove" onPress={handleDisapprove} color="red" disabled={loading} />
    </View>
  );
} 