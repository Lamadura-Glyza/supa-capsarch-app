import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';

const posts = [
  {
    id: 1,
    user: {
      name: 'Juan Dela Cruz',
      section: 'BSIT-4 A',
      avatar: require('../../assets/image/icon.png'),
    },
    date: 'February 14, 2025',
    title: 'Capstone Archive',
    description: 'A Digital Platform for Storing and Sharing Capstone Projects of Consolatrix College of Toledo City',
    document: require('../../assets/image/logo.png'),
    abstract: 'A mobile application that enables BSIT students to store, organize, and share capstone projects. It offers an accessible repository that serves as a valuable resource for current students seeking inspiration, guidance, or references for their own capstone projects.',
    likes: 2,
    comments: 2,
  },
  {
    id: 2,
    user: {
      name: 'Juan Dela Cruz',
      section: 'BSIT-4 A',
      avatar: require('../../assets/image/icon.png'),
    },
    date: 'February 14, 2025',
    title: 'Capstone Archive',
    description: 'A Digital Platform for Storing and Sharing Capstone Projects of Consolatrix College of Toledo City',
    document: require('../../assets/image/logo.png'),
    abstract: 'A mobile application that enables BSIT students to store, organize, and share capstone projects. It offers an accessible repository that serves as a valuable resource for current students seeking inspiration, guidance, or references for their own capstone projects.',
    likes: 2,
    comments: 2,
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={{backgroundColor: COLORS.primary}}>
      {/* Header */}
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
        {posts.map(post => (
          <View key={post.id} style={styles.card}>
            {/* User Info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Image source={post.user.avatar} style={styles.avatar} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.userName}>{post.user.name}  •  {post.user.section}</Text>
                <Text style={styles.date}>{post.date}</Text>
              </View>
            </View>
            {/* Title & Description */}
            <Text style={styles.cardTitle}>{post.title}</Text>
            <Text style={styles.cardDesc}>{post.description}</Text>
            {/* Document Preview */}
            <View style={styles.docPreview}>
              <Image source={post.document} style={styles.docImage} resizeMode="contain" />
            </View>
            {/* Abstract */}
            <Text style={styles.abstractLabel}>Abstract</Text>
            <Text style={styles.abstractText}>{post.abstract}</Text>
            {/* Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.actionBtn}>
                <Image source={require('../../assets/images/like.png')} style={styles.actionIcon} />
                <Text style={styles.actionText}>{post.likes} Likes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Image source={require('../../assets/images/comment.png')} style={styles.actionIcon} />
                <Text style={styles.actionText}>{post.comments} Comments</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Image source={require('../../assets/images/bookmark.png')} style={styles.actionIcon} />
                <Text style={styles.actionText}>Bookmark</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Image source={require('../../assets/images/download.png')} style={styles.actionIcon} />
                <Text style={styles.actionText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  docImage: {
    width: 100,
    height: 200,
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
}); 