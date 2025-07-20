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
    
    if (data?.user && !error) {
      // Check if user profile exists, create default if not
      try {
        const existingProfile = await getUserProfile();
        if (!existingProfile) {
          console.log('No user profile found, creating default profile');
          await createDefaultProfile();
        }
      } catch (profileError) {
        console.error('Failed to check/create user profile during login:', profileError);
        // Don't fail the login if profile creation fails
      }
    }
    
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
    
    if (data?.user && !error) {
      // Create user profile after successful signup
      try {
        await createUserProfile({
          fullName: userMetadata.full_name || 'User',
          email: email,
          yearLevel: userMetadata.year_level || 'Not specified',
          block: userMetadata.block || 'Not specified',
          gender: userMetadata.gender || 'Not specified',
          bio: null,
          profilePictureUrl: null,
        });
        console.log('User profile created during signup');
      } catch (profileError) {
        console.error('Failed to create user profile during signup:', profileError);
        // Don't fail the signup if profile creation fails
      }
    }
    
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
export const uploadProject = async ({ title, titleDescription, abstract, sourceCode, videoLink, pdf, category }) => {
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
        title_description: titleDescription,
        abstract,
        source_code: sourceCode,
        video_link: videoLink,
        pdf_url: pdfUrl,
        user_id: user.id,
        created_at: new Date().toISOString(),
        category, // <-- ensure this is included
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Fetch all projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, category')
      .order('created_at', { ascending: false });
    if (error) throw error;

    if (!projects || projects.length === 0) return [];

    // 2. Fetch user profiles for all projects
    const userIds = [...new Set(projects.map(p => p.user_id).filter(Boolean))];
    let userProfiles = [];
    if (userIds.length > 0) {
      const { data, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, profile_picture_url')
        .in('user_id', userIds);
      if (!userError) userProfiles = data;
    }
    const userMap = {};
    userProfiles.forEach(u => { userMap[u.user_id] = u; });

    // 3. Fetch likes/bookmarks/comments for all projects
    const projectIds = projects.map(p => p.id);
    // Likes
    const { data: likes } = await supabase
      .from('project_likes')
      .select('project_id, user_id');
    // Bookmarks
    const { data: bookmarks } = await supabase
      .from('project_bookmarks')
      .select('project_id, user_id');
    // Comments
    const { data: comments } = await supabase
      .from('project_comments')
      .select('project_id');

    // 4. Map counts and user state
    projects.forEach(project => {
      // Attach user profile
      project.user_profiles = userMap[project.user_id] || null;
      // Like count
      project.like_count = likes ? likes.filter(l => l.project_id === project.id).length : 0;
      // Bookmark count
      project.bookmark_count = bookmarks ? bookmarks.filter(b => b.project_id === project.id).length : 0;
      // Comment count
      project.comment_count = comments ? comments.filter(c => c.project_id === project.id).length : 0;
      // Liked by current user
      project.liked_by_user = likes ? likes.some(l => l.project_id === project.id && l.user_id === user.id) : false;
      // Bookmarked by current user
      project.bookmarked_by_user = bookmarks ? bookmarks.some(b => b.project_id === project.id && b.user_id === user.id) : false;
    });

    return projects;
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
        bio: profileData.bio || null,
        profile_picture_url: profileData.profilePictureUrl || null,
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
        bio: null,
        profile_picture_url: null,
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

export const getUserProfile = async (userId) => {
  try {
    let id = userId;
    if (!id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      id = user.id;
    }
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', id);
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    console.log('Updating user profile...');
    console.log('Profile data being saved:', profileData); // Debug log
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
        bio: profileData.bio || null,
        profile_picture_url: profileData.profilePictureUrl || null,
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

// Upload profile picture to Supabase Storage
export const uploadProfilePicture = async (imageUri) => {
  try {
    console.log('Uploading profile picture...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check file size before uploading
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    const fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB
    const maxFileSizeMB = 5; // 5MB limit

    if (fileSizeInMB > maxFileSizeMB) {
      throw new Error(`File size too large. Maximum allowed size is ${maxFileSizeMB}MB. Current file size: ${fileSizeInMB.toFixed(2)}MB`);
    }

    // Read the image file
    const fileData = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
    
    // Generate unique filename with user ID as folder
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExtension}`;
    
    console.log('File extension:', fileExtension);
    console.log('Generated filename:', fileName);
    
    // Convert base64 to Uint8Array for React Native
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Upload to 'avatars' bucket
    const uploadResult = await supabase.storage
      .from('avatars')
      .upload(fileName, bytes, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });
    
    if (uploadResult.error) {
      console.error('Profile picture upload error:', uploadResult.error);
      throw new Error(`Failed to upload profile picture: ${uploadResult.error.message}`);
    }

    // Get public URL from avatars bucket
    const urlData = supabase.storage.from('avatars').getPublicUrl(fileName);
    const profilePictureUrl = urlData.data.publicUrl;

    console.log('URL data:', urlData);
    console.log('Generated profile picture URL:', profilePictureUrl);
    console.log('Profile picture uploaded successfully');
    return profilePictureUrl;
  } catch (error) {
    console.error('Upload profile picture error:', error);
    throw error;
  }
};

// Notification functions
export const getNotifications = async () => {
  try {
    console.log('Fetching notifications...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select(`*, sender:sender_id(full_name, profile_picture_url), projects!inner(title)`) // join sender profile and project title
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

export const createNotification = async (notificationData) => {
  try {
    console.log('Creating notification...');
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        recipient_id: notificationData.recipientId,
        sender_id: notificationData.senderId,
        project_id: notificationData.projectId,
        type: notificationData.type,
        message: notificationData.message,
        read: false,
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Notification creation error:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    console.log('Notification created successfully');
    return data;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log('Marking notification as read...');
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }

    console.log('Notification marked as read');
    return data;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

export const likeProject = async (projectId) => {
  try {
    console.log('Liking project...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('project_likes')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike the project
      const { error } = await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error unliking project:', error);
        throw new Error(`Failed to unlike project: ${error.message}`);
      }

      console.log('Project unliked successfully');
      return { liked: false };
    } else {
      // Like the project
      const { error } = await supabase
        .from('project_likes')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('Error liking project:', error);
        throw new Error(`Failed to like project: ${error.message}`);
      }

      // Get project owner for notification
      const { data: project } = await supabase
        .from('projects')
        .select('user_id, title')
        .eq('id', projectId)
        .single();

      if (project && project.user_id !== user.id) {
        // Create notification for project owner
        await createNotification({
          recipientId: project.user_id,
          senderId: user.id,
          projectId: projectId,
          type: 'like',
          message: `Someone liked your project "${project.title}"`,
        });
      }

      console.log('Project liked successfully');
      return { liked: true };
    }
  } catch (error) {
    console.error('Like project error:', error);
    throw error;
  }
};

export const bookmarkProject = async (projectId) => {
  try {
    console.log('Bookmarking project...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if already bookmarked
    const { data: existingBookmark } = await supabase
      .from('project_bookmarks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from('project_bookmarks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing bookmark:', error);
        throw new Error(`Failed to remove bookmark: ${error.message}`);
      }

      console.log('Bookmark removed successfully');
      return { bookmarked: false };
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('project_bookmarks')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('Error bookmarking project:', error);
        throw new Error(`Failed to bookmark project: ${error.message}`);
      }

      // Get project owner for notification
      const { data: project } = await supabase
        .from('projects')
        .select('user_id, title')
        .eq('id', projectId)
        .single();

      if (project && project.user_id !== user.id) {
        // Create notification for project owner
        await createNotification({
          recipientId: project.user_id,
          senderId: user.id,
          projectId: projectId,
          type: 'bookmark',
          message: `Someone bookmarked your project "${project.title}"`,
        });
      }

      console.log('Project bookmarked successfully');
      return { bookmarked: true };
    }
  } catch (error) {
    console.error('Bookmark project error:', error);
    throw error;
  }
};

// Project Comments Functions
export const getProjectComments = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from('project_comments')
      .select('*, user_profiles:user_id(full_name, profile_picture_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addProjectComment = async (projectId, comment) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('project_comments')
      .insert([{
        project_id: projectId,
        user_id: user.id,
        comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
    if (error) throw error;

    // Get project owner for notification
    const { data: project } = await supabase
      .from('projects')
      .select('user_id, title')
      .eq('id', projectId)
      .single();
    if (project && project.user_id !== user.id) {
      await createNotification({
        recipientId: project.user_id,
        senderId: user.id,
        projectId: projectId,
        type: 'comment',
        message: `Someone commented on your project "${project.title}"`,
      });
    }

    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getProjectCommentCount = async (projectId) => {
  try {
    const { count, error } = await supabase
      .from('project_comments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting comments:', error);
    throw error;
  }
};

export const getUserProjects = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, user_profiles:user_id(full_name, profile_picture_url), category')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
};

export const getUserBookmarkedProjects = async (userId) => {
  try {
    // Get all bookmarks for the user
    const { data: bookmarks, error } = await supabase
      .from('project_bookmarks')
      .select('project_id')
      .eq('user_id', userId);
    if (error) throw error;
    const projectIds = bookmarks?.map(b => b.project_id) || [];
    if (projectIds.length === 0) return [];
    // Fetch project data for all bookmarked projects
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('*, user_profiles:user_id(full_name, profile_picture_url), category')
      .in('id', projectIds)
      .order('created_at', { ascending: false });
    if (projError) throw projError;
    return projects || [];
  } catch (error) {
    console.error('Error fetching bookmarked projects:', error);
    throw error;
  }
};

// Search users by full name (case-insensitive, partial match)
export const searchUsersByName = async (query) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('full_name', `%${query}%`);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Search projects by title (case-insensitive, partial match)
export const searchProjectsByTitle = async (query) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, user_profiles:user_id(full_name, profile_picture_url, block), category')
      .ilike('title', `%${query}%`);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
};

// Get count of unread notifications for the current user
export const getUnreadNotificationCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

export const deleteProject = async (projectId) => {
  try {
    // Delete related likes
    await supabase.from('project_likes').delete().eq('project_id', projectId);
    // Delete related bookmarks
    await supabase.from('project_bookmarks').delete().eq('project_id', projectId);
    // Delete related comments
    await supabase.from('project_comments').delete().eq('project_id', projectId);
    // Delete the project itself
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Delete project error:', error);
    throw error;
  }
};