import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../constants/colors";
import { signUpTeacherWithProfile } from '../../lib/supabase';

const TeacherSignup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUpTeacherWithProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        gender,
        bio,
      });
      if (error) {
        console.error('Teacher signup error:', error);
        if (
          error.message &&
          (error.message.toLowerCase().includes('already registered') ||
           error.message.toLowerCase().includes('already in use'))
        ) {
          setError('This email is already registered. Please use a different email or log in.');
        } else if (error.message.toLowerCase().includes('rate limit')) {
          setError('Too many signup attempts. Please wait a few minutes before trying again.');
        } else {
          setError(error.message);
        }
      } else {
        console.log('Teacher signup response:', { data, hasUser: !!data?.user, hasSession: !!data?.session });
        
        // Check if user needs email confirmation
        if (data?.user && !data?.session) {
          // User created but needs email confirmation
          console.log('Teacher user created, email confirmation required');
          setSuccess('Account created! Please verify your email. Admin must approve before login.');
          setError('');
          // Immediate redirect - no artificial delay
          router.replace('/(auth)/login');
        } else if (data?.user && data?.session) {
          // User created and already confirmed (shouldn't happen in normal flow)
          console.log('Teacher user created and already confirmed');
          setSuccess('Account created successfully! Redirecting...');
          setError('');
          // Immediate redirect - no artificial delay
          router.replace('/(auth)/login');
        } else {
          // No user data returned - this might be an issue
          console.log('No user data returned from teacher signup');
          setError('Signup failed. Please try again or contact support if the problem persists.');
        }
      }
    } catch (err) {
      console.error('Teacher signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <StatusBar style="light" />
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
          top: 10,
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#35359e',
              textAlign: 'center',
              marginBottom: 4,
              marginTop: 4,
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
          
          {error ? (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
          ) : null}
          {success ? (
            <Text style={{ color: 'green', textAlign: 'center', marginBottom: 8 }}>{success}</Text>
          ) : null}

          {/* Full Name */}
          <Text
            style={{
              fontSize: 14,
              color: '#35359e',
              marginBottom: 4,
              marginTop: 10,
              fontWeight: '600',
            }}
          >
            Full Name 
          </Text>
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
          <Text
            style={{
              fontSize: 14,
              color: '#35359e',
              marginBottom: 4,
              marginTop: 10,
              fontWeight: '600',
            }}
          >
            Email 
          </Text>
          
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
          <Text
            style={{
              fontSize: 14,
              color: '#35359e',
              marginBottom: 4,
              marginTop: 10,
              fontWeight: '600',
            }}
          >
            Gender
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
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
          <Text
            style={{
              fontSize: 14,
              color: '#35359e',
              marginBottom: 4,
              marginTop: 10,
              fontWeight: '600',
            }}
          >
            Password 
          </Text>
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
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
              }}
              onPress={() => setIsPasswordShown(!isPasswordShown)}
            >
              <Ionicons
                name={isPasswordShown ? 'eye-off' : 'eye'}
                size={20}
                color="#35359e"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text
            style={{
              fontSize: 14,
              color: '#35359e',
              marginBottom: 4,
              marginTop: 10,
              fontWeight: '600',
            }}
          >
            Confirm Password 
          </Text>
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
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
              }}
              onPress={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
            >
              <Ionicons
                name={isConfirmPasswordShown ? 'eye-off' : 'eye'}
                size={20}
                color="#35359e"
              />
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
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
            <Text style={{
              fontSize: 14,
              color: '#35359e',
              textAlign: 'center',
            }}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#35359e',
                textDecorationLine: 'underline',
              }}>
                Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TeacherSignup;
