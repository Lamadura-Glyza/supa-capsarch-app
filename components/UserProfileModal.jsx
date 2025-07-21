import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';
import { bookmarkProject, getUserProfile, getUserProjects, likeProject } from '../lib/supabase';
import PostCard from './PostCard';

const { width } = Dimensions.get('window');
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=4A90E2&color=fff&size=120';

export default function UserProfileModal({ userId, visible, onClose, currentUserId }) {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && userId) {
      setLoading(true);
      Promise.all([
        getUserProfile(userId),
        getUserProjects(userId)
      ]).then(([profileData, userProjects]) => {
        setProfile(profileData);
        setProjects(userProjects.filter(p => p.status === 'approved'));
      }).finally(() => setLoading(false));
    } else if (!visible) {
      setProfile(null);
      setProjects([]);
      setLoading(true);
    }
  }, [userId, visible]);

  const handleLike = async (projectId) => {
    await likeProject(projectId);
    // Refresh projects
    const userProjects = await getUserProjects(userId);
    setProjects(userProjects.filter(p => p.status === 'approved'));
  };
  const handleBookmark = async (projectId) => {
    await bookmarkProject(projectId);
    // Refresh projects
    const userProjects = await getUserProjects(userId);
    setProjects(userProjects.filter(p => p.status === 'approved'));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, width: width * 0.92, height: 750, maxHeight: '98%', overflow: 'hidden' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: COLORS.primary }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>User Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.primary }}>Loading...</Text>
              </View>
            ) : !profile ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
                <Text style={{ color: '#ff6b6b', fontSize: 16, marginTop: 10 }}>Failed to load user profile.</Text>
              </View>
            ) : (
              <>
                {/* Profile Card (frozen) */}
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 0,
                  padding: 20,
                  alignItems: 'center',
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Image
                    source={{ uri: profile?.profile_picture_url || DEFAULT_AVATAR }}
                    style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 8 }}
                  />
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 2 }}>{profile?.full_name || 'User'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>BSIT</Text>
                    <Text style={{ fontSize: 16, color: '#666' }}> – </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{profile?.year_level || 'N/A'}</Text>
                    <Text style={{ fontSize: 16, color: '#666' }}> </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{profile?.block || 'N/A'}</Text>
                  </View>
                  <Text style={{ fontSize: 16, color: '#333', fontWeight: '500', textAlign: 'center', marginBottom: 8 }}>{profile?.gender || 'Not specified'}</Text>
                  <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8 }}>{profile?.bio || 'No Bio'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Ionicons name="folder-open" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 15, color: COLORS.primary, fontWeight: 'bold' }}>{projects.length} Uploaded Project{projects.length === 1 ? '' : 's'}</Text>
                  </View>
                </View>
                {/* Projects List (scrollable) */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, marginLeft: 20 }}>Projects</Text>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}>
                  {projects.length === 0 ? (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>No uploaded projects yet.</Text>
                  ) : (
                    projects.map(project => (
                      <PostCard
                        key={project.id}
                        project={project}
                        currentUserId={currentUserId}
                        onLike={() => handleLike(project.id)}
                        onBookmark={() => handleBookmark(project.id)}
                        onComment={() => {}}
                        onShare={() => {}}
                        onMenu={() => {}}
                        onProfile={() => {}}
                        onPdf={() => project.pdf_url && Linking.openURL(project.pdf_url)}
                        menuVisible={false}
                        menuProject={null}
                        closeMenu={() => {}}
                        handleEdit={() => {}}
                        handleDelete={() => {}}
                        handleReport={() => {}}
                        hideEdit={true}
                      />
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
} 