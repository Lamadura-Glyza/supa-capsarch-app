import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [category, setCategory] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a PDF file smaller than 5MB.');
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

    // Project title description: no min/max length
    if (!titleDescription.trim()) {
      newErrors.titleDescription = 'Project title description is required';
    }
    // Remove max length check for titleDescription

    // Abstract: now optional, no min/max length
    // Remove all checks for abstract

    // Category selection remains required
    if (!category) {
      newErrors.category = 'Please select a project category';
    }

    // Source code link: now optional, no required or URL check
    // Remove all checks for sourceCode

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
        category: category,
      };

      await uploadProject(projectData);
      triggerRefresh();
      setShowSuccessModal(true);
      // Do not reset form or navigate yet; wait for modal action
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
        placeholder="Enter project title description"
        placeholderTextColor="#888"
        value={titleDescription}
        onChangeText={(text) => {
          setTitleDescription(text);
          if (errors.titleDescription) setErrors(prev => ({ ...prev, titleDescription: null }));
        }}
        // maxLength={110} // Removed max length
      />
      {/* <Text style={styles.characterCount}>
        {titleDescription.length}/110 characters
      </Text> */}
      {errors.titleDescription && <Text style={styles.errorText}>{errors.titleDescription}</Text>}

      {/* Abstract */}
      <Text style={styles.label}>Abstract *</Text>
      <TextInput
        style={[styles.input, styles.textarea, errors.abstract && styles.inputError]}
        placeholder="Enter project abstract"
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

      {/* Category Selection */}
      <Text style={styles.label}>Project Category *</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
          onPress={() => setCategory('Mobile Application')}
        >
          <Ionicons name={category === 'Mobile Application' ? 'radio-button-on' : 'radio-button-off'} size={22} color="#35359e" />
          <Text style={{ marginLeft: 6, fontSize: 16 }}>Mobile Application</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => setCategory('Web Application')}
        >
          <Ionicons name={category === 'Web Application' ? 'radio-button-on' : 'radio-button-off'} size={22} color="#35359e" />
          <Text style={{ marginLeft: 6, fontSize: 16 }}>Web Application</Text>
        </TouchableOpacity>
      </View>
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

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
              {'\n'}Maximum file size: 5MB
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
      {/* Remove the custom header View and its contents (the one with styles.header and headerTitle) from the Upload tab.
          The rest of the layout (form, etc.) should remain unchanged. */}

      {/* Content */}
      {renderFormTab()}
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', width: 320, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 }}>
            <View style={{ backgroundColor: '#e6f0ff', borderRadius: 50, padding: 16, marginBottom: 16 }}>
              <Ionicons name="time-outline" size={40} color="#35359e" />
            </View>
            <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#222', marginBottom: 8, textAlign: 'center' }}>Project Submitted!</Text>
            <Text style={{ color: '#666', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>
              Your Project has been submitted and is{"\n"}
              pending admin approval. We'll notify you{"\n"}
              once it's approved.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18, marginTop: 2 }}>
              <Ionicons name="time-outline" size={18} color="#888" style={{ marginRight: 4 }} />
              <Text style={{ color: '#888', fontSize: 13 }}>Estimated review time: 24-48 hours</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#35359e', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, width: '100%', marginBottom: 10 }}
              onPress={() => {
                setShowSuccessModal(false);
                // Reset form
                setTitle('');
                setTitleDescription('');
                setAbstract('');
                setSourceCode('');
                setVideoLink('');
                setPdf(null);
                setAgreed(false);
                setErrors({});
                // Navigate to Project Status screen
                router.replace('/ProjectStatus');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>View Project Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#ccc', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, width: '100%' }}
              onPress={() => {
                setShowSuccessModal(false);
                // Reset form
                setTitle('');
                setTitleDescription('');
                setAbstract('');
                setSourceCode('');
                setVideoLink('');
                setPdf(null);
                setAgreed(false);
                setErrors({});
                // Navigate to home
                router.replace('/home');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

 