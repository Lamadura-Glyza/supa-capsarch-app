import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for a password reset link.');
      router.push({ pathname: '/VerificationScreen', params: { email } });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter Email Address and we will send verification code</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send</Text>}
        </TouchableOpacity>
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
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#23235b', borderRadius: 8, paddingVertical: 12, width: '100%', alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  message: { color: '#23235b', marginTop: 8, textAlign: 'center' },
  link: { color: '#2d2586', marginTop: 12, textDecorationLine: 'underline' },
}); 