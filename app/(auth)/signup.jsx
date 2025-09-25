import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signUpWithEmail } from '../../lib/supabase';

const Signup = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [block, setBlock] = useState('');

  const [isPasswordShown, setIsPasswordShown] = useState(false);
const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    if (!fullName || !yearLevel || !block || !gender) {
      setError('Full Name, Year Level, Block, and Gender are required.');
      return;
    }
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // Prepare user metadata for signup
      const userMetadata = {
        full_name: fullName,
        year_level: yearLevel,
        block: block,
        gender: gender,
      };
      
      const { data, error } = await signUpWithEmail(email, password, userMetadata);
      if (error) {
        if (
          error.message &&
          (error.message.toLowerCase().includes('already registered') ||
           error.message.toLowerCase().includes('already in use'))
        ) {
          setError('This email is already registered. Please use a different email or log in.');
        } else {
          setError(error.message);
        }
      } else if (!data.user) {
        setSuccess('');
        setError('If this email is already registered, please log in or check your email for a confirmation link.');
      } else {
        setSuccess('Account created successfully! Please check your email to confirm your account, then log in.');
        setError('');
        setTimeout(() => {
          router.replace('./login');
        }, 2000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#35359e',
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
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#35359e',
              textAlign: 'center',
              marginBottom: 16,
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
            value={email}
            onChangeText={setEmail}
          />

          {/* Contact Number 
          <Text
            style={{
              fontSize: 14,
              color: '#35359e',
              marginBottom: 4,
              marginTop: 10,
              fontWeight: '600',
            }}
          >
            Contact Number
          </Text>
          <TextInput
            placeholder="Contact Number"
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
          />*/}

          {/* Year Level and Block */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#35359e',
                  marginBottom: 4,
                  marginTop: 10,
                  fontWeight: '600',
                }}
              >
                Year Level
              </Text>
              <Picker
                selectedValue={yearLevel}
                onValueChange={(itemValue) => setYearLevel(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  backgroundColor: '#f9fafb',
                  marginBottom: 8,
                  height: 50,
                  width: '100%',
                }}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
                <Picker.Item label="4" value="4" />
              </Picker>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#35359e',
                  marginBottom: 4,
                  marginTop: 10,
                  fontWeight: '600',
                }}
              >
                Block
              </Text>
              <Picker
                selectedValue={block}
                onValueChange={(itemValue) => setBlock(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  backgroundColor: '#f9fafb',
                  marginBottom: 8,
                  height: 50,
                  width: '100%',
                }}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="A" value="A" />
                <Picker.Item label="B" value="B" />
                <Picker.Item label="C" value="C" />
                <Picker.Item label="D" value="D" />
                <Picker.Item label="E" value="E" />
              </Picker>
            </View>
          </View>

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
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 20,
              }}
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
              <Text
                style={{
                  color: '#35359e',
                  fontSize: 15,
                  fontWeight: '600',
                }}
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
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
              <Text
                style={{
                  color: '#35359e',
                  fontSize: 15,
                  fontWeight: '600',
                }}
              >
                Female
              </Text>
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
              secureTextEntry={!isPasswordShown}
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 10,
                fontSize: 15,
                marginBottom: 8,
                backgroundColor: '#f9fafb',
              }}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{ position: 'absolute', right: 12, top: 12 }}
            >
              <Ionicons
                name={isPasswordShown ? 'eye' : 'eye-off'}
                size={22}
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
              secureTextEntry={!isConfirmPasswordShown}
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 10,
                fontSize: 15,
                marginBottom: 8,
                backgroundColor: '#f9fafb',
              }}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
              style={{ position: 'absolute', right: 12, top: 12 }}
            >
              <Ionicons
                name={isConfirmPasswordShown ? 'eye' : 'eye-off'}
                size={22}
                color="#35359e"
              />
            </TouchableOpacity>
          </View>
          {/* Signup Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#19194d',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10,
              elevation: 2,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Signing up...' : 'Signup'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ color: '#888', fontSize: 14 }}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('./login')}>
              <Text
                style={{
                  color: '#35359e',
                  fontWeight: 'bold',
                  fontSize: 15,
                  textShadowColor: '#222',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Signup;