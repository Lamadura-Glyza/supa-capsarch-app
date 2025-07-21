import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import COLORS from '../constants/colors';

export default function AdminDashboardLink({ isAdmin }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <View style={styles.adminBanner}>
      <Text style={styles.adminBannerText}>You are an admin.</Text>
      <Link href="/(admin)" asChild>
        <Button title="Go to Admin Dashboard" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  adminBanner: {
    backgroundColor: COLORS.primary,
    padding: 10,
    alignItems: 'center',
  },
  adminBannerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
}); 