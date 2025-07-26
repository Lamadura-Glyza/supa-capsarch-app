import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { getNotifications, getProjectStatusNotifications, markNotificationAsRead } from '../../lib/supabase';

function ProjectStatusNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectStatusNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Text>Loading project status notifications...</Text>;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{
          backgroundColor: item.read ? '#f5f5f5' : '#e0e7ff',
          padding: 14,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={{ fontWeight: 'bold' }}>
            {item.projects?.title || 'Your project'}
          </Text>
          <Text>
            {item.status === 'approved'
              ? 'was approved!'
              : `was disapproved. Reason: ${item.notes || 'No reason provided.'}`}
          </Text>
          <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Mark all notifications as read when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const markAllAsRead = async () => {
        try {
          if (notifications.some(n => !n.read)) {
            await Promise.all(notifications.filter(n => !n.read).map(n => markNotificationAsRead(n.id)));
            // Optionally, refetch notifications to update UI
            // fetchNotifications(); // This line is commented out or removed
          }
        } catch (err) {
          // Ignore errors
        }
      };
      markAllAsRead();
    }, [notifications])
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={20} color="#ff6b6b" />;
      case 'comment':
        return <Ionicons name="chatbubble" size={20} color="#4A90E2" />;
      case 'bookmark':
        return <Ionicons name="bookmark" size={20} color="#FFD700" />;
      case 'rejection':
        return <Ionicons name="alert-circle" size={20} color="#ff4136" />;
      default:
        return <Ionicons name="notifications" size={20} color="#35359e" />;
    }
  };

  const getNotificationText = (notification) => {
    const senderName = notification.sender?.full_name || 'Someone';
    const projectTitle = notification.projects?.title || 'your project';
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your project "${projectTitle}"`;
      case 'comment':
        return `${senderName} commented on your project "${projectTitle}"`;
      case 'bookmark':
        return `${senderName} bookmarked your project "${projectTitle}"`;
      case 'rejection':
        return notification.message || 'Your project was rejected.';
      default:
        return notification.message || 'New notification';
    }
  };

  const handleNotificationPress = (notification) => {
    // Navigate to the specific project for like, comment, or bookmark notifications
    if (["like", "comment", "bookmark"].includes(notification.type) && notification.project_id) {
      router.push({ pathname: "/ProjectDetails", params: { projectId: notification.project_id } });
    } else {
      // For other types (e.g., rejection), do nothing or show a message
      console.log('Notification pressed:', notification);
    }
  };

  const renderNotification = ({ item }) => {
    if (item.type === 'rejection') {
      // Custom rendering for rejection notifications
      // Extract info from the message if needed, but ideally store all in notification or join
      // We'll use item.projects?.title, item.sender?.full_name, item.created_at, and item.message (for note)
      return (
        <View style={[styles.notificationCard, !item.read && styles.unreadNotification]}> 
          <View style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </View>
          <View style={styles.notificationContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#35359e' }}>{item.projects?.title || 'Project'}</Text>
            <Text style={{ color: '#333', marginBottom: 2 }}>By: {item.sender?.full_name || 'Uploader'}</Text>
            <Text style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>
              Uploaded: {item.projects?.created_at ? new Date(item.projects.created_at).toLocaleDateString() : (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A')}
            </Text>
            <Text style={{ color: '#ff4136', marginTop: 4, fontWeight: 'bold' }}>Reason: {item.message}</Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      );
    }
    // Default rendering for other types
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !item.read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          {item.sender?.profile_picture_url ? (
            <Image source={{ uri: item.sender.profile_picture_url }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
          ) : (
            getNotificationIcon(item.type)
          )}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            {getNotificationText(item)}
          </Text>
          <Text style={styles.notificationTime}>
            {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You'll see notifications here when someone interacts with your projects
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <ProjectStatusNotifications />
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
}; 