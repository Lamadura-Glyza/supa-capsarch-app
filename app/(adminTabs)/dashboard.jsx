import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { approveProject, deleteProjectAsAdmin, disapproveProject, getAllUsers, getAnalytics, getPendingProjects } from '../../lib/supabaseAdmin';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingProjectId, setRejectingProjectId] = useState(null);
  const [rejectError, setRejectError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, projects, usersList] = await Promise.all([
        getAnalytics(),
        getPendingProjects(),
        getAllUsers(),
      ]);
      setAnalytics(analyticsData);
      setPendingProjects(projects);
      setUsers(usersList);
      // Fetch user_profiles for pending projects
      const userIds = projects.map(p => p.user_id).filter(Boolean);
      let userProfiles = [];
      if (userIds.length > 0) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        if (!error) userProfiles = data;
      }
      const map = {};
      userProfiles.forEach(u => { map[u.user_id] = u.full_name; });
      setUserMap(map);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (projectId) => {
    setActionLoading(true);
    try {
      await approveProject(projectId);
      setPendingProjects(pendingProjects.filter(p => p.id !== projectId));
      Alert.alert('Project approved');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to approve project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (projectId) => {
    setRejectingProjectId(projectId);
    setRejectNote('');
    setRejectError('');
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    if (!rejectingProjectId) return;
    setActionLoading(true);
    setRejectError('');
    try {
      await disapproveProject(rejectingProjectId, rejectNote);
      setPendingProjects(pendingProjects.filter(p => p.id !== rejectingProjectId));
      setShowRejectModal(false);
      setRejectNote('');
      setRejectingProjectId(null);
      Alert.alert('Project rejected', rejectNote ? `Reason: ${rejectNote}` : undefined);
    } catch (err) {
      setRejectError(err.message || 'Failed to reject project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setActionLoading(true);
            try {
              await deleteProjectAsAdmin(projectId);
              setPendingProjects(pendingProjects.filter(p => p.id !== projectId));
              Alert.alert('Project deleted');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete project');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaViewRN style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}><ActivityIndicator size="large" color="#35359e" /><Text>Loading admin dashboard...</Text></View>
      </SafeAreaViewRN>
    );
  }
  if (error) {
    return (
      <SafeAreaViewRN style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>
      </SafeAreaViewRN>
    );
  }

  return (
    <SafeAreaViewRN style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/image/logo.png')}
            style={styles.headerLogo}
          />
          <Text style={styles.headerTitle}>CapstoneArchive</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Pending Projects */}
        
        {pendingProjects.length === 0 ? (
          <View style={styles.centeredEmpty}><Text style={styles.emptyText}>No projects pending for approval.</Text></View>
        ) : (
          pendingProjects.map(project => (
            <View key={project.id} style={styles.projectCard}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              {project.title_description ? (
                <Text style={styles.projectField}><Text style={styles.projectFieldLabel}>Description: </Text>{project.title_description}</Text>
              ) : null}
              {project.abstract ? (
                <Text style={styles.projectField}><Text style={styles.projectFieldLabel}>Abstract: </Text>{project.abstract}</Text>
              ) : null}
              {project.source_code ? (
                <Text style={styles.projectField}><Text style={styles.projectFieldLabel}>Source Code: </Text>
                  <Text style={styles.projectLink} onPress={() => project.source_code && Linking.openURL(project.source_code)}>
                    {project.source_code}
                  </Text>
                </Text>
              ) : null}
              {project.video_link ? (
                <Text style={styles.projectField}><Text style={styles.projectFieldLabel}>Video Link: </Text>
                  <Text style={styles.projectLink} onPress={() => project.video_link && Linking.openURL(project.video_link)}>
                    {project.video_link}
                  </Text>
                </Text>
              ) : null}
              {project.pdf_url ? (
                <Text style={styles.projectField}><Text style={styles.projectFieldLabel}>PDF: </Text>
                  <Text style={styles.projectLink} onPress={() => project.pdf_url && Linking.openURL(project.pdf_url)}>
                    {project.pdf_url}
                  </Text>
                </Text>
              ) : null}
              <Text style={styles.projectMeta}>By: {userMap[project.user_id] || 'N/A'}</Text>
              <Text style={styles.projectMeta}>Status: {project.status}</Text>
              <View style={styles.projectActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleApprove(project.id)} disabled={actionLoading}><Ionicons name="checkmark-circle-outline" size={22} color="#2ecc40" /><Text style={styles.actionText}>Approve</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleReject(project.id)} disabled={actionLoading}><Ionicons name="close-circle-outline" size={22} color="#ff4136" /><Text style={styles.actionText}>Reject</Text></TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.rejectModalOverlay}>
          <View style={styles.rejectModalContent}>
            <Text style={styles.rejectModalTitle}>Reject Project</Text>
            <Text style={styles.rejectModalLabel}>Reason / Note (required):</Text>
            <TextInput
              style={styles.rejectModalInput}
              value={rejectNote}
              onChangeText={setRejectNote}
              placeholder="Enter reason for rejection..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!actionLoading}
            />
            {rejectError ? <Text style={styles.rejectModalError}>{rejectError}</Text> : null}
            <View style={styles.rejectModalActions}>
              <TouchableOpacity
                style={[styles.rejectModalBtn, { backgroundColor: '#888' }]}
                onPress={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                <Text style={styles.rejectModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectModalBtn, { backgroundColor: '#ff4136' }]}
                onPress={submitReject}
                disabled={actionLoading || !rejectNote.trim()}
              >
                {actionLoading ? <ActivityIndicator color="#fff" size={18} /> : <Text style={styles.rejectModalBtnText}>Reject</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaViewRN>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#23235b',
    textAlign: 'center',
  },
  analyticsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#35359e',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  analyticsItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#23235b',
    marginTop: 2,
  },
  analyticsLabel: {
    fontSize: 13,
    color: '#888',
  },
  

  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#35359e',
    marginBottom: 2,
  },
  projectMeta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  projectActions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-evenly',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    // no margin for even spacing
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#23235b',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userEmail: {
    fontSize: 15,
    color: '#35359e',
    fontWeight: 'bold',
  },
  userId: {
    fontSize: 12,
    color: '#888',
  },
  projectField: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  projectFieldLabel: {
    fontWeight: 'bold',
    color: '#23235b',
  },
  projectLink: {
    color: '#35359e',
    textDecorationLine: 'underline',
  },
  rejectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'stretch',
    elevation: 6,
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4136',
    marginBottom: 10,
    textAlign: 'center',
  },
  rejectModalLabel: {
    fontSize: 15,
    color: '#23235b',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  rejectModalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    minHeight: 60,
    backgroundColor: '#f9fafb',
    marginBottom: 10,
  },
  rejectModalError: {
    color: '#ff4136',
    marginBottom: 8,
    textAlign: 'center',
  },
  rejectModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  rejectModalBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 10,
    alignItems: 'center',
  },
  rejectModalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centeredEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
}); 