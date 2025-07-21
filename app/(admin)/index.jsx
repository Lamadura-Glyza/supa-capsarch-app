import { Link, router } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function AdminDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Moderation</Text>
        <Text>View and manage pending projects.</Text>
        <Button title="Go to Project Moderation" onPress={() => router.push('/(admin)/moderation')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <Text>View and manage all users.</Text>
        <Button title="Go to User Management" onPress={() => router.push('/(admin)/users')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        <Text>View platform analytics.</Text>
        <Button title="Go to Analytics" onPress={() => router.push('/(admin)/analytics')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Removal</Text>
        <Text>Tools to remove inappropriate content.</Text>
        <Button title="Go to Content Removal" onPress={() => router.push('/(admin)/content')} />
      </View>
      
      <Link href="/(tabs)/profile" asChild>
        <Button title="Back to Profile" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
}); 