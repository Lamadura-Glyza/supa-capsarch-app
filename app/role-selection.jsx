import { router } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";

const RoleSelection = () => {
  const handleTeacherSelection = () => {
    router.push('/signup/teacher');
  };

  const handleStudentSelection = () => {
    router.push('/(auth)/signup?role=student');
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24
    }}>
      <StatusBar barStyle="light-content" />
      
      {/* Title Section */}
      <View style={{
        marginBottom: 60,
        alignItems: 'center'
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: COLORS.white,
          textAlign: 'center',
          textShadowColor: '#222',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }}>
          Continue as:
        </Text>
      </View>

      {/* Role Selection Buttons */}
      <View style={{
        width: '100%',
        gap: 20
      }}>
        {/* Teacher Button */}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            paddingVertical: 20,
            paddingHorizontal: 24,
            alignItems: 'center',
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            minHeight: 80,
            justifyContent: 'center'
          }}
          onPress={handleTeacherSelection}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS.primary,
          }}>
            Teacher
          </Text>
        </TouchableOpacity>

        {/* Student Button */}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            paddingVertical: 20,
            paddingHorizontal: 24,
            alignItems: 'center',
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            minHeight: 80,
            justifyContent: 'center'
          }}
          onPress={handleStudentSelection}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS.primary,
          }}>
            Student
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelection;
