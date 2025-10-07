import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';

const Welcome = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Image source={require('../../assets/image/logo.png')} style={{ width: 260, height: 160, marginBottom: 20, resizeMode: 'contain' }} />
        <Text style={{ fontSize: 34, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>CapstoneArchive</Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/role-select')}
          activeOpacity={0.9}
          style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}
        >
          <Text style={{ color: COLORS.primary, fontSize: 20, fontWeight: '700' }}>Get Started</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 14, flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: '#e5e7eb', fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' }}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;


