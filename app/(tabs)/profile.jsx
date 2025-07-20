import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import COLORS from '../../constants/colors';
import { getUserProfile, signOut } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=4A90E2&color=fff&size=120';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editBlock, setEditBlock] = useState('');
  const [editAvatar, setEditAvatar] = useState(DEFAULT_AVATAR);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'projects', title: 'Project' },
    { key: 'bookmarks', title: 'Bookmark' },
  ]);

  // Placeholder data for stats and projects
  const [stats, setStats] = useState({
    projects: 3, // TODO: fetch from Supabase
    bookmarks: 2 // TODO: fetch from Supabase
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

  // Refresh profile data when screen comes into focus (e.g., returning from EditProfile)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile();
      console.log('Fetched profile data:', profileData); // Debug log
      if (!profileData) {
        setError('Profile not found. Please contact support or try logging out and back in.');
      } else {
        console.log('Profile picture URL:', profileData.profile_picture_url); // Debug log
        setProfile(profileData);
        setEditBio(profileData.bio || '');
        setEditYear(profileData.year_level || '');
        setEditBlock(profileData.block || '');
        setEditAvatar(profileData.profile_picture_url || DEFAULT_AVATAR);
      }
    } catch (err) {
      console.error('Error fetching profile:', err); // Debug log
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
        { text: 'Cancel', style: 'cancel' },
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
                router.replace('/(auth)/login');
              }
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
    router.push('/EditProfile');
  };

  const handleSaveProfile = () => {
    // TODO: Save to Supabase
    setProfile(prev => ({
      ...prev,
      bio: editBio,
      year_level: editYear,
      block: editBlock,
      // avatar: editAvatar, // For future avatar upload
    }));
    setEditMode(false);
    Alert.alert('Profile updated!', 'Your profile changes have been saved.');
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditBio(profile?.bio || '');
    setEditYear(profile?.year_level || '');
    setEditBlock(profile?.block || '');
    setEditAvatar(DEFAULT_AVATAR);
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <View style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="transparent" />
          </View>
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <View style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="transparent" />
          </View>
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
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
          {/* Profile Picture with Edit Button */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            {console.log('Displaying profile picture URL:', profile?.profile_picture_url || DEFAULT_AVATAR)}
            <Image
              source={{ uri: profile?.profile_picture_url || DEFAULT_AVATAR }}
              style={styles.profilePicture}
            />
            {editMode && (
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => Alert.alert('Edit Avatar', 'Profile picture upload coming soon!')}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          {/* Name */}
          <Text style={styles.userName}>{profile?.full_name || 'Juan Dela Cruz'}</Text>
          {/* Department, Year Level, Block */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.userDept}>BSIT</Text>
            <Text style={styles.userDeptSep}> – </Text>
            {editMode ? (
              <TextInput
                style={styles.userYearBlockInput}
                value={editYear}
                onChangeText={setEditYear}
                placeholder="Year"
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              />
            ) : (
              <Text style={styles.userYearBlock}>{profile?.year_level || '4'}</Text>
            )}
            <Text style={styles.userDeptSep}> </Text>
            {editMode ? (
              <TextInput
                style={styles.userYearBlockInput}
                value={editBlock}
                onChangeText={setEditBlock}
                placeholder="Block"
              />
            ) : (
              <Text style={styles.userYearBlock}>{profile?.block || 'A'}</Text>
            )}
          </View>
          
          {/* Gender Section */}
          <View style={{ width: '100%', marginBottom: 8, alignItems: 'center' }}>
            <Text style={styles.genderText}>{profile?.gender || 'Not specified'}</Text>
          </View>
          
          {/* Bio Section */}
          <View style={{ width: '100%', marginBottom: 16 }}>
            {editMode ? (
              <TextInput
                style={styles.bioInput}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Write something about yourself..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.bioText}>{profile?.bio || 'No Bio'}</Text>
            )}
          </View>
          {/* Project and Bookmark Counters */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.projects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.bookmarks}</Text>
              <Text style={styles.statLabel}>Bookmarks</Text>
            </View>
          </View>
          {/* Edit Mode Buttons */}
          {editMode && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
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
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDept: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userDeptSep: {
    fontSize: 16,
    color: '#666',
  },
  userYearBlock: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userYearBlockInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    width: 50,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bioInput: {
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  genderText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
}; 