import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../../components/PostCard';
import { getAllProjects, getAllUsers, getAnalytics, getApprovedProjects, getPendingProjects, getProjectStatusCounts, getRejectedProjects, supabaseAdmin } from '../../lib/supabaseAdmin';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [mostLikedProject, setMostLikedProject] = useState(null);
  const [currentView, setCurrentView] = useState('analytics'); // 'analytics', 'uploads', 'users', 'pending', 'approved', 'rejected'
  const [projects, setProjects] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const getMostLikedProject = async () => {
    try {
      console.log('Fetching most liked project...');
      
      // First, get all projects with their like counts using a simpler approach
      const { data: allProjects, error: projectsError } = await supabaseAdmin
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

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
      }

      console.log('Found approved projects:', allProjects?.length || 0);

      if (!allProjects || allProjects.length === 0) {
        console.log('No approved projects found');
        return null;
      }

      // Get like counts for each project
      const projectsWithCounts = [];
      
      for (const project of allProjects) {
        try {
          // Get like count
          const { count: likeCount } = await supabaseAdmin
            .from('project_likes')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          // Get comment count
          const { count: commentCount } = await supabaseAdmin
            .from('project_comments')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          // Get bookmark count
          const { count: bookmarkCount } = await supabaseAdmin
            .from('project_bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          const projectWithCounts = {
            ...project,
            like_count: likeCount || 0,
            comment_count: commentCount || 0,
            bookmark_count: bookmarkCount || 0,
          };

          console.log(`Project ${project.id} (${project.title}): ${likeCount} likes, ${commentCount} comments, ${bookmarkCount} bookmarks`);
          projectsWithCounts.push(projectWithCounts);
        } catch (error) {
          console.error(`Error getting counts for project ${project.id}:`, error);
          // Add project with zero counts if there's an error
          projectsWithCounts.push({
            ...project,
            like_count: 0,
            comment_count: 0,
            bookmark_count: 0,
          });
        }
      }

      // Sort by like count (descending) and get the most liked project
      const sortedProjects = projectsWithCounts.sort((a, b) => b.like_count - a.like_count);
      const mostLikedProject = sortedProjects[0];
      
      console.log('Most liked project:', mostLikedProject ? {
        id: mostLikedProject.id, 
        title: mostLikedProject.title, 
        likes: mostLikedProject.like_count,
        comments: mostLikedProject.comment_count,
        bookmarks: mostLikedProject.bookmark_count
      } : 'None');
      
      return mostLikedProject;
    } catch (error) {
      console.error('Error in getMostLikedProject:', error);
      return null; // Return null instead of empty array
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting to fetch analytics data...');
      
      const [analyticsData, usersList, statusCountsData, mostLikedData] = await Promise.all([
        getAnalytics().catch(err => {
          console.error('Error fetching analytics:', err);
          return { uploads: 0, users: 0, bookmarks: 0 };
        }),
        getAllUsers().catch(err => {
          console.error('Error fetching users:', err);
          return [];
        }),
        getProjectStatusCounts().catch(err => {
          console.error('Error fetching status counts:', err);
          return { pending: 0, approved: 0, rejected: 0 };
        }),
        getMostLikedProject().catch(err => {
          console.error('Error fetching most liked project:', err);
          return null;
        }),
      ]);
      
      setAnalytics(analyticsData);
      setUsers(usersList);
      setStatusCounts(statusCountsData);
      setMostLikedProject(mostLikedData);
      console.log('Analytics data loaded successfully:', {
        analytics: analyticsData,
        users: usersList?.length,
        statusCounts: statusCountsData,
        mostLiked: mostLikedData ? 'Found' : 'Not found'
      });
    } catch (err) {
      console.error('Error in fetchAnalytics:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details
      });
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = async (view) => {
    setCurrentView(view);
    setViewLoading(true);
    
    try {
      console.log(`Fetching projects for view: ${view}`);
      let projectsData;
      
      switch (view) {
        case 'uploads':
          projectsData = await getAllProjects();
          break;
        case 'pending':
          projectsData = await getPendingProjects();
          break;
        case 'approved':
          projectsData = await getApprovedProjects();
          break;
        case 'rejected':
          projectsData = await getRejectedProjects();
          break;
        default:
          projectsData = [];
      }
      
      console.log(`Successfully fetched ${projectsData?.length || 0} projects for ${view}`);
      setProjects(projectsData || []);
    } catch (err) {
      console.error(`Error fetching projects for ${view}:`, err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details
      });
      // Set empty array instead of throwing
      setProjects([]);
    } finally {
      setViewLoading(false);
    }
  };

  const onRefresh = async () => {
    await fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}><ActivityIndicator size="large" color="#35359e" /><Text>Loading analytics...</Text></View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>
      </SafeAreaView>
    );
  }

  const renderAnalyticsView = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}></Text>
        <View style={styles.analyticsBox}>
          <Text style={styles.analyticsTitle}>App Statistics</Text>
          <View style={styles.analyticsRow}>
            <TouchableOpacity style={styles.analyticsItem} onPress={() => handleViewChange('uploads')}>
              <Ionicons name="cloud-upload-outline" size={24} color="#35359e" />
              <Text style={styles.analyticsValue}>{analytics?.uploads ?? '-'}</Text>
              <Text style={styles.analyticsLabel}>Uploads</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.analyticsItem} onPress={() => handleViewChange('users')}>
              <Ionicons name="people-outline" size={24} color="#35359e" />
              <Text style={styles.analyticsValue}>{analytics?.users ?? '-'}</Text>
              <Text style={styles.analyticsLabel}>Users</Text>
            </TouchableOpacity>
          </View>
          {/* Project Status Counts */}
          <View style={styles.statusRow}>
            <TouchableOpacity style={styles.statusItem} onPress={() => handleViewChange('pending')}>
              <Ionicons name="time-outline" size={20} color="#ffb300" />
              <Text style={styles.statusValue}>{statusCounts.pending}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statusItem} onPress={() => handleViewChange('approved')}>
              <Ionicons name="checkmark-done-outline" size={20} color="#2ecc40" />
              <Text style={styles.statusValue}>{statusCounts.approved}</Text>
              <Text style={styles.statusLabel}>Approved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statusItem} onPress={() => handleViewChange('rejected')}>
              <Ionicons name="close-circle-outline" size={20} color="#ff4136" />
              <Text style={styles.statusValue}>{statusCounts.rejected}</Text>
              <Text style={styles.statusLabel}>Rejected</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Most Liked Project Section */}
        <Text style={styles.sectionTitle}>Most Liked Project</Text>
        {console.log('Most liked project exists:', !!mostLikedProject)}
        {console.log('Most liked project details:', mostLikedProject ? {
          id: mostLikedProject.id,
          title: mostLikedProject.title,
          like_count: mostLikedProject.like_count,
          comment_count: mostLikedProject.comment_count,
          bookmark_count: mostLikedProject.bookmark_count,
          user_name: mostLikedProject.user_profiles?.full_name
        } : 'No project')}
        {mostLikedProject ? (
          <ScrollView 
            style={styles.mostLikedScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mostLikedScrollContent}
          >
            <PostCard
              project={mostLikedProject}
              currentUserId={null} // Admin view, no current user
              onLike={() => {}} // Disable like functionality in admin view
              onBookmark={() => {}} // Disable bookmark functionality in admin view
              onComment={() => {}} // Disable comment functionality in admin view
              onShare={() => {}} // Disable share functionality in admin view
              onMenu={() => {}} // Disable menu functionality in admin view
              onProfile={() => {}} // Disable profile navigation in admin view
              onPdf={() => mostLikedProject.pdf_url && Linking.openURL(mostLikedProject.pdf_url)} // Enable PDF viewing
              hideEdit={true} // Hide edit options
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyProjectContainer}>
            <Ionicons name="heart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyProjectText}>No projects with likes found</Text>
            <Text style={styles.emptyProjectSubtext}>Approved projects will appear here once they receive likes</Text>
            {/* Debug info */}
            <Text style={styles.emptyProjectSubtext}>Debug: mostLikedProject = {mostLikedProject ? 'true' : 'false'}</Text>
            <Text style={styles.emptyProjectSubtext}>Debug: analytics?.uploads = {analytics?.uploads}</Text>
            <Text style={styles.emptyProjectSubtext}>Debug: statusCounts.approved = {statusCounts.approved}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  const renderUsersView = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setCurrentView('analytics')}>
            <Ionicons name="arrow-back" size={24} color="#35359e" />
          </TouchableOpacity>
          <Text style={styles.viewTitle}>All Users</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {users.length === 0 ? (
          <Text style={styles.emptyText}>No users found.</Text>
        ) : (
          <ScrollView style={styles.usersScroll} contentContainerStyle={styles.usersScrollContent}>
            {users.map(user => (
              <View key={user.id} style={styles.userCard}>
                <Text style={styles.userName}>{user.full_name || 'N/A'}</Text>
                <Text style={styles.userEmail}>{user.email || 'N/A'}</Text>
                <Text style={styles.userGender}>Gender: {user.gender || 'N/A'}</Text>
                <Text style={styles.userDeptYearBlock}>
                  Year Level: {user.year_level || 'N/A'}, Block: {user.block || 'N/A'}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  const renderProjectsView = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setCurrentView('analytics')}>
            <Ionicons name="arrow-back" size={24} color="#35359e" />
          </TouchableOpacity>
          <Text style={styles.viewTitle}>
            {currentView === 'uploads' ? 'All Projects' : 
             currentView === 'pending' ? 'Pending Projects' :
             currentView === 'approved' ? 'Approved Projects' :
             'Rejected Projects'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        {viewLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#35359e" />
            <Text>Loading projects...</Text>
          </View>
        ) : projects.length === 0 ? (
          <Text style={styles.emptyText}>No projects found.</Text>
        ) : (
          <View style={styles.projectsContainer}>
            {projects.map(project => (
              <PostCard
                key={project.id}
                project={project}
                currentUserId={null} // Admin view, no current user
                onLike={() => {}} // Disable like functionality in admin view
                onBookmark={() => {}} // Disable bookmark functionality in admin view
                onComment={() => {}} // Disable comment functionality in admin view
                onShare={() => {}} // Disable share functionality in admin view
                onMenu={() => {}} // Disable menu functionality in admin view
                onProfile={() => {}} // Disable profile navigation in admin view
                onPdf={() => project.pdf_url && Linking.openURL(project.pdf_url)} // Enable PDF viewing
                hideEdit={true} // Hide edit options
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <>
      {currentView === 'analytics' && renderAnalyticsView()}
      {currentView === 'users' && renderUsersView()}
      {(currentView === 'uploads' || currentView === 'pending' || currentView === 'approved' || currentView === 'rejected') && renderProjectsView()}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  headerSafeArea: {
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      android: { paddingTop: StatusBar.currentHeight || 0 },
      ios: {},
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#23235b',
  },
  refreshBtn: {
    padding: 8,
  },
  analyticsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#35359e',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  analyticsItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#23235b',
    marginTop: 2,
  },
  analyticsLabel: {
    fontSize: 13,
    color: '#888',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  statusItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#23235b',
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 13,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#35359e',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#23235b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 15,
    color: '#35359e',
    marginBottom: 2,
  },
  userGender: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  userDeptYearBlock: {
    fontSize: 14,
    color: '#888',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  usersScroll: {
    maxHeight: 350,
    marginBottom: 20,
  },
  usersScrollContent: {
    paddingBottom: 10,
  },
  mostLikedContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    maxHeight: 400, // Limit height for scrollability
  },
  mostLikedScroll: {
    flex: 1,
  },
  mostLikedScrollContent: {
    paddingBottom: 10,
  },
  emptyProjectContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyProjectText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  emptyProjectSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  viewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#23235b',
  },
  projectsContainer: {
    marginTop: 10,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#35359e',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 