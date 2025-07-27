import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProfileModal from '../components/UserProfileModal';
import { addProjectComment, getCurrentUser, getProjectComments } from '../lib/supabase';

export default function CommentScreen() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchComments();
    getCurrentUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
  }, [projectId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getProjectComments(projectId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addProjectComment(projectId, newComment.trim());
      setNewComment('');
      await fetchComments();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
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

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <TouchableOpacity onPress={() => handleProfilePress(item.user_id)}>
        <View style={styles.avatarBox}>
          {item.user_profiles?.profile_picture_url ? (
            <Image
              source={{ uri: item.user_profiles.profile_picture_url }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={36} color="#bbb" />
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <TouchableOpacity onPress={() => handleProfilePress(item.user_id)}>
          <Text style={styles.commentAuthor}>{item.user_profiles?.full_name || 'User'}</Text>
        </TouchableOpacity>
        <Text style={styles.commentText}>{item.comment}</Text>
        <Text style={styles.commentTime}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f5f5f5" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#23235b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={{ width: 28 }} />
        </View>
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? <Text style={styles.loadingText}>Loading...</Text> : <Text style={styles.emptyText}>No comments yet.</Text>
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, submitting && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={submitting || !newComment.trim()}
          >
            <Ionicons name="send" size={20} color={submitting || !newComment.trim() ? '#ccc' : '#fff'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#23235b',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarBox: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#35359e',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#35359e',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
}); 