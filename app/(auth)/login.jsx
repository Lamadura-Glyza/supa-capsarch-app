/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../constants/colors";
import { signInWithEmail } from '../../lib/supabase';

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data) {
      // Login successful, the app will handle navigation automatically
      console.log('Login successful');
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.primary,
      alignItems: 'center'}}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../../assets/image/logo.png')}
        style={{
          width: 343,
          height: 194,
          top: 90,
          marginBottom: 100,
        }}
      />
      <Text style={{
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
        textShadowColor: '#222',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
      }}>
        CapstoneArchive
      </Text>
      <View style={{
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
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#35359e',
          textAlign: 'center',
          marginBottom: 18,
        }}>
          Login
        </Text>
        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
        ) : null}
        {/* Email */}
        <Text style={{
          fontSize: 15,
          color: '#35359e',
          marginBottom: 4,
          marginTop: 10,
          fontWeight: '600',
        }}>
          Email
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            padding: 10,
            fontSize: 16,
            marginBottom: 8,
            backgroundColor: '#f9fafb',
          }}
          placeholder="Email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {/* Password */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '400',
            marginVertical: 8,
            color: COLORS.primary
          }}>
            Password
          </Text>
          <View>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#888"
              secureTextEntry={!isPasswordShown}
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                marginBottom: 8,
                backgroundColor: '#f9fafb',
              }}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{
                position: "absolute",
                right: 12,
                top: 10,
              }}
            >
              {isPasswordShown ? (
                <Ionicons name="eye" size={24} color={COLORS.primary} />
              ) : (
                <Ionicons name="eye-off" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Forgot Password */}
        <View style={{
          flexDirection: 'row',
          marginBottom: 16,
          alignItems: 'center',
        }}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => router.push('/ForgotPasswordScreen')}>
            <Text style={{
              color: '#35359e',
              fontWeight: 'bold',
              fontSize: 14,
              textAlign: 'right',
              textDecorationLine: 'underline',
            }}>
              Forgot?
            </Text>
          </TouchableOpacity>
        </View>
        {/* Login Button */}
        <TouchableOpacity 
          onPress={handleLogin}
          style={{
            backgroundColor: '#19194d',
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 10,
            marginTop: 4,
            elevation: 2,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          <Text style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
        {/* Signup Prompt */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 8,
        }}>
          <Text style={{
            color: '#888',
            fontSize: 15,
          }}>
            Don't have an account?
          </Text>
          <Pressable onPress={() => router.push('./signup')}>
            <Text style={{
              color: '#35359e',
              fontWeight: 'bold',
              fontSize: 16,
              textShadowColor: '#222',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}>
              Signup
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;