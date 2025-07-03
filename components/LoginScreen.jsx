import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Image source={require('../assets/image/logo.png')} style={styles.logo} />
    <Text style={styles.title}>CapstoneArchive</Text>
    <View style={styles.formCard}>
      <Text style={styles.loginTitle}>Login</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry />
      <View style={styles.forgotRow}>
        <View style={{flex: 1}} />
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation && navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#35359e',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 343,
    height: 194,
    position: 'center',
    alignItems: 'center',
    top: 90,
    marginBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: '#222',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    padding: 24,
    alignItems: 'stretch',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#35359e',
    textAlign: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: '#35359e',
    marginBottom: 4,
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  forgotRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  forgotText: {
    color: '#35359e',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#19194d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#888',
    fontSize: 15,
  },
  signupLink: {
    color: '#35359e',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 