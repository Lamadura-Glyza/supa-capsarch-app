import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SignupScreen = () => {
  const [gender, setGender] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [block, setBlock] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please fill in your information</Text>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#888" />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" />
          <Text style={styles.label}>Contact Number</Text>
          <TextInput style={styles.input} placeholder="Contact Number" placeholderTextColor="#888" />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Year Level</Text>
              <Picker
                selectedValue={yearLevel}
                style={styles.picker}
                onValueChange={(itemValue) => setYearLevel(itemValue)}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
                <Picker.Item label="4" value="4" />
              </Picker>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Block</Text>
              <Picker
                selectedValue={block}
                style={styles.picker}
                onValueChange={(itemValue) => setBlock(itemValue)}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="A" value="A" />
                <Picker.Item label="B" value="B" />
                <Picker.Item label="C" value="C" />
                <Picker.Item label="D" value="D" />
                <Picker.Item label="E" value="E" />
              </Picker>
            </View>
          </View>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity style={styles.radioContainer} onPress={() => setGender('male')}>
              <View style={[styles.radio, gender === 'male' && styles.radioSelected]} />
              <Text style={styles.radioLabel}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioContainer} onPress={() => setGender('female')}>
              <View style={[styles.radio, gender === 'female' && styles.radioSelected]} />
              <Text style={styles.radioLabel}>Female</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry />
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#888" secureTextEntry />
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Signup</Text>
          </TouchableOpacity>
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#35359e',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  formCard: {
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
  },
 
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#35359e',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#35359e',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
    fontSize: 15,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    height: 50,
    width: '100%',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#35359e',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: '#35359e',
  },
  radioLabel: {
    color: '#35359e',
    fontSize: 15,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#19194d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#888',
    fontSize: 14,
  },
  loginLink: {
    color: '#35359e',
    fontWeight: 'bold',
    fontSize: 15,
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 