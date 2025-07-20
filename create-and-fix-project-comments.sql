-- Create and Fix project_comments Table

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_comments (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add foreign key to user_profiles.user_id for profile joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_project_comments_user'
      AND table_name = 'project_comments'
  ) THEN
    ALTER TABLE project_comments
    ADD CONSTRAINT fk_project_comments_user
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at);

-- 4. Enable Row Level Security
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY IF NOT EXISTS "Users can read all project comments" ON project_comments
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own project comments" ON project_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own project comments" ON project_comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own project comments" ON project_comments
FOR DELETE USING (auth.uid() = user_id);

-- 6. Verification
SELECT 'project_comments table and constraints' as info;
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'project_comments';

SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'project_comments'; 