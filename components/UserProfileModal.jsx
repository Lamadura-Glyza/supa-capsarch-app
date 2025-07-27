import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 10, color: '#666' }}>Loading profile...</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Profile Info */}
              <View style={{ alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' }}>
                <Image
                  source={{ uri: profile?.profile_picture_url || DEFAULT_AVATAR }}
                  style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 8 }}
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 2 }}>{profile?.full_name || 'User'}</Text>
                
                {/* Year Level and Block */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>BSIT</Text>
                  <Text style={{ fontSize: 16, color: '#666' }}> – </Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{profile?.year_level || 'N/A'}</Text>
                  <Text style={{ fontSize: 16, color: '#666' }}> </Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{profile?.block || 'N/A'}</Text>
                </View>
                
                {/* Gender */}
                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500', textAlign: 'center', marginBottom: 8 }}>
                  {profile?.gender || 'Not specified'}
                </Text>
                
                {/* Bio */}
                {profile?.bio && (
                  <View style={{ marginBottom: 12, paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 }}>
                      {profile.bio}
                    </Text>
                  </View>
                )}
                
                {/* Project Count */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Ionicons name="folder-open" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 15, color: COLORS.primary, fontWeight: 'bold' }}>
                    {projects.length} Uploaded Project{projects.length === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
              
              {/* Projects Section */}
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 }}>
                  Projects ({projects.length})
                </Text>
                
                {projects.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                    <Text style={{ color: '#666', marginTop: 8, textAlign: 'center' }}>
                      No projects uploaded yet
                    </Text>
                  </View>
                ) : (
                  projects.map(project => (
                    <View key={project.id} style={{ marginBottom: 16 }}>
                      <PostCard
                        project={project}
                        currentUserId={currentUserId}
                        onLike={() => handleLike(project.id)}
                        onBookmark={() => handleBookmark(project.id)}
                        onComment={() => {}} // Disable comment navigation in modal
                        onShare={() => {}}
                        onMenu={() => {}} // Disable menu in modal
                        onProfile={() => {}} // Disable profile navigation in modal
                        onPdf={() => project.pdf_url && Linking.openURL(project.pdf_url)}
                        hideEdit={true} // Hide edit options in modal
                      />
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
} 