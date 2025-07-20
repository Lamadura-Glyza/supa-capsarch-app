-- Project Comments Table Setup
-- This script creates the project_comments table for storing comments on projects

CREATE TABLE IF NOT EXISTS project_comments (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at);

-- Enable Row Level Security
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all comments
CREATE POLICY "Users can read all project comments" ON project_comments
FOR SELECT USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert own project comments" ON project_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own project comments" ON project_comments
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own project comments" ON project_comments
FOR DELETE USING (auth.uid() = user_id);

-- Verification
SELECT 'project_comments table created' as info;
SELECT * FROM information_schema.columns WHERE table_name = 'project_comments'; 