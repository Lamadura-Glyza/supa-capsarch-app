import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, getUserProfile, signOut } from '../../lib/supabase';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Admin&background=4A90E2&color=fff&size=120';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileIfAuthenticated = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await getCurrentUser();
        if (error || !data?.user) {
          console.error('No valid session found:', error);
          setError('No valid session found');
          setProfile(null);
          return;
        }
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError('Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileIfAuthenticated();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { data, error } = await getCurrentUser();
      if (error || !data?.user) {
        console.error('No valid session found during refresh:', error);
        setError('No valid session found');
        setProfile(null);
        return;
      }
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error refreshing admin profile:', err);
      setError('Failed to refresh profile');
      setProfile(null);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setSettingsModalVisible(false);
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleEditProfile = () => {
    setSettingsModalVisible(false);
    router.push('/EditProfile');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            setError(null);
            setLoading(true);
            // Trigger useEffect by updating a dependency
            setProfile(null);
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#35359e"
          />
        }
      >
        <View style={styles.centerCardWrapper}>
          <View style={styles.card}>
            {/* Settings Icon inside the card */}
            <TouchableOpacity
              style={styles.settingsIcon}
              onPress={() => setSettingsModalVisible(true)}
            >
              <Ionicons name="settings-outline" size={26} color="#35359e" />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profile?.profile_picture_url || DEFAULT_AVATAR }}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.name}>{profile?.full_name || 'Admin User'}</Text>
            <Text style={styles.email}>{profile?.email || 'admin@email.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Admin</Text>
            </View>
          </View>
        </View>
        {/* Settings Modal */}
        <Modal
          visible={settingsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSettingsModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSettingsModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.modalOption} onPress={handleEditProfile}>
                <Ionicons name="person-outline" size={20} color="#35359e" />
                <Text style={styles.modalOptionText}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalOption, styles.logoutModalOption]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
                <Text style={[styles.modalOptionText, styles.logoutModalText]}>Sign Out</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerCardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 40,
    position: 'relative',
  },
  settingsIcon: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    padding: 6,

  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#35359e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
    marginTop: 8,
  },
  roleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '80%',
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutModalOption: {
    borderBottomWidth: 0,
  },
  logoutModalText: {
    color: '#ff6b6b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#35359e',
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