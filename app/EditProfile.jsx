import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../lib/supabase';

const { width } = Dimensions.get('window');

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=4A90E2&color=fff&size=120';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [yearLevel, setYearLevel] = useState('4');
  const [block, setBlock] = useState('A');
  const [bio, setBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('user');

  // Load existing profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      setProfile(profile);
      setRole(profile?.role || 'user');
      
      if (profile) {
        setFullName(profile.full_name || '');
        // Normalize gender value to 'Male' or 'Female'
        let normalizedGender = 'Male';
        if (profile.gender) {
          const g = profile.gender.trim().toLowerCase();
          if (g === 'female') normalizedGender = 'Female';
          else if (g === 'male') normalizedGender = 'Male';
        }
        setGender(normalizedGender);
        setYearLevel(profile.year_level || '4');
        setBlock(profile.block || 'A');
        setBio(profile.bio || '');
        
        // Set profile picture
        if (profile.profile_picture_url) {
          setAvatar(profile.profile_picture_url);
          setProfilePictureUrl(profile.profile_picture_url);
        } else {
          setAvatar(DEFAULT_AVATAR);
          setProfilePictureUrl(null);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      console.log('=== IMAGE PICKER START ===');
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);
      console.log('Result canceled:', result.canceled);
      console.log('Result assets:', result.assets);

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Show temporary preview
        setAvatar(imageUri);
        
        // Upload to Supabase Storage
        try {
          Alert.alert('Uploading...', 'Please wait while we upload your profile picture.');
          console.log('=== UPLOAD PROCESS START ===');
          console.log('Uploading image URI:', imageUri);
          
          const uploadedUrl = await uploadProfilePicture(imageUri);
          console.log('Upload successful, URL received:', uploadedUrl);
          
          setProfilePictureUrl(uploadedUrl);
          setAvatar(uploadedUrl);
          
          console.log('=== UPLOAD PROCESS COMPLETE ===');
          console.log('profilePictureUrl state set to:', uploadedUrl);
          console.log('avatar state set to:', uploadedUrl);
          
          Alert.alert('Success', 'Profile picture uploaded successfully!');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          
          // Check if it's a file size error
          if (uploadError.message.includes('File size too large')) {
            Alert.alert(
              'File Too Large', 
              uploadError.message + '\n\nPlease select a smaller image or compress your photo before uploading.',
              [
                { text: 'OK' },
                { 
                  text: 'Try Again', 
                  onPress: () => pickImage()
                }
              ]
            );
          } else {
            Alert.alert(
              'Upload Error', 
              'Failed to upload profile picture. This might be due to network issues or storage configuration. Please try again later.',
              [
                { text: 'OK' },
                { 
                  text: 'Use Local Image', 
                  onPress: () => {
                    // Keep the local image for now, user can save it later
                    setProfilePictureUrl(imageUri);
                  }
                }
              ]
            );
          }
          // Revert to previous avatar
          setAvatar(profilePictureUrl || DEFAULT_AVATAR);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }

    try {
      setSaving(true);
      
      console.log('=== SAVE PROCESS START ===');
      console.log('Current profilePictureUrl state:', profilePictureUrl);
      console.log('Current avatar state:', avatar);
      console.log('Saving profile with picture URL:', profilePictureUrl);
      
      const profileDataToSave = {
        fullName: fullName.trim(),
        yearLevel,
        block,
        gender,
        bio: bio.trim(),
        profilePictureUrl,
      };
      
      console.log('Profile data to save:', profileDataToSave);
      
      await updateUserProfile(profileDataToSave);
      
      console.log('=== SAVE PROCESS COMPLETE ===');

      Alert.alert('Success', 'Profile updated successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Refresh the profile data before going back
            loadProfileData();
            router.back();
          }
        }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => {
            if (role !== 'admin') {
              router.replace('/(tabs)/profile');
            } else {
              router.back();
            }
          }}>
            <Ionicons name="arrow-back" size={28} color="#23235b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 28 }} />
        </View>
        
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
        />
        
        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity style={styles.radioBtn} onPress={() => setGender('Male')}>
            <View style={[styles.radioCircle, gender === 'Male' && styles.radioCircleSelected]} />
            <Text style={styles.radioLabel}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.radioBtn} onPress={() => setGender('Female')}>
            <View style={[styles.radioCircle, gender === 'Female' && styles.radioCircleSelected]} />
            <Text style={styles.radioLabel}>Female</Text>
          </TouchableOpacity>
        </View>
        {/* Year Level and Block - only for non-admins */}
        {role !== 'admin' && (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Year Level</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={yearLevel}
                  onValueChange={setYearLevel}
                  style={styles.picker}
                  dropdownIconColor="#23235b"
                  mode="dropdown"
                >
                  <Picker.Item label="1st Year" value="1" />
                  <Picker.Item label="2nd Year" value="2" />
                  <Picker.Item label="3rd Year" value="3" />
                  <Picker.Item label="4th Year" value="4" />
                </Picker>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Block</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={block}
                  onValueChange={setBlock}
                  style={styles.picker}
                  dropdownIconColor="#23235b"
                  mode="dropdown"
                >
                  <Picker.Item label="Block A" value="A" />
                  <Picker.Item label="Block B" value="B" />
                  <Picker.Item label="Block C" value="C" />
                  <Picker.Item label="Block D" value="D" />
                  <Picker.Item label="Block E" value="E" />
                </Picker>
              </View>
            </View>
          </View>
        )}
        {/* Bio - only for non-admins */}
        {role !== 'admin' && (
          <>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Write something about yourself..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </>
        )}
        
        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Save Edit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#23235b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '92%',
    padding: 24,
    alignItems: 'stretch',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#23235b',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#23235b',
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 110,
    backgroundColor: '#23235b',
    borderRadius: 15,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#23235b',
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
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
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#23235b',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  radioCircleSelected: {
    backgroundColor: '#23235b',
  },
  radioLabel: {
    fontSize: 14,
    color: '#23235b',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 56,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  picker: {
    width: '100%',
    height: 56,
    color: '#23235b',
    fontSize: 16,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#23235b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  saveBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 