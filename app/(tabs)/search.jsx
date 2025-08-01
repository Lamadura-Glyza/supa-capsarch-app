import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, Linking, RefreshControl, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../../components/PostCard';
import UserProfileModal from '../../components/UserProfileModal';
import { useRefresh } from '../../lib/RefreshContext';
import { bookmarkProject, deleteProject, getCurrentUser, getProjects, likeProject, searchProjectsByTitle, searchUsersByName } from '../../lib/supabase';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [projectResults, setProjectResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuProject, setMenuProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Mobile Application');
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const { refreshKey } = useRefresh();

  useEffect(() => {
    getCurrentUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
  }, [refreshKey]);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(true);
      getCurrentUser().then(({ data }) => {
        if (!data?.user) {
          setProjectResults([]);
          setSearched(true);
          setLoading(false);
          return;
        }
        getProjects().then(projects => {
          setProjectResults(projects);
          setSearched(true);
          setLoading(false);
        });
      });
    }
  }, [selectedCategory]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    Keyboard.dismiss();
    try {
      const [users, projects] = await Promise.all([
        searchUsersByName(query.trim()),
        searchProjectsByTitle(query.trim()),
      ]);
      setUserResults(users);
      setProjectResults(projects);
    } catch (err) {
      setUserResults([]);
      setProjectResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (projectId) => {
    await likeProject(projectId);
    setProjectResults(prev => prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            liked_by_user: !p.liked_by_user,
            like_count: p.liked_by_user ? p.like_count - 1 : p.like_count + 1,
          }
        : p
    ));
  };
  const handleBookmark = async (projectId) => {
    await bookmarkProject(projectId);
    setProjectResults(prev => prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            bookmarked_by_user: !p.bookmarked_by_user,
            bookmark_count: p.bookmarked_by_user ? p.bookmark_count - 1 : p.bookmark_count + 1,
          }
        : p
    ));
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
    } catch (error) {}
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
    closeMenu();
    // TODO: Implement edit navigation
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
              setProjectResults(prev => prev.filter(p => p.id !== menuProject.id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete project.');
            }
          },
        },
      ]
    );
  };
  const handleReport = () => {
    closeMenu();
    // TODO: Implement report logic
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (query.trim()) {
      handleSearch();
    }
  };

  const handleProfilePress = (userId) => {
    if (userId === currentUserId) {
      router.push('/(tabs)/profile');
    } else {
      setProfileUserId(userId);
      setProfileModalVisible(true);
    }
  };

  const handleUserPress = (userId) => {
    if (userId === currentUserId) {
      router.push('/(tabs)/profile');
    } else {
      setProfileUserId(userId);
      setProfileModalVisible(true);
    }
  };

  // Only show approved projects (or user's own projects)
  const filteredProjects = projectResults.filter(p =>
    ((p.category || '').trim().toLowerCase() === selectedCategory.trim().toLowerCase()) &&
    (p.status === 'approved' || p.user_id === currentUserId)
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!query.trim()) {
        const { data: { user } } = await getCurrentUser();
        if (!user) {
          setProjectResults([]);
          setUserResults([]);
          setRefreshing(false);
          setSearched(true);
          return;
        }
        const projects = await getProjects();
        setProjectResults(projects);
        setUserResults([]);
      } else {
        const [users, projects] = await Promise.all([
          searchUsersByName(query.trim()),
          searchProjectsByTitle(query.trim()),
        ]);
        setUserResults(users);
        setProjectResults(projects);
      }
    } catch (err) {
      setUserResults([]);
      setProjectResults([]);
    } finally {
      setRefreshing(false);
      setSearched(true);
    }
  };

  const renderUser = (user) => (
    <TouchableOpacity
      key={user.user_id}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 1 }}
      onPress={() => handleUserPress(user.user_id)}
    >
      <Image
        source={{ uri: user.profile_picture_url || 'https://ui-avatars.com/api/?name=User&background=4A90E2&color=fff&size=120' }}
        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
      />
      <View>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#35359e' }}>{user.full_name}</Text>
        <Text style={{ color: '#666', marginTop: 2 }}>{`BSIT – ${user.year_level || ''}${user.block ? ' ' + user.block : ''}`}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProject = (project) => (
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
      onPdf={() => project.pdf_url && Linking.openURL(project.pdf_url)}
      menuVisible={menuVisible}
      menuProject={menuProject}
      closeMenu={closeMenu}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      handleReport={handleReport}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <View style={{ position: 'relative' }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or project title..."
            style={{ backgroundColor: '#fff', borderRadius: 22, padding: 12, fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0', paddingRight: 40 }}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={{ position: 'absolute', right: 10, top: 0, bottom: 0, height: '100%', justifyContent: 'center', alignItems: 'center', width: 36 }}
          >
            <Ionicons name="search" size={22} color="#35359e" />
          </TouchableOpacity>
        </View>
        {/* Category Filter Buttons */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['Mobile Application', 'Web Application'].map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => handleCategorySelect(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? '#35359e' : '#e0e7ff',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 6,
                marginRight: 10,
              }}
            >
              <Text style={{ color: selectedCategory === cat ? '#fff' : '#35359e', fontWeight: 'bold' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {loading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#35359e" />
          <Text style={{ marginTop: 10, color: '#35359e' }}>Searching...</Text>
        </View>
      )}
      {!loading && searched && (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#35359e"
              colors={["#35359e"]}
            />
          }
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#35359e', marginBottom: 8 }}>Users</Text>
          {userResults.length === 0 && <Text style={{ color: '#888', marginBottom: 16 }}>No users found</Text>}
          {userResults.map(renderUser)}
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#35359e', marginTop: 20, marginBottom: 8 }}>Projects</Text>
          {filteredProjects.length === 0 && <Text style={{ color: '#888' }}>No projects found</Text>}
          {filteredProjects.map(renderProject)}
          {userResults.length === 0 && filteredProjects.length === 0 && (
            <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No results found</Text>
          )}
        </ScrollView>
      )}
      <UserProfileModal
        userId={profileUserId}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        currentUserId={currentUserId}
      />
    </SafeAreaView>
  );
} 