import { router } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";

const Onboarding = () => {
  const handleGetStarted = () => {
    router.push('/role-selection');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 40
    }}>
      <StatusBar barStyle="light-content" />
      
      {/* Logo Section - Centered */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
      }}>
        <Image
          source={require('../assets/image/logo.png')}
          style={{
            width: 343,
            height: 194,
            marginBottom: 40,
          }}
          resizeMode="contain"
        />
        <Text style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: COLORS.white,
          textAlign: 'center',
          textShadowColor: '#222',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }}>
          CapstoneArchive
        </Text>
      </View>

      {/* Footer Section */}
      <View style={{
        width: '100%',
        paddingHorizontal: 24,
        paddingBottom: 20
      }}>
        {/* Get Started Button */}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: 'center',
            marginBottom: 16,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: COLORS.primary,
          }}>
            Get Started
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 16,
            color: COLORS.white,
            textAlign: 'center',
          }}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={handleLogin}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: COLORS.white,
              textDecorationLine: 'underline',
            }}>
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
