import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../constants/colors";
import { signUpTeacherWithProfile } from '../../lib/supabase';

const TeacherSignup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    setError('');
    setSuccess('');

    if (!fullName.trim()) return setError('Full Name is required.');
    if (!email.trim()) return setError('Email is required.');
    if (!password) return setError('Password is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { data, error } = await signUpTeacherWithProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        gender,
      });
      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setError('This email is already registered. Please use a different email or log in.');
        } else if (error.message.toLowerCase().includes('rate limit')) {
          setError('Too many signup attempts. Please wait a few minutes before trying again.');
        } else {
          setError(error.message);
        }
      } else if (data?.user && !data?.session) {
        setSuccess('Account created! Please verify your email. Admin must approve before login.');
        router.replace('/(auth)/login');
      } else if (data?.user && data?.session) {
        setSuccess('Account created successfully! Redirecting...');
        router.replace('/(auth)/login');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Teacher signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 30,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              width: '90%',
              padding: 24,
              alignItems: 'stretch',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#35359e',
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              Teacher Registration
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#35359e',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Please fill in your information
            </Text>

            {error ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text> : null}
            {success ? <Text style={{ color: 'green', textAlign: 'center', marginBottom: 8 }}>{success}</Text> : null}

            {/* Full Name */}
            <Text style={{ fontSize: 14, color: '#35359e', fontWeight: '600', marginTop: 10 }}>Full Name</Text>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#888"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 10,
                fontSize: 15,
                marginBottom: 8,
                backgroundColor: '#f9fafb',
              }}
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email */}
            <Text style={{ fontSize: 14, color: '#35359e', fontWeight: '600', marginTop: 10 }}>Email</Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 10,
                fontSize: 15,
                marginBottom: 8,
                backgroundColor: '#f9fafb',
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Gender */}
            <Text style={{ fontSize: 14, color: '#35359e', fontWeight: '600', marginTop: 10 }}>Gender</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                onPress={() => setGender('male')}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: '#35359e',
                    marginRight: 6,
                    backgroundColor: gender === 'male' ? '#35359e' : '#fff',
                  }}
                />
                <Text style={{ color: '#35359e', fontSize: 15, fontWeight: '600' }}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => setGender('female')}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: '#35359e',
                    marginRight: 6,
                    backgroundColor: gender === 'female' ? '#35359e' : '#fff',
                  }}
                />
                <Text style={{ color: '#35359e', fontSize: 15, fontWeight: '600' }}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* Password */}
            <Text style={{ fontSize: 14, color: '#35359e', fontWeight: '600', marginTop: 10 }}>Password</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#888"
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 15,
                  marginBottom: 8,
                  backgroundColor: '#f9fafb',
                  paddingRight: 50,
                }}
                secureTextEntry={!isPasswordShown}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 10, top: 10 }}
                onPress={() => setIsPasswordShown(!isPasswordShown)}
              >
                <Ionicons name={isPasswordShown ? 'eye-off' : 'eye'} size={20} color="#35359e" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={{ fontSize: 14, color: '#35359e', fontWeight: '600', marginTop: 10 }}>Confirm Password</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 15,
                  marginBottom: 8,
                  backgroundColor: '#f9fafb',
                  paddingRight: 50,
                }}
                secureTextEntry={!isConfirmPasswordShown}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 10, top: 10 }}
                onPress={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
              >
                <Ionicons name={isConfirmPasswordShown ? 'eye-off' : 'eye'} size={20} color="#35359e" />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#35359e',
                borderRadius: 8,
                padding: 15,
                alignItems: 'center',
                marginTop: 20,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontSize: 14, color: '#35359e' }}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#35359e',
                    textDecorationLine: 'underline',
                  }}
                >
                  Login
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TeacherSignup;
