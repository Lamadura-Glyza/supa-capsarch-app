-- Cleanup and Fix Notifications Database
-- This script removes any partially created tables and recreates them correctly

-- ===========================================
-- 1. CLEANUP EXISTING TABLES (IF ANY)
-- ===========================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS project_likes CASCADE;
DROP TABLE IF EXISTS project_bookmarks CASCADE;

-- ===========================================
-- 2. CHECK PROJECTS TABLE STRUCTURE
-- ===========================================

-- Verify the projects table structure
SELECT 'Projects table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'id';

-- ===========================================
-- 3. CREATE NOTIFICATIONS TABLE (CORRECTED)
-- ===========================================

-- Create notifications table with UUID for project_id
CREATE TABLE notifications (
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
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ===========================================
-- 4. CREATE PROJECT LIKES TABLE (CORRECTED)
-- ===========================================

-- Create project_likes table with UUID for project_id
CREATE TABLE project_likes (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create indexes for project_likes
CREATE INDEX idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX idx_project_likes_user_id ON project_likes(user_id);

-- ===========================================
-- 5. CREATE PROJECT BOOKMARKS TABLE (CORRECTED)
-- ===========================================

-- Create project_bookmarks table with UUID for project_id
CREATE TABLE project_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create indexes for project_bookmarks
CREATE INDEX idx_project_bookmarks_project_id ON project_bookmarks(project_id);
CREATE INDEX idx_project_bookmarks_user_id ON project_bookmarks(user_id);

-- ===========================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bookmarks ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 7. CREATE RLS POLICIES
-- ===========================================

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can insert notifications" ON notifications
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Project likes policies
CREATE POLICY "Users can read all project likes" ON project_likes
FOR SELECT USING (true);

CREATE POLICY "Users can insert own project likes" ON project_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own project likes" ON project_likes
FOR DELETE USING (auth.uid() = user_id);

-- Project bookmarks policies
CREATE POLICY "Users can read own project bookmarks" ON project_bookmarks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project bookmarks" ON project_bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own project bookmarks" ON project_bookmarks
FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- 8. VERIFICATION
-- ===========================================

-- Check tables were created
SELECT 'Tables created successfully:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('notifications', 'project_likes', 'project_bookmarks')
ORDER BY table_name;

-- Check data types
SELECT 'Data types verification:' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('notifications', 'project_likes', 'project_bookmarks')
    AND column_name IN ('project_id', 'user_id', 'recipient_id', 'sender_id')
ORDER BY table_name, column_name;

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

-- Check RLS policies
SELECT 'RLS policies created:' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('notifications', 'project_likes', 'project_bookmarks')
ORDER BY tablename, policyname; 