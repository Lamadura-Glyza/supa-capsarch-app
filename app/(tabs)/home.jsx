import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { useRefresh } from '../../lib/RefreshContext';
import { bookmarkProject, getCurrentUser, getProjects, likeProject } from '../../lib/supabase';

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

  useEffect(() => {
    fetchProjects();
    getCurrentUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
  }, [refreshKey]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
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
      // Always refetch projects for accurate bookmark count
      fetchProjects();
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
  const handleDelete = () => {
    // TODO: Implement delete logic
    closeMenu();
  };
  const handleReport = () => {
    // TODO: Implement report logic
    closeMenu();
  };

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
            <View key={project.id} style={styles.card}>
              {/* Kebab Menu */}
              <TouchableOpacity style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }} onPress={() => openMenu(project)}>
                <Ionicons name="ellipsis-vertical" size={22} color="#888" />
              </TouchableOpacity>
              {/* User Info */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={styles.avatar}>
                  {project.user_profiles?.profile_picture_url ? (
                    <Image 
                      source={{ uri: project.user_profiles.profile_picture_url }} 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={20} color="#35359e" />
                  )}
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.userName}>
                    {project.user_profiles?.full_name || (project.user_id ? `User ${project.user_id.substring(0, 8)}...` : 'Anonymous User')}
                  </Text>
                  <Text style={styles.date}>{formatDate(project.created_at)}</Text>
                </View>
              </View>
              
              {/* Title & Description */}
              <Text style={styles.cardTitle}>{project.title}</Text>
              <Text style={styles.cardDesc}>
                {project.title_description || project.abstract.substring(0, 100) + '...'}
              </Text>
              
              {/* PDF Preview */}
              <View style={styles.docPreview}>
                <Ionicons name="document" size={48} color="#35359e" />
                <Text style={styles.pdfText}>PDF Document</Text>
                <TouchableOpacity 
                  style={styles.viewPdfButton}
                  onPress={() => {}}
                >
                  <Text style={styles.viewPdfButtonText}>View PDF</Text>
                </TouchableOpacity>
              </View>
              
              {/* Abstract */}
              <Text style={styles.abstractLabel}>Abstract</Text>
              <Text style={styles.abstractText}>{project.abstract}</Text>
              
              {/* Links */}
              <View style={styles.linksContainer}>
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => console.log('Source code:', project.source_code)}
                >
                  <Ionicons name="logo-github" size={16} color="#35359e" />
                  <Text style={styles.linkText}>Source Code</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => console.log('Video:', project.video_link)}
                >
                  <Ionicons name="logo-youtube" size={16} color="#ff0000" />
                  <Text style={styles.linkText}>Video</Text>
                </TouchableOpacity>
              </View>
              
              {/* Action Bar */}
              <View style={styles.actionBar}>
                {/* Like */}
                <View style={styles.actionBtnCol}>
                  <View style={styles.iconRow}>
                    <TouchableOpacity onPress={() => handleLike(project.id)}>
                      <Ionicons 
                        name={project.liked_by_user ? 'heart' : 'heart-outline'} 
                        size={22} 
                        color={project.liked_by_user ? '#ff6b6b' : '#35359e'} 
                      />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{project.like_count || 0}</Text>
                  </View>
                  <Text style={styles.actionLabel}>Like</Text>
                </View>
                {/* Comment */}
                <View style={styles.actionBtnCol}>
                  <View style={styles.iconRow}>
                    <TouchableOpacity onPress={() => handleComment(project.id)}>
                      <Ionicons name="chatbubble-outline" size={22} color="#35359e" />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{project.comment_count || 0}</Text>
                  </View>
                  <Text style={styles.actionLabel}>Comment</Text>
                </View>
                {/* Bookmark */}
                <View style={styles.actionBtnCol}>
                  <View style={styles.iconRow}>
                    <TouchableOpacity onPress={() => handleBookmark(project.id)}>
                      <Ionicons 
                        name={project.bookmarked_by_user ? 'bookmark' : 'bookmark-outline'} 
                        size={22} 
                        color={project.bookmarked_by_user ? '#35359e' : '#35359e'} 
                      />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{project.bookmark_count || 0}</Text>
                  </View>
                  <Text style={styles.actionLabel}>Bookmark</Text>
                </View>
              </View>
            </View>
          ))
        )}
        </ScrollView>
        {/* Kebab Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu} />
          <View style={styles.menuContainer}>
            {menuProject && currentUserId === menuProject.user_id ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleEdit}><Text style={styles.menuItemText}>Edit</Text></TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}><Text style={styles.menuItemText}>Delete</Text></TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={handleReport}><Text style={styles.menuItemText}>Report</Text></TouchableOpacity>
            )}
          </View>
        </Modal>
      </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0', // Placeholder for avatar
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#19194d',
    marginTop: 8,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#222',
    marginBottom: 8,
  },
  docPreview: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#fafbff',
  },
  pdfText: {
    fontSize: 14,
    color: '#35359e',
    fontWeight: 'bold',
    marginTop: 8,
  },
  viewPdfButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  viewPdfButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  abstractLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 2,
    color: '#19194d',
  },
  abstractText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 8,
  },
  linksContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  linkText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#35359e',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    margin: 5,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  actionIcon: {
    width: 22,
    height: 22,
    tintColor: '#35359e',
  },
  actionText: {
    fontSize: 13,
    color: '#35359e',
    fontWeight: '600',
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