import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { getAnalytics } from '../../lib/supabaseAdmin';

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState({ uploads: 0, users: 0, bookmarks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [fetchAnalytics])
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={fetchAnalytics} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Uploads</Text>
        <Text style={styles.cardValue}>{analytics.uploads}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Users</Text>
        <Text style={styles.cardValue}>{analytics.users}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Bookmarks</Text>
        <Text style={styles.cardValue}>{analytics.bookmarks}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    color: '#666',
  },
  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
}); 