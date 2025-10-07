import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../../components/PostCard';
import UserProfileModal from '../../components/UserProfileModal';
import COLORS from '../../constants/colors';
import { useRefresh } from '../../lib/RefreshContext';
import { bookmarkProject, deleteProject, getCurrentUser, likeProject, supabase } from '../../lib/supabase';

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

  useEffect(() => {
    fetchProjects();
    getCurrentUser()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error getting current user:', error);
          setCurrentUserId(null);
        } else {
          setCurrentUserId(data?.user?.id || null);
        }
      })
      .catch((error) => {
        console.error('Error getting current user:', error);
        setCurrentUserId(null);
      });
  }, [refreshKey]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const { data: userData, error: userErr } = await getCurrentUser();
      if (userErr) {
        console.error('fetchProjects getCurrentUser error:', userErr);
        setError('Session expired. Please log in again.');
        setProjects([]);
        setLoading(false);
        return;
      }
  
      const user = userData?.user;
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }
  
      // Fetch all projects with counts
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          user_profiles:user_id (
            full_name,
            profile_picture_url
          ),
          project_likes(count),
          project_comments(count),
          project_bookmarks(count)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('fetchProjects query error:', error);
        setError('Unable to load projects. Please pull to refresh or try again later.');
        setProjects([]);
        return;
      }
  
      // Fetch which projects the current user liked
      const { data: likedProjects } = await supabase
        .from('project_likes')
        .select('project_id')
        .eq('user_id', user.id);
  
      // Fetch which projects the current user bookmarked
      const { data: bookmarkedProjects } = await supabase
        .from('project_bookmarks')
        .select('project_id')
        .eq('user_id', user.id);
  
      const likedIds = new Set(likedProjects?.map((l) => l.project_id) || []);
      const bookmarkedIds = new Set(bookmarkedProjects?.map((b) => b.project_id) || []);
  
      // Combine data
      const formatted = data.map((p) => ({
        ...p,
        like_count: p.project_likes?.[0]?.count || 0,
        comment_count: p.project_comments?.[0]?.count || 0,
        bookmark_count: p.project_bookmarks?.[0]?.count || 0,
        liked_by_user: likedIds.has(p.id),
        bookmarked_by_user: bookmarkedIds.has(p.id),
      }));
  
      setProjects(formatted);
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
      await fetchProjects();
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async (projectId) => {
    try {
      await likeProject(projectId);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                liked_by_user: !p.liked_by_user,
                like_count: p.liked_by_user ? p.like_count - 1 : p.like_count + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleBookmark = async (projectId) => {
    try {
      await bookmarkProject(projectId);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                bookmarked_by_user: !p.bookmarked_by_user,
                bookmark_count: p.bookmarked_by_user
                  ? p.bookmark_count - 1
                  : p.bookmark_count + 1,
              }
            : p
        )
      );
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

  const handleDelete = async (project) => {
    Alert.alert('Delete Project', 'Are you sure you want to delete this project?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProject(project.id);
            setProjects((prev) => prev.filter((p) => p.id !== project.id));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete project.');
          }
        },
      },
    ]);
  };

  const handleProfilePress = (userId) => {
    if (userId === currentUserId) {
      router.push('/(tabs)/profile');
    } else {
      setProfileUserId(userId);
      setProfileModalVisible(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image source={require('../../assets/image/logo.png')} style={styles.headerLogo} />
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
            <Image source={require('../../assets/image/logo.png')} style={styles.headerLogo} />
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

  // Handle kebab menu toggle
const handleMenu = (project) => {
  if (menuVisible && menuProject?.id === project.id) {
    setMenuVisible(false);
    setMenuProject(null);
  } else {
    setMenuVisible(true);
    setMenuProject(project);
  }
};

// Close the kebab menu
const closeMenu = () => {
  setMenuVisible(false);
  setMenuProject(null);
};

// Handle report (if PostCard supports it)
const handleReport = (project) => {
  Alert.alert('Report Project', `Report "${project.title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Report',
      style: 'destructive',
      onPress: async () => {
        try {
          await supabase.from('reports').insert({
            project_id: project.id,
            reporter_id: currentUserId,
            reason: 'Inappropriate content',
          });
          Alert.alert('Reported', 'Thank you for your report.');
        } catch (err) {
          Alert.alert('Error', 'Failed to send report.');
        }
      },
    },
  ]);
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/image/logo.png')} style={styles.headerLogo} />
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
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />
          }
        >
          {projects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>{error ? 'Unable to load projects' : 'No Projects Yet'}</Text>
              <Text style={styles.emptySubtitle}>
                {error ? 'Please pull to refresh or check your connection.' : 'Be the first to upload a project!'}
              </Text>
            </View>
          ) : (
            projects.map((project) => (
              <PostCard
  key={project.id}
  project={project}
  currentUserId={currentUserId}
  onLike={() => handleLike(project.id)}
  onBookmark={() => handleBookmark(project.id)}
  onComment={() => handleComment(project.id)}
  onShare={() => handleShare(project)}
  onDelete={() => handleDelete(project)}
  onProfile={handleProfilePress}
  onPdf={() => Linking.openURL(project.pdf_url)}
  // 👇 ADD THESE
  onMenu={handleMenu}
  menuVisible={menuVisible}
  menuProject={menuProject}
  closeMenu={closeMenu}
  handleReport={() => handleReport(project)}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mainContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },
  headerLogo: { width: 28, height: 28, marginRight: 10 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#35359e' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginTop: 10, fontSize: 16, color: '#fff', textAlign: 'center' },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 28, fontWeight: '700', color: COLORS.primary, marginBottom: 16 },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
});
