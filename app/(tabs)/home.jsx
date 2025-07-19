import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { getProjects } from '../../lib/supabase';

export default function HomeScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = (pdfUrl) => {
    // TODO: Implement PDF download functionality
    console.log('Downloading PDF:', pdfUrl);
  };

  const handleViewPDF = (pdfUrl) => {
    // TODO: Implement PDF viewer functionality
    console.log('Viewing PDF:', pdfUrl);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ backgroundColor: COLORS.primary }}>
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
      <SafeAreaView style={{ backgroundColor: COLORS.primary }}>
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
    <SafeAreaView style={{ backgroundColor: COLORS.primary }}>
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
      
      <ScrollView contentContainerStyle={{ padding: 10, paddingTop: 10 }}>
        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to upload a capstone project!
            </Text>
          </View>
        ) : (
          projects.map(project => (
            <View key={project.id} style={styles.card}>
              {/* User Info */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color="#35359e" />
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.userName}>
                    {project.user_id ? `User ${project.user_id.substring(0, 8)}...` : 'Anonymous User'}
                  </Text>
                  <Text style={styles.date}>{formatDate(project.created_at)}</Text>
                </View>
              </View>
              
              {/* Title & Description */}
              <Text style={styles.cardTitle}>{project.title}</Text>
              <Text style={styles.cardDesc}>{project.abstract.substring(0, 100)}...</Text>
              
              {/* PDF Preview */}
              <View style={styles.docPreview}>
                <Ionicons name="document" size={48} color="#35359e" />
                <Text style={styles.pdfText}>PDF Document</Text>
                <TouchableOpacity 
                  style={styles.viewPdfButton}
                  onPress={() => handleViewPDF(project.pdf_url)}
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
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="heart-outline" size={22} color="#35359e" />
                  <Text style={styles.actionText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={22} color="#35359e" />
                  <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="bookmark-outline" size={22} color="#35359e" />
                  <Text style={styles.actionText}>Bookmark</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleDownload(project.pdf_url)}
                >
                  <Ionicons name="download-outline" size={22} color="#35359e" />
                  <Text style={styles.actionText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16, // Combined paddingTop and paddingBottom
    paddingHorizontal: 16, // Add horizontal padding
  },
  headerContent: {
    flexDirection: 'row', // This makes children align horizontally
    alignItems: 'center', // Vertically center items
    justifyContent: 'center', // Horizontally center the row
  },
  headerLogo: {
    width: 32, // Reduced size for better row alignment
    height: 32,
    marginRight: 8, // Space between logo and title
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22, // Slightly reduced size
    fontWeight: 'bold',
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5,
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
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
}); 