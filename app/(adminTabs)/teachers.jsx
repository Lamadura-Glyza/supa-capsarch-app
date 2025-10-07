import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import {
    approveTeacher,
    demoteTeacherAdmin,
    getAllTeachers,
    getPendingTeachers,
    promoteTeacherToAdmin,
    rejectTeacher
} from '../../lib/supabaseAdmin';

export default function TeachersScreen() {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, all] = await Promise.all([
        getPendingTeachers(),
        getAllTeachers()
      ]);
      setPendingTeachers(pending);
      setAllTeachers(all);
    } catch (err) {
      setError(err.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleApproveTeacher = async (userId, teacherName) => {
    setActionLoading(true);
    try {
      await approveTeacher(userId);
      setPendingTeachers(prev => prev.filter(t => t.user_id !== userId));
      Alert.alert('Success', `${teacherName} has been approved and can now log in.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to approve teacher');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTeacher = async (userId, teacherName) => {
    Alert.alert(
      'Reject Teacher',
      `Are you sure you want to reject ${teacherName}? They will not be able to log in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await rejectTeacher(userId);
              setPendingTeachers(prev => prev.filter(t => t.user_id !== userId));
              Alert.alert('Success', `${teacherName} has been rejected.`);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to reject teacher');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePromoteTeacher = async (userId, teacherName) => {
    Alert.alert(
      'Promote to Admin',
      `Are you sure you want to promote ${teacherName} to Teacher Admin? They will have admin privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: async () => {
            setActionLoading(true);
            try {
              await promoteTeacherToAdmin(userId);
              await fetchTeachers(); // Refresh to update the list
              Alert.alert('Success', `${teacherName} has been promoted to Teacher Admin.`);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to promote teacher');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDemoteTeacher = async (userId, teacherName) => {
    Alert.alert(
      'Demote from Admin',
      `Are you sure you want to demote ${teacherName} from Teacher Admin? They will lose admin privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Demote',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await demoteTeacherAdmin(userId);
              await fetchTeachers(); // Refresh to update the list
              Alert.alert('Success', `${teacherName} has been demoted from Teacher Admin.`);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to demote teacher');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaViewRN style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#35359e" />
          <Text>Loading teachers...</Text>
        </View>
      </SafeAreaViewRN>
    );
  }

  if (error) {
    return (
      <SafeAreaViewRN style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}>
          <Text style={{ color: 'red' }}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTeachers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaViewRN>
    );
  }

  const currentTeachers = activeTab === 'pending' ? pendingTeachers : allTeachers;

  return (
    <SafeAreaViewRN style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="people" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Teacher Management</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending ({pendingTeachers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Teachers ({allTeachers.length})
          </Text>
        </TouchableOpacity>
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
        {currentTeachers.length === 0 ? (
          <View style={styles.centeredEmpty}>
            <Text style={styles.emptyText}>
              {activeTab === 'pending' 
                ? 'No teachers pending approval.' 
                : 'No teachers found.'
              }
            </Text>
          </View>
        ) : (
          currentTeachers.map(teacher => (
            <View key={teacher.user_id} style={styles.teacherCard}>
              <View style={styles.teacherHeader}>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{teacher.full_name || 'Unknown'}</Text>
                  <Text style={styles.teacherEmail}>{teacher.email}</Text>
                  <Text style={styles.teacherMeta}>
                    Role: {teacher.role === 'teacher_admin' ? 'Teacher Admin' : 'Teacher'}
                  </Text>
                  <Text style={styles.teacherMeta}>
                    Status: {teacher.status === 'pending' ? 'Pending Approval' : 
                            teacher.status === 'active' ? 'Active' : 
                            teacher.status === 'rejected' ? 'Rejected' : teacher.status}
                  </Text>
                  <Text style={styles.teacherMeta}>
                    Joined: {formatDate(teacher.created_at)}
                  </Text>
                  {teacher.bio && (
                    <Text style={styles.teacherBio}>{teacher.bio}</Text>
                  )}
                </View>
              </View>

              <View style={styles.teacherActions}>
                {activeTab === 'pending' && teacher.status === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApproveTeacher(teacher.user_id, teacher.full_name)}
                      disabled={actionLoading}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectTeacher(teacher.user_id, teacher.full_name)}
                      disabled={actionLoading}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {activeTab === 'all' && teacher.status === 'active' && (
                  <>
                    {teacher.role === 'teacher' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.promoteButton]}
                        onPress={() => handlePromoteTeacher(teacher.user_id, teacher.full_name)}
                        disabled={actionLoading}
                      >
                        <Ionicons name="arrow-up-circle" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Promote to Admin</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.demoteButton]}
                        onPress={() => handleDemoteTeacher(teacher.user_id, teacher.full_name)}
                        disabled={actionLoading}
                      >
                        <Ionicons name="arrow-down-circle" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Demote from Admin</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  teacherHeader: {
    marginBottom: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  teacherMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  teacherBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  teacherActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  approveButton: {
    backgroundColor: '#2ecc40',
  },
  rejectButton: {
    backgroundColor: '#ff4136',
  },
  promoteButton: {
    backgroundColor: '#0074d9',
  },
  demoteButton: {
    backgroundColor: '#ff851b',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 16,
  },
  centeredEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
