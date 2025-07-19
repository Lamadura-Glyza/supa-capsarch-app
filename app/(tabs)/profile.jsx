import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import COLORS from '../../constants/colors';
import { getUserProfile, signOut } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'projects', title: 'Project' },
    { key: 'bookmarks', title: 'Bookmark' },
  ]);

  // Placeholder data for stats and projects
  const [stats] = useState({
    projects: 3,
    downloads: 520
  });

  const [userProjects] = useState([
    {
      id: 1,
      title: 'Capstone Archive',
      description: 'A Digital Platform for Storing and Sharing Capstone Projects of Consolatrix College of Toledo City.',
      date: 'February 14, 2005',
      pdfPreview: 'https://via.placeholder.com/60x80/4A90E2/FFFFFF?text=PDF'
    }
  ]);

  const [bookmarkedProjects] = useState([
    {
      id: 1,
      title: 'Sample Bookmarked Project',
      description: 'This is a sample bookmarked project description.',
      date: 'January 15, 2005',
      pdfPreview: 'https://via.placeholder.com/60x80/4A90E2/FFFFFF?text=PDF'
    }
  ]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile();
      
      if (!profileData) {
        console.log('No profile found');
        setError('Profile not found. Please contact support or try logging out and back in.');
      } else {
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              const { error } = await signOut();
              if (error) {
                Alert.alert('Logout Error', error.message);
              } else {
                console.log('Logout successful, navigating to login...');
                router.replace('/(auth)/login');
              }
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Logout Error', 'An unexpected error occurred.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setSettingsModalVisible(false);
    // Navigate to edit profile screen (you can implement this later)
    Alert.alert('Edit Profile', 'Edit Profile functionality will be implemented soon.');
  };

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={COLORS.primary}
      inactiveColor="#999"
    />
  );

  const ProjectTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {userProjects.map((project) => (
        <View key={project.id} style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <View style={styles.projectUserInfo}>
              <Image
                source={{ uri: 'https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=JD' }}
                style={styles.projectUserAvatar}
              />
              <View style={styles.projectUserDetails}>
                <Text style={styles.projectUserName}>
                  {profile?.full_name || 'Juan Dela Cruz'}
                </Text>
                <Text style={styles.projectUserSection}>
                  {profile?.block || 'BSIT-4 A'}
                </Text>
              </View>
            </View>
            <Text style={styles.projectDate}>{project.date}</Text>
          </View>
          
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectDescription}>{project.description}</Text>
          
          <View style={styles.projectPreview}>
            <Image
              source={{ uri: project.pdfPreview }}
              style={styles.pdfPreview}
              resizeMode="cover"
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const BookmarkTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {bookmarkedProjects.map((project) => (
        <View key={project.id} style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <View style={styles.projectUserInfo}>
              <Image
                source={{ uri: 'https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=JD' }}
                style={styles.projectUserAvatar}
              />
              <View style={styles.projectUserDetails}>
                <Text style={styles.projectUserName}>
                  {profile?.full_name || 'Juan Dela Cruz'}
                </Text>
                <Text style={styles.projectUserSection}>
                  {profile?.block || 'BSIT-4 A'}
                </Text>
              </View>
            </View>
            <Text style={styles.projectDate}>{project.date}</Text>
          </View>
          
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectDescription}>{project.description}</Text>
          
          <View style={styles.projectPreview}>
            <Image
              source={{ uri: project.pdfPreview }}
              style={styles.pdfPreview}
              resizeMode="cover"
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderScene = SceneMap({
    projects: ProjectTab,
    bookmarks: BookmarkTab,
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Ionicons 
              name="log-out-outline" 
              size={20} 
              color={isLoggingOut ? "#ccc" : "#ff6b6b"} 
            />
            <Text style={[styles.logoutText, isLoggingOut && styles.logoutTextDisabled]}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>CapstoneArchive v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://via.placeholder.com/120x120/4A90E2/FFFFFF?text=JD' }}
            style={styles.profilePicture}
          />
          <Text style={styles.userName}>
            {profile?.full_name || 'Juan Dela Cruz'}
          </Text>
          <Text style={styles.userSection}>
            {profile?.block || 'BSIT-4A'}
          </Text>
          <Text style={styles.userBio}>
            Passionate about creating innovative solutions through technology
          </Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.projects}</Text>
              <Text style={styles.statLabel}>Project</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.downloads}</Text>
              <Text style={styles.statLabel}>Downloads</Text>
            </View>
          </View>
        </View>

        {/* Tab View */}
        <View style={styles.tabContainer}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width }}
            renderTabBar={renderTabBar}
          />
        </View>
      </ScrollView>

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
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <Text style={styles.modalOptionText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.logoutModalOption]} 
              onPress={() => {
                setSettingsModalVisible(false);
                handleLogout();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
              <Text style={[styles.modalOptionText, styles.logoutModalText]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
  },
  content: {
    flex: 1,
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
  subText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userSection: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  projectUserDetails: {
    flex: 1,
  },
  projectUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  projectUserSection: {
    fontSize: 14,
    color: '#666',
  },
  projectDate: {
    fontSize: 12,
    color: '#999',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  projectPreview: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabIndicator: {
    backgroundColor: COLORS.primary,
    height: 3,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
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
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
}; 