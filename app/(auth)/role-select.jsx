import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';

const RoleSelect = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.primary, '#1a1a4d']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Logo */}
        <Image
          source={require('../../assets/image/logo.png')}
          style={{ width: 180, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 40 }}>
        I am signing up as a…
        </Text>

        {/* Role Buttons */}
        <View style={{ width: '85%', gap: 20 }}>
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/(auth)/teacher-signup', params: { role: 'teacher' } })
            }
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingVertical: 18,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text style={{ color: COLORS.primary, fontSize: 20, fontWeight: '700' }}>
             Teacher
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/(auth)/signup', params: { role: 'student' } })
            }
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingVertical: 18,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text style={{ color: COLORS.primary, fontSize: 20, fontWeight: '700' }}>
              Student
            </Text>
          </TouchableOpacity>
        </View>

        
      </LinearGradient>
    </SafeAreaView>
  );
};

export default RoleSelect;
