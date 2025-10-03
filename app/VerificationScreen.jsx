import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function VerificationScreen() {
  const { email } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      const parsed = Linking.parse(url);
      if (parsed.fragment && parsed.fragment.includes('access_token=')) {
        router.replace('/ResetPasswordScreen');
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage('A new reset link has been sent to your email.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>We’ve sent a password reset link to your email. Please check your inbox.</Text>
        <TouchableOpacity onPress={handleResend} style={styles.resendBtn} disabled={loading}>
          <Text style={styles.resendText}>Resend</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator color="#23235b" />}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>Go back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2d2586', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '85%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#23235b', marginBottom: 8 },
  subtitle: { color: '#23235b', marginBottom: 16, textAlign: 'center' },
  resendBtn: { marginBottom: 16 },
  resendText: { color: '#2d2586', fontWeight: 'bold', textDecorationLine: 'underline' },
  message: { color: '#23235b', marginTop: 8, textAlign: 'center' },
  link: { color: '#2d2586', marginTop: 12, textDecorationLine: 'underline' },
}); 