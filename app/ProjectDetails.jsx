import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';
import { getProjects } from '../lib/supabase';

export default function ProjectDetails() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      // getProjects returns all, so filter by id
      const projects = await getProjects();
      const found = projects.find(p => p.id == projectId);
      setProject(found || null);
      if (!found) setError('Project not found');
    } catch (err) {
      setError('Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar style="dark" backgroundColor="#f5f5f5" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop:10}}>Loading...</Text>
      </SafeAreaView>
    );
  }
  if (error || !project) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar style="dark" backgroundColor="#f5f5f5" />
        <Text style={{color:'#f00'}}>{error || 'Project not found.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar style="dark" backgroundColor="#f5f5f5" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color="#35359e" />
          <Text style={{ color: '#35359e', fontSize: 16, marginLeft: 8 }}>Back</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          {/* User Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Image
              source={{ uri: project.user_profiles?.profile_picture_url || 'https://ui-avatars.com/api/?name=User&background=4A90E2&color=fff&size=120' }}
              style={styles.avatarImage}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.userName}>{project.user_profiles?.full_name || 'User'}</Text>
              <Text style={styles.date}>{new Date(project.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
          {/* Title & Description */}
          <Text style={styles.cardTitle}>{project.title}</Text>
          {project.title_description ? <Text style={styles.cardDesc}>{project.title_description}</Text> : null}
          {/* PDF Preview */}
          {project.pdf_url ? (
            <View style={styles.docPreview}>
              <Ionicons name="document" size={48} color="#35359e" />
              <Text style={styles.pdfText}>PDF Document</Text>
              <TouchableOpacity style={styles.viewPdfButton} onPress={() => Linking.openURL(project.pdf_url)}>
                <Text style={styles.viewPdfButtonText}>View PDF</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {/* Abstract */}
          {project.abstract ? <><Text style={styles.abstractLabel}>Abstract</Text><Text style={styles.abstractText}>{project.abstract}</Text></> : null}
          {/* Links */}
          <View style={styles.linksContainer}>
            {project.source_code ? (
              <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(project.source_code)}>
                <Ionicons name="logo-github" size={16} color="#35359e" />
                <Text style={styles.linkText}>Source Code</Text>
              </TouchableOpacity>
            ) : null}
            {project.video_link ? (
              <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(project.video_link)}>
                <Ionicons name="logo-youtube" size={16} color="#ff0000" />
                <Text style={styles.linkText}>Video</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
}); 