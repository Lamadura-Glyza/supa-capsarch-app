import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'
import * as FileSystem from 'expo-file-system'
import { AppState, Platform } from 'react-native'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants/index'

// Only import URL polyfill in non-web environments
if (typeof window === 'undefined' || Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})
// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (Platform.OS !== 'web' && typeof AppState !== 'undefined') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}



// Authentication functions
export const signInWithEmail = async (email, password) => {
  try {
    console.log('signInWithEmail called with:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('signInWithEmail result:', { hasData: !!data, hasError: !!error });
    return { data, error };
  } catch (error) {
    console.error('signInWithEmail exception:', error);
    return { error };
  }
};

export const signUpWithEmail = async (email, password, userMetadata = {}) => {
  try {
    console.log('Signing up with metadata:', userMetadata);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata
      }
    });
    console.log('Signup result:', { hasData: !!data, hasError: !!error });
    return { data, error };
  } catch (error) {
    console.error('Signup exception:', error);
    return { error };
  }
};

export const signOut = async () => {
  try {
    console.log('Signing out from Supabase...');
    
    // Check current session before logout
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log('Current session before logout:', !!currentSession);
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', error);
      return { error };
    }
    
    // Check session after logout
    const { data: { session: afterSession } } = await supabase.auth.getSession();
    console.log('Session after logout:', !!afterSession);
    
    // Clear all Supabase-related storage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const supabaseKeys = keys.filter(key => key.includes('supabase'));
      console.log('Clearing Supabase keys:', supabaseKeys);
      await AsyncStorage.multiRemove(supabaseKeys);
    } catch (storageError) {
      console.log('Storage clear error (non-critical):', storageError);
    }
    
    console.log('Sign out completed successfully');
    return { error: null };
  } catch (error) {
    console.error('Unexpected signOut error:', error);
    return { error };
  }
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getSession = () => {
  return supabase.auth.getSession();
};

// Project upload function
export const uploadProject = async ({ title, abstract, sourceCode, videoLink, pdf }) => {
  try {
    console.log('Starting project upload...');
    
    // 1. Upload PDF to Supabase Storage
    console.log('Uploading PDF file...');
    const fileData = await FileSystem.readAsStringAsync(pdf.uri, { encoding: FileSystem.EncodingType.Base64 });
    const filePath = `projects/${Date.now()}_${pdf.name}`;
    
    // Convert base64 to Uint8Array for React Native
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('projects')
      .upload(filePath, bytes, {
        contentType: 'application/pdf',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('PDF upload error:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    console.log('PDF uploaded successfully');

    // 2. Get public URL
    const { data: urlData } = supabase.storage.from('projects').getPublicUrl(filePath);
    const pdfUrl = urlData.publicUrl;

    // 3. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // 4. Insert metadata into DB
    console.log('Inserting project metadata...');
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title,
        abstract,
        source_code: sourceCode,
        video_link: videoLink,
        pdf_url: pdfUrl,
        user_id: user.id,
        created_at: new Date().toISOString(),
      }]);
    
    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Failed to save project: ${error.message}`);
    }

    console.log('Project uploaded successfully');
    return data;
  } catch (error) {
    console.error('Upload project error:', error);
    throw error;
  }
};

// Fetch all projects for the home page
export const getProjects = async () => {
  try {
    console.log('Fetching projects...');
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    console.log('Projects fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Get projects error:', error);
    throw error;
  }
};

// User profile functions
export const createUserProfile = async (profileData) => {
  try {
    console.log('Creating user profile...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: user.id,
        full_name: profileData.fullName,
        email: profileData.email,
        year_level: profileData.yearLevel,
        block: profileData.block,
        gender: profileData.gender,
      }]);

    if (error) {
      console.error('Profile creation error:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    console.log('User profile created successfully');
    return data;
  } catch (error) {
    console.error('Create user profile error:', error);
    throw error;
  }
};

export const createDefaultProfile = async () => {
  try {
    console.log('Creating default user profile...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: user.id,
        full_name: 'User',
        email: user.email,
        year_level: 'Not specified',
        block: 'Not specified',
        gender: 'Not specified',
      }]);

    if (error) {
      console.error('Default profile creation error:', error);
      throw new Error(`Failed to create default profile: ${error.message}`);
    }

    console.log('Default user profile created successfully');
    return data;
  } catch (error) {
    console.error('Create default user profile error:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Profile fetch error:', error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    // If no profile exists, return null instead of throwing error
    if (!data || data.length === 0) {
      console.log('No user profile found, returning null');
      return null;
    }

    console.log('User profile fetched successfully');
    return data[0]; // Return the first (and should be only) profile
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    console.log('Updating user profile...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: profileData.fullName,
        year_level: profileData.yearLevel,
        block: profileData.block,
        gender: profileData.gender,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    console.log('User profile updated successfully');
    return data;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};