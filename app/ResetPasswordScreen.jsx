import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setMessage(error.message);
    else {
      setMessage('Password reset successful! Please log in.');
      setTimeout(() => router.push('/(auth)/login'), 1500);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send</Text>}
        </TouchableOpacity>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2d2586', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '85%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#23235b', marginBottom: 8 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#23235b', borderRadius: 8, paddingVertical: 12, width: '100%', alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  message: { color: '#23235b', marginTop: 8, textAlign: 'center' },
}); 