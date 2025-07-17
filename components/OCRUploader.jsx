import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ocrService } from '../lib/ocrService';
import { supabase } from '../lib/supabase';

export default function OCRUploader() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [isConnected, setIsConnected] = useState(false);

  // Check connection to Flask backend on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await ocrService.testConnection();
      setIsConnected(connected);
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  // Request permissions for image picker
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!'
      );
      return false;
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setExtractedText('');
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to make this work!'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setExtractedText('');
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Convert image to base64
  const imageToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw error;
    }
  };

  // Send image to Flask OCR API
  const processOCR = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'Connection Error',
        'Cannot connect to OCR service. Please check your Flask backend is running and try again.'
      );
      return;
    }

    setIsProcessing(true);
    setStatus('loading');

    try {
      // Get base64 from selected image
      const base64Image = selectedImage.base64 || await imageToBase64(selectedImage.uri);
      
      // Use OCR service
      const data = await ocrService.extractText(base64Image);
      
      if (data.text) {
        setExtractedText(data.text);
        setStatus('success');
      } else {
        throw new Error('No text extracted from image');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      setStatus('error');
      Alert.alert(
        'OCR Error',
        'Failed to process the image. Please check your Flask backend is running and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Save to Supabase
  const saveToSupabase = async () => {
    if (!extractedText.trim()) {
      Alert.alert('No Text', 'Please process an image first to extract text.');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Upload image to Supabase Storage (optional - you can skip this if you don't need to store images)
      let imageUrl = null;
      if (selectedImage) {
        const fileName = `scan_${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('scans')
          .upload(fileName, selectedImage.base64, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          console.warn('Image upload failed:', uploadError);
          // Continue without image URL
        } else {
          const { data: urlData } = supabase.storage
            .from('scans')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Insert scan data into database
      const { data, error } = await supabase
        .from('scans')
        .insert([
          {
            user_id: user.id,
            image_url: imageUrl,
            extracted_text: extractedText,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      Alert.alert(
        'Success',
        'Document scanned and saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedImage(null);
              setExtractedText('');
              setStatus('idle');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Supabase save error:', error);
      Alert.alert(
        'Save Error',
        'Failed to save the scan. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Scanner</Text>
        <Text style={styles.subtitle}>Scan capstone documents with OCR</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.connectionContainer}>
        <View style={styles.connectionItem}>
          <Ionicons 
            name={isConnected ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color={isConnected ? "#4CAF50" : "#F44336"} 
          />
          <Text style={[styles.connectionText, { color: isConnected ? '#4CAF50' : '#F44336' }]}>
            {isConnected ? 'Connected to OCR Service' : 'OCR Service Unavailable'}
          </Text>
        </View>
        {!isConnected && (
          <TouchableOpacity style={styles.retryButton} onPress={checkConnection}>
            <Ionicons name="refresh" size={16} color="#35359e" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select Image</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Image */}
      {selectedImage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Image</Text>
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
          <TouchableOpacity
            style={[styles.processButton, isProcessing && styles.disabledButton]}
            onPress={processOCR}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="scan-outline" size={20} color="#fff" />
                <Text style={styles.processButtonText}>Process OCR</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Status Indicator */}
      {status !== 'idle' && (
        <View style={styles.statusContainer}>
          {status === 'loading' && (
            <View style={styles.statusItem}>
              <ActivityIndicator size="small" color="#35359e" />
              <Text style={styles.statusText}>Processing image...</Text>
            </View>
          )}
          {status === 'success' && (
            <View style={styles.statusItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                Text extracted successfully!
              </Text>
            </View>
          )}
          {status === 'error' && (
            <View style={styles.statusItem}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={[styles.statusText, { color: '#F44336' }]}>
                Failed to extract text
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Extracted Text</Text>
          <View style={styles.textContainer}>
            <Text style={styles.extractedText}>{extractedText}</Text>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={saveToSupabase}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save to Database</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#35359e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  processButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#35359e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  textContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
  },
  extractedText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  connectionContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0ff',
  },
  retryText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#35359e',
    fontWeight: '500',
  },
}); 