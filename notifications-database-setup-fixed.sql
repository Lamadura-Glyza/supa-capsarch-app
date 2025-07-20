-- Notifications Database Setup (FIXED)
-- This script creates the necessary tables for the notifications system
-- Fixed data type mismatch between project_id and projects.id

-- ===========================================
-- 1. CHECK PROJECTS TABLE STRUCTURE
-- ===========================================

-- First, let's check the projects table structure
SELECT 'Projects table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'id';

-- ===========================================
-- 2. NOTIFICATIONS TABLE (FIXED)
-- ===========================================

-- Create notifications table with correct data types
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'bookmark')),
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ===========================================
-- 3. PROJECT LIKES TABLE (FIXED)
-- ===========================================

-- Create project_likes table with correct data types
CREATE TABLE IF NOT EXISTS project_likes (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create indexes for project_likes
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON project_likes(user_id);

-- ===========================================
-- 4. PROJECT BOOKMARKS TABLE (FIXED)
-- ===========================================

-- Create project_bookmarks table with correct data types
CREATE TABLE IF NOT EXISTS project_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create indexes for project_bookmarks
CREATE INDEX IF NOT EXISTS idx_project_bookmarks_project_id ON project_bookmarks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_bookmarks_user_id ON project_bookmarks(user_id);

-- ===========================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bookmarks ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 6. RLS POLICIES FOR NOTIFICATIONS
-- ===========================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
FOR SELECT USING (auth.uid() = recipient_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE USING (auth.uid() = recipient_id);

-- Users can insert notifications (for creating notifications for others)
CREATE POLICY "Users can insert notifications" ON notifications
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ===========================================
-- 7. RLS POLICIES FOR PROJECT LIKES
-- ===========================================

-- Users can read all likes
CREATE POLICY "Users can read all project likes" ON project_likes
FOR SELECT USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert own project likes" ON project_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own project likes" ON project_likes
FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- 8. RLS POLICIES FOR PROJECT BOOKMARKS
-- ===========================================

-- Users can read their own bookmarks
CREATE POLICY "Users can read own project bookmarks" ON project_bookmarks
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert own project bookmarks" ON project_bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own project bookmarks" ON project_bookmarks
FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- 9. VERIFICATION QUERIES
-- ===========================================

-- Check if tables were created
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('notifications', 'project_likes', 'project_bookmarks')
ORDER BY table_name;

-- Check RLS status
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('notifications', 'project_likes', 'project_bookmarks')
ORDER BY tablename;

-- Check policies
SELECT 'Policies created:' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('notifications', 'project_likes', 'project_bookmarks')
ORDER BY tablename, policyname;

-- Check foreign key constraints
SELECT 'Foreign key constraints:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('notifications', 'project_likes', 'project_bookmarks'); 