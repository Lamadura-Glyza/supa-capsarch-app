import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../../components/PostCard';
import UserProfileModal from '../../components/UserProfileModal';
import COLORS from '../../constants/colors';
import { useRefresh } from '../../lib/RefreshContext';
import { bookmarkProject, deleteProject, getCurrentUser, getProjects, likeProject } from '../../lib/supabase';

export default function HomeScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { refreshKey } = useRefresh();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuProject, setMenuProject] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileProjects, setProfileProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
    getCurrentUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id || null);
    }).catch((error) => {
      console.error('Error getting current user:', error);
      setCurrentUserId(null);
    });
  }, [refreshKey]);

  // Poll for projects every 5 seconds
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const { data: { user } } = await getCurrentUser();
        if (!user) return;
        const projectsData = await getProjects();
        if (mounted) setProjects(projectsData);
      } catch (err) {
        console.error('Error in polling projects:', err);
      }
    };
    const interval = setInterval(poll, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await getCurrentUser();
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) {
        setProjects([]);
        setRefreshing(false);
        return;
      }
      const projectsData = await getProjects();
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    onRefresh();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLike = async (projectId) => {
    try {
      await likeProject(projectId);
      // Optimistically update UI
      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              liked_by_user: !p.liked_by_user,
              like_count: p.liked_by_user ? p.like_count - 1 : p.like_count + 1,
            }
          : p
      ));
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleBookmark = async (projectId) => {
    try {
      await bookmarkProject(projectId);
      // Optimistically update UI
      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              bookmarked_by_user: !p.bookmarked_by_user,
              bookmark_count: p.bookmarked_by_user ? p.bookmark_count - 1 : p.bookmark_count + 1,
            }
          : p
      ));
    } catch (error) {
      console.error('Error bookmarking project:', error);
    }
  };

  const handleComment = (projectId) => {
    router.push({ pathname: '/CommentScreen', params: { projectId } });
  };

  const handleShare = async (project) => {
    try {
      await Share.share({
        message: `${project.title}\n\n${project.title_description || ''}\n\nCheck out this project on CapstoneArchive!`,
        title: project.title,
      });
    } catch (error) {
      console.error('Error sharing project:', error);
    }
  };

  const openMenu = (project) => {
    setMenuProject(project);
    setMenuVisible(true);
  };
  const closeMenu = () => {
    setMenuVisible(false);
    setMenuProject(null);
  };
  const handleEdit = () => {
    // TODO: Implement edit navigation
    closeMenu();
  };
  const handleDelete = async () => {
    if (!menuProject) return;
    closeMenu();
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(menuProject.id);
              setProjects(prev => prev.filter(p => p.id !== menuProject.id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete project.');
            }
          },
        },
      ]
    );
  };
  const handleReport = () => {
    // TODO: Implement report logic
    closeMenu();
  };

  const handleProfilePress = (userId) => {
    if (userId === currentUserId) {
      router.push('/(tabs)/profile');
    } else {
      setProfileUserId(userId);
      setProfileModalVisible(true);
    }
  };

  const modalWidth = Math.min(Dimensions.get('window').width * 0.95, 600);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={require('../../assets/image/logo.png')} 
              style={styles.headerLogo} 
            />
            <Text style={styles.headerTitle}>CapstoneArchive</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={require('../../assets/image/logo.png')} 
              style={styles.headerLogo} 
            />
            <Text style={styles.headerTitle}>CapstoneArchive</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/image/logo.png')} 
            style={styles.headerLogo} 
          />
          <Text style={styles.headerTitle}>CapstoneArchive</Text>
        </View>
      </View>
      
      <View style={styles.mainContainer}>
        <ScrollView 
          style={{ backgroundColor: '#f5f5f5', flex: 1 }}
          contentContainerStyle={{ 
            padding: 10, 
            paddingTop: 10,
            backgroundColor: '#f5f5f5',
            flexGrow: 1,
            borderWidth: 0,
          }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor="transparent"
              colors={['transparent']}
            />
          }
        >
        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to upload a project!
            </Text>
          </View>
        ) : (
          projects.map(project => (
            <PostCard
              key={project.id}
              project={project}
              currentUserId={currentUserId}
              onLike={() => handleLike(project.id)}
              onBookmark={() => handleBookmark(project.id)}
              onComment={() => handleComment(project.id)}
              onShare={() => handleShare(project)}
              onMenu={() => openMenu(project)}
              onProfile={handleProfilePress}
              onPdf={() => Linking.openURL(project.pdf_url)}
              menuVisible={menuVisible}
              menuProject={menuProject}
              closeMenu={closeMenu}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleReport={handleReport}
            />
          ))
        )}
        </ScrollView>
      </View>
      <UserProfileModal
        userId={profileUserId}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        currentUserId={currentUserId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: '100%',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 0,
    borderBottomWidth: 0,
    height: '100%',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
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
    color: '#fff',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
    borderWidth: 0,
    borderBottomWidth: 0,
    minHeight: '100%',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  actionBtnCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#35359e',
    fontWeight: 'bold',
  },
  actionLabel: {
    fontSize: 13,
    color: '#35359e',
    fontWeight: '600',
    marginTop: 2,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: 100,
    right: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#35359e',
    fontWeight: '600',
  },
}); 