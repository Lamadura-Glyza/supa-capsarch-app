import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import styles from './postCardStyles';

export default function PostCard({
  project,
  currentUserId,
  onLike,
  onBookmark,
  onComment,
  onMenu,
  onProfile,
  onPdf,
  menuVisible,
  menuProject,
  closeMenu,
  handleEdit,
  handleDelete,
  handleReport,
  hideEdit, // new prop
}) {
  return (
    <View style={styles.card}>
      {/* Kebab Menu */}
      <TouchableOpacity style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }} onPress={() => onMenu(project)}>
        <Ionicons name="ellipsis-vertical" size={22} color="#888" />
      </TouchableOpacity>
      {menuVisible && menuProject?.id === project.id && (
        <View style={{
          position: 'absolute',
          top: 36,
          right: 12,
          backgroundColor: '#fff',
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
          zIndex: 100,
        }}>
          {currentUserId === project.user_id ? (
            <TouchableOpacity style={{ padding: 10 }} onPress={handleDelete}><Text style={{ color: 'red' }}>Delete</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity style={{ padding: 10 }} onPress={handleReport}><Text>Report</Text></TouchableOpacity>
          )}
          <TouchableOpacity style={{ padding: 10 }} onPress={closeMenu}><Text>Close</Text></TouchableOpacity>
        </View>
      )}
      {/* User Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <TouchableOpacity onPress={() => onProfile(project.user_id)}>
          <View style={styles.avatar}>
            {project.user_profiles?.profile_picture_url ? (
              <Image source={{ uri: project.user_profiles.profile_picture_url }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={20} color="#35359e" />
            )}
          </View>
        </TouchableOpacity>
        <View style={{ marginLeft: 8 }}>
          <TouchableOpacity onPress={() => onProfile(project.user_id)}>
            <Text style={styles.userName}>
              {project.user_profiles?.full_name || (project.user_id ? `User ${project.user_id.substring(0, 8)}...` : 'Anonymous User')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.date}>{new Date(project.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      {/* Title & Description */}
      <Text style={styles.cardTitle}>{project.title}</Text>
      <Text style={styles.cardDesc}>
        {project.title_description || project.abstract?.substring(0, 110) + '...'}
      </Text>
      {/* PDF Preview */}
      <View style={styles.docPreview}>
        <Ionicons name="document" size={48} color="#35359e" />
        <Text style={styles.pdfText}>PDF Document</Text>
        <TouchableOpacity style={styles.viewPdfButton} onPress={() => onPdf(project)}>
          <Text style={styles.viewPdfButtonText}>View PDF</Text>
        </TouchableOpacity>
      </View>
      {/* Abstract */}
      <Text style={styles.abstractLabel}>Abstract</Text>
      <Text style={styles.abstractText}>{project.abstract}</Text>
      {project.category && (
        <Text style={styles.categoryPill}>{project.category}</Text>
      )}
      {/* Links */}
      <View style={styles.linksContainer}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => project.source_code && Linking.openURL(project.source_code)}
          disabled={!project.source_code}
        >
          <Ionicons name="logo-github" size={16} color="#35359e" />
          <Text style={styles.linkText}>Source Code</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => project.video_link && Linking.openURL(project.video_link)}
          disabled={!project.video_link}
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
            <TouchableOpacity onPress={() => onLike(project)}>
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
            <TouchableOpacity onPress={() => onComment(project)}>
              <Ionicons name="chatbubble-outline" size={22} color="#35359e" />
            </TouchableOpacity>
            <Text style={styles.counterText}>{project.comment_count || 0}</Text>
          </View>
          <Text style={styles.actionLabel}>Comment</Text>
        </View>
        {/* Bookmark */}
        <View style={styles.actionBtnCol}>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => onBookmark(project)}>
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
  );
} 