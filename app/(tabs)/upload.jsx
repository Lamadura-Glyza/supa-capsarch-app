import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRefresh } from '../../lib/RefreshContext';
import { uploadProject } from '../../lib/supabase';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [titleDescription, setTitleDescription] = useState('');
  const [abstract, setAbstract] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [pdf, setPdf] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const { triggerRefresh } = useRefresh();

  // PDF upload logic
  const handlePdfUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (10MB limit)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a PDF file smaller than 10MB.');
          return;
        }

        setPdf({
          uri: file.uri,
          name: file.name,
          size: file.size,
          type: file.mimeType,
        });
        setErrors(prev => ({ ...prev, pdf: null }));
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to pick PDF file. Please try again.');
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!titleDescription.trim()) {
      newErrors.titleDescription = 'Project title description is required';
    } else if (titleDescription.trim().length > 100) {
      newErrors.titleDescription = 'Project title description must be 100 characters or less';
    }

    if (!abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    } else if (abstract.trim().length < 50) {
      newErrors.abstract = 'Abstract must be at least 50 characters long';
    }

    if (!sourceCode.trim()) {
      newErrors.sourceCode = 'Source code link is required';
    } else if (!isValidUrl(sourceCode)) {
      newErrors.sourceCode = 'Please enter a valid URL';
    }

    if (!videoLink.trim()) {
      newErrors.videoLink = 'Video link is required';
    } else if (!isValidUrl(videoLink)) {
      newErrors.videoLink = 'Please enter a valid URL';
    }

    if (!pdf) {
      newErrors.pdf = 'PDF file is required';
    }

    if (!agreed) {
      newErrors.agreed = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle form submission
  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    try {
      const projectData = {
        title: title.trim(),
        titleDescription: titleDescription.trim(),
        abstract: abstract.trim(),
        sourceCode: sourceCode.trim(),
        videoLink: videoLink.trim(),
        pdf: pdf,
      };

      await uploadProject(projectData);
      
      // Trigger refresh of Home tab
      triggerRefresh();
      
      Alert.alert(
        'Success!',
        'Your project has been uploaded successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setTitleDescription('');
              setAbstract('');
              setSourceCode('');
              setVideoLink('');
              setPdf(null);
              setAgreed(false);
              setErrors({});
            },
          },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload project. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderFormTab = () => (
    <ScrollView contentContainerStyle={[styles.form, { padding: 10, paddingTop: 10 }]}> 
      {/* Project Title */}
      <Text style={styles.label}>Project Title *</Text>
      <TextInput
        style={[styles.input, errors.title && styles.inputError]}
        placeholder="Enter project title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (errors.title) setErrors(prev => ({ ...prev, title: null }));
        }}
      />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      {/* Project Title Description */}
      <Text style={styles.label}>Project Title Description *</Text>
      <TextInput
        style={[styles.input, errors.titleDescription && styles.inputError]}
        placeholder="Enter project title description (max 100 characters)"
        placeholderTextColor="#888"
        value={titleDescription}
        onChangeText={(text) => {
          setTitleDescription(text);
          if (errors.titleDescription) setErrors(prev => ({ ...prev, titleDescription: null }));
        }}
        maxLength={100}
      />
      <Text style={styles.characterCount}>
        {titleDescription.length}/100 characters
      </Text>
      {errors.titleDescription && <Text style={styles.errorText}>{errors.titleDescription}</Text>}

      {/* Abstract */}
      <Text style={styles.label}>Abstract *</Text>
      <TextInput
        style={[styles.input, styles.textarea, errors.abstract && styles.inputError]}
        placeholder="Enter project abstract (minimum 50 characters)"
        placeholderTextColor="#888"
        value={abstract}
        onChangeText={(text) => {
          setAbstract(text);
          if (errors.abstract) setErrors(prev => ({ ...prev, abstract: null }));
        }}
        multiline
        numberOfLines={4}
      />
      {errors.abstract && <Text style={styles.errorText}>{errors.abstract}</Text>}

      {/* Source Code Link */}
      <Text style={styles.label}>Source Code Link *</Text>
      <TextInput
        style={[styles.input, errors.sourceCode && styles.inputError]}
        placeholder="GitHub repository URL"
        placeholderTextColor="#888"
        value={sourceCode}
        onChangeText={(text) => {
          setSourceCode(text);
          if (errors.sourceCode) setErrors(prev => ({ ...prev, sourceCode: null }));
        }}
        autoCapitalize="none"
        keyboardType="url"
      />
      {errors.sourceCode && <Text style={styles.errorText}>{errors.sourceCode}</Text>}

      {/* Video Link */}
      <Text style={styles.label}>Video Link *</Text>
      <TextInput
        style={[styles.input, errors.videoLink && styles.inputError]}
        placeholder="YouTube video URL"
        placeholderTextColor="#888"
        value={videoLink}
        onChangeText={(text) => {
          setVideoLink(text);
          if (errors.videoLink) setErrors(prev => ({ ...prev, videoLink: null }));
        }}
        autoCapitalize="none"
        keyboardType="url"
      />
      {errors.videoLink && <Text style={styles.errorText}>{errors.videoLink}</Text>}

      {/* Project PDF */}
      <Text style={styles.label}>Project PDF *</Text>
      <Pressable 
        style={[styles.pdfBox, errors.pdf && styles.inputError]} 
        onPress={handlePdfUpload}
      >
        {pdf ? (
          <View style={styles.pdfSelected}>
            <Ionicons name="document" size={24} color="#35359e" />
            <Text style={styles.pdfFileName}>{pdf.name}</Text>
            <Text style={styles.pdfFileSize}>
              {(pdf.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
            <TouchableOpacity 
              style={styles.removePdf}
              onPress={() => setPdf(null)}
            >
              <Ionicons name="close-circle" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.pdfText}>
            Tap to upload your project PDF{Platform.OS === 'web' ? '' : '\n'}
            <Text style={{ color: '#888', fontSize: 12 }}>
              {'\n'}Maximum file size: 10MB
            </Text>
          </Text>
        )}
      </Pressable>
      {errors.pdf && <Text style={styles.errorText}>{errors.pdf}</Text>}

      {/* Terms and Conditions */}
      <View style={styles.checkboxRow}>
        <TouchableOpacity 
          onPress={() => {
            setAgreed(!agreed);
            if (errors.agreed) setErrors(prev => ({ ...prev, agreed: null }));
          }} 
          style={styles.checkbox}
        >
          {agreed ? (
            <Ionicons name="checkbox" size={22} color="#35359e" />
          ) : (
            <Ionicons name="square-outline" size={22} color="#35359e" />
          )}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>
          I confirm that this project is my original work and I have the right to publish it. I agree to the terms and conditions.
        </Text>
      </View>
      {errors.agreed && <Text style={styles.errorText}>{errors.agreed}</Text>}

      {/* Upload Button */}
      <TouchableOpacity 
        style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]} 
        onPress={handleUpload}
        disabled={isUploading}
      >
        <Text style={styles.uploadBtnText}>
          {isUploading ? 'Uploading...' : 'Upload Project'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Project</Text>
      </View>

      {/* Content */}
      {renderFormTab()}
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#35359e',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f0ff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#35359e',
  },
  form: {
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pdfBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  pdfText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  pdfSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pdfFileName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  pdfFileSize: {
    fontSize: 12,
    color: '#888',
  },
  removePdf: {
    padding: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  uploadBtn: {
    backgroundColor: '#35359e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
  },
  characterCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
};

 