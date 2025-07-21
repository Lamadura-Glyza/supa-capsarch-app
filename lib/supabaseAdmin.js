import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are not set. Please check your .env file.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const getPendingProjects = async () => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending projects:', error);
    throw error;
  }
  return data;
};

export const approveProject = async (projectId) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ status: 'approved' })
    .eq('id', projectId);

  if (error) {
    console.error(`Error approving project ${projectId}:`, error);
    throw error;
  }
  return data;
};

export const disapproveProject = async (projectId, notes) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ status: 'rejected', admin_notes: notes })
    .eq('id', projectId);

  if (error) {
    console.error(`Error disapproving project ${projectId}:`, error);
    throw error;
  }
  return data;
};

export const getAllUsers = async () => {
  // Get all users from auth
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  // Get user_ids
  const userIds = users.map(u => u.id);
  // Fetch user_profiles for all users with role = 'user'
  let profiles = [];
  if (userIds.length > 0) {
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, full_name, email, gender, year_level, block, role')
      .in('user_id', userIds)
      .eq('role', 'user');
    if (!profileError) profiles = profileData;
  }
  // Merge auth and profile data, only for users with a profile and role = 'user'
  const userMap = {};
  profiles.forEach(p => { userMap[p.user_id] = p; });
  return users
    .filter(u => userMap[u.id])
    .map(u => ({
      id: u.id,
      email: u.email,
      ...userMap[u.id],
    }));
};

export const getProjectById = async (projectId) => {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
  
    if (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
    return data;
  };

export const getAnalytics = async () => {
    const { count: projectCount, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact' });

    const { count: userCount, error: userError } = await supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'user');
    
    const { count: bookmarkCount, error: bookmarkError } = await supabaseAdmin
        .from('project_bookmarks')
        .select('*', { count: 'exact' });

    if(projectError || userError || bookmarkError) {
        console.error('Error fetching analytics:', { projectError, userError, bookmarkError });
        throw new Error('Failed to fetch analytics');
    }

    return {
        uploads: projectCount,
        users: userCount,
        bookmarks: bookmarkCount,
    }
}

export const deleteProjectAsAdmin = async (projectId) => {
    const { error } = await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error(`Error deleting project ${projectId}:`, error);
        throw error;
    }
}; 

export const getProjectStatusCounts = async () => {
  // Count by status
  const statuses = ['pending', 'approved', 'rejected'];
  const counts = {};
  for (const status of statuses) {
    const { count, error } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    if (error) throw error;
    counts[status] = count || 0;
  }
  // Count deleted (if possible)
  // If deleted projects are actually removed from the table, this will always be 0
  // If you use a 'deleted' status, add it here
  // counts['deleted'] = ...
  return counts;
}; 