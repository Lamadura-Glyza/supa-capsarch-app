import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { getAllUsers, getAnalytics, getProjectStatusCounts } from '../../lib/supabaseAdmin';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, usersList, statusCountsData] = await Promise.all([
        getAnalytics(),
        getAllUsers(),
        getProjectStatusCounts(),
      ]);
      setAnalytics(analyticsData);
      setUsers(usersList);
      setStatusCounts(statusCountsData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    await fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}><ActivityIndicator size="large" color="#35359e" /><Text>Loading analytics...</Text></View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}></Text>
        <View style={styles.analyticsBox}>
          <Text style={styles.analyticsTitle}>App Statistics</Text>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}><Ionicons name="cloud-upload-outline" size={24} color="#35359e" /><Text style={styles.analyticsValue}>{analytics?.uploads ?? '-'}</Text><Text style={styles.analyticsLabel}>Uploads</Text></View>
            <View style={styles.analyticsItem}><Ionicons name="people-outline" size={24} color="#35359e" /><Text style={styles.analyticsValue}>{analytics?.users ?? '-'}</Text><Text style={styles.analyticsLabel}>Users</Text></View>
            <View style={styles.analyticsItem}><Ionicons name="bookmark-outline" size={24} color="#35359e" /><Text style={styles.analyticsValue}>{analytics?.bookmarks ?? '-'}</Text><Text style={styles.analyticsLabel}>Bookmarks</Text></View>
          </View>
          {/* Project Status Counts */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}><Ionicons name="time-outline" size={20} color="#ffb300" /><Text style={styles.statusValue}>{statusCounts.pending}</Text><Text style={styles.statusLabel}>Pending</Text></View>
            <View style={styles.statusItem}><Ionicons name="checkmark-done-outline" size={20} color="#2ecc40" /><Text style={styles.statusValue}>{statusCounts.approved}</Text><Text style={styles.statusLabel}>Approved</Text></View>
            <View style={styles.statusItem}><Ionicons name="close-circle-outline" size={20} color="#ff4136" /><Text style={styles.statusValue}>{statusCounts.rejected}</Text><Text style={styles.statusLabel}>Rejected</Text></View>
          </View>
        </View>
        {/* Users List */}
        <Text style={styles.sectionTitle}>All Users</Text>
        {users.length === 0 ? (
          <Text style={styles.emptyText}>No users found.</Text>
        ) : (
          <ScrollView style={styles.usersScroll} contentContainerStyle={styles.usersScrollContent}>
            {users.map(user => (
              <View key={user.id} style={styles.userCard}>
                <Text style={styles.userName}>{user.full_name || 'N/A'}</Text>
                <Text style={styles.userEmail}>{user.email || 'N/A'}</Text>
                <Text style={styles.userGender}>Gender: {user.gender || 'N/A'}</Text>
                <Text style={styles.userDeptYearBlock}>
                  Year Level: {user.year_level || 'N/A'}, Block: {user.block || 'N/A'}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  headerSafeArea: {
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      android: { paddingTop: StatusBar.currentHeight || 0 },
      ios: {},
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#23235b',
  },
  refreshBtn: {
    padding: 8,
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  statusItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#23235b',
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 13,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#35359e',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#23235b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 15,
    color: '#35359e',
    marginBottom: 2,
  },
  userGender: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  userDeptYearBlock: {
    fontSize: 14,
    color: '#888',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  usersScroll: {
    maxHeight: 350,
    marginBottom: 20,
  },
  usersScrollContent: {
    paddingBottom: 10,
  },
}); 