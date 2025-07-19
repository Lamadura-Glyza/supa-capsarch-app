-- Create the projects table (simplified version)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  source_code TEXT NOT NULL,
  video_link TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Allow all users to view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 