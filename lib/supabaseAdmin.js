import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY;

console.log('Supabase Admin Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  urlLength: supabaseUrl?.length,
  anonKeyLength: supabaseAnonKey?.length,
  serviceKeyLength: supabaseServiceKey?.length
});

// Create a fallback client if environment variables are missing
let supabaseAdmin;
try {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      anonKey: !!supabaseAnonKey,
      serviceKey: !!supabaseServiceKey
    });
    // Create a dummy client that will fail gracefully
    supabaseAdmin = {
      auth: {
        admin: {
          listUsers: async () => ({ data: { users: [] }, error: new Error('Environment variables not set') }),
        },
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => ({ data: [], error: new Error('Environment variables not set') }) }) }),
        insert: () => ({ data: null, error: new Error('Environment variables not set') }),
        update: () => ({ eq: () => ({ data: null, error: new Error('Environment variables not set') }) }),
        delete: () => ({ eq: () => ({ data: null, error: new Error('Environment variables not set') }) }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Environment variables not set') }),
          getPublicUrl: () => ({ data: { publicUrl: null } }),
        }),
      },
    };
  } else {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('Supabase Admin client created successfully');
  }
} catch (error) {
  console.error('Error creating Supabase Admin client:', error);
  // Create fallback client
  supabaseAdmin = {
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: new Error('Supabase Admin client creation failed') }),
      },
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ data: [], error: new Error('Supabase Admin client creation failed') }) }) }),
      insert: () => ({ data: null, error: new Error('Supabase Admin client creation failed') }),
      update: () => ({ eq: () => ({ data: null, error: new Error('Supabase Admin client creation failed') }) }),
      delete: () => ({ eq: () => ({ data: null, error: new Error('Supabase Admin client creation failed') }) }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error('Supabase Admin client creation failed') }),
        getPublicUrl: () => ({ data: { publicUrl: null } }),
      }),
    },
  };
}

export { supabaseAdmin };

export const getPendingProjects = async () => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select(`
      *,
      user_profiles:user_id (
        full_name,
        profile_picture_url,
        year_level,
        block,
        gender
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending projects:', error);
    throw error;
  }

  // Get counts for each project
  const projectsWithCounts = await Promise.all(
    (data || []).map(async (project) => {
      const { count: likeCount } = await supabaseAdmin
        .from('project_likes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: commentCount } = await supabaseAdmin
        .from('project_comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: bookmarkCount } = await supabaseAdmin
        .from('project_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      return {
        ...project,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        bookmark_count: bookmarkCount || 0,
      };
    })
  );

  return projectsWithCounts;
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

export const getMostLikedProject = async () => {
  try {
    // First, get all projects with their like counts
    const { data: projectsWithLikes, error: likesError } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        user_profiles:user_id (
          full_name,
          profile_picture_url,
          year_level,
          block,
          gender
        )
      `)
      .eq('status', 'approved');

    if (likesError) {
      console.error('Error fetching projects:', likesError);
      throw likesError;
    }

    if (!projectsWithLikes || projectsWithLikes.length === 0) {
      return null;
    }

    // Get like counts for all projects
    const projectsWithCounts = await Promise.all(
      projectsWithLikes.map(async (project) => {
        const { count: likeCount } = await supabaseAdmin
          .from('project_likes')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        const { count: commentCount } = await supabaseAdmin
          .from('project_comments')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        const { count: bookmarkCount } = await supabaseAdmin
          .from('project_bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        return {
          ...project,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
          bookmark_count: bookmarkCount || 0,
        };
      })
    );

    // Find the project with the highest like count
    const mostLikedProject = projectsWithCounts.reduce((prev, current) => {
      return (prev.like_count > current.like_count) ? prev : current;
    });

    return mostLikedProject;
  } catch (error) {
    console.error('Error in getMostLikedProject:', error);
    throw error;
  }
};

export const getAllProjects = async () => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select(`
      *,
      user_profiles:user_id (
        full_name,
        profile_picture_url,
        year_level,
        block,
        gender
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  }

  // Get counts for each project
  const projectsWithCounts = await Promise.all(
    (data || []).map(async (project) => {
      const { count: likeCount } = await supabaseAdmin
        .from('project_likes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: commentCount } = await supabaseAdmin
        .from('project_comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: bookmarkCount } = await supabaseAdmin
        .from('project_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      return {
        ...project,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        bookmark_count: bookmarkCount || 0,
      };
    })
  );

  return projectsWithCounts;
};

export const getApprovedProjects = async () => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select(`
      *,
      user_profiles:user_id (
        full_name,
        profile_picture_url,
        year_level,
        block,
        gender
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching approved projects:', error);
    throw error;
  }

  // Get counts for each project
  const projectsWithCounts = await Promise.all(
    (data || []).map(async (project) => {
      const { count: likeCount } = await supabaseAdmin
        .from('project_likes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: commentCount } = await supabaseAdmin
        .from('project_comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: bookmarkCount } = await supabaseAdmin
        .from('project_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      return {
        ...project,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        bookmark_count: bookmarkCount || 0,
      };
    })
  );

  return projectsWithCounts;
};

export const getRejectedProjects = async () => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select(`
      *,
      user_profiles:user_id (
        full_name,
        profile_picture_url,
        year_level,
        block,
        gender
      )
    `)
    .eq('status', 'rejected')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rejected projects:', error);
    throw error;
  }

  // Get counts for each project
  const projectsWithCounts = await Promise.all(
    (data || []).map(async (project) => {
      const { count: likeCount } = await supabaseAdmin
        .from('project_likes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: commentCount } = await supabaseAdmin
        .from('project_comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { count: bookmarkCount } = await supabaseAdmin
        .from('project_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      return {
        ...project,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        bookmark_count: bookmarkCount || 0,
      };
    })
  );

  return projectsWithCounts;
}; 