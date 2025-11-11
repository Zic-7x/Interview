-- ============================================
-- Supabase Setup SQL Script
-- Video Interview System
-- ============================================

-- 1. Create the interview_responses table
CREATE TABLE IF NOT EXISTS interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_number)
);

-- 2. Create the admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_responses_user_id ON interview_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_question_number ON interview_responses(question_number);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- 4. Enable Row Level Security
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can insert their own responses" ON interview_responses;
DROP POLICY IF EXISTS "Users can read their own responses" ON interview_responses;
DROP POLICY IF EXISTS "Admins can read all responses" ON interview_responses;
DROP POLICY IF EXISTS "Users can read their own admin status" ON admins;
DROP POLICY IF EXISTS "Admins can read all admin records" ON admins;

-- 6. Create RLS policies for interview_responses
CREATE POLICY "Users can insert their own responses"
  ON interview_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own responses"
  ON interview_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all responses"
  ON interview_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- 7. Create RLS policies for admins table
CREATE POLICY "Users can read their own admin status"
  ON admins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all admin records"
  ON admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  );

-- ============================================
-- Storage Policies
-- Note: Run these after creating the storage bucket
-- ============================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Allow authenticated users to upload videos to their own folder
-- Path structure: interviews/{user_id}/{question_number}.webm
-- storage.foldername returns: [1]='interviews', [2]='user_id', etc.
CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'interview-videos' AND
    (storage.foldername(name))[1] = 'interviews' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow anyone to read videos (since bucket is public)
CREATE POLICY "Anyone can read videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'interview-videos');

-- Allow users to update their own videos
-- Path structure: interviews/{user_id}/{question_number}.webm
CREATE POLICY "Users can update their own videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'interview-videos' AND
    (storage.foldername(name))[1] = 'interviews' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to delete their own videos (optional)
-- Path structure: interviews/{user_id}/{question_number}.webm
CREATE POLICY "Users can delete their own videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'interview-videos' AND
    (storage.foldername(name))[1] = 'interviews' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

