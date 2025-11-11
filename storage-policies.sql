-- ============================================
-- Storage Policies for Interview Videos
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Step 2: Create INSERT policy (allows users to upload videos)
CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'interview-videos' AND
    auth.role() = 'authenticated' AND
    split_part(name, '/', 1) = 'interviews' AND
    split_part(name, '/', 2) = auth.uid()::text
  );

-- Step 3: Create SELECT policy (allows anyone to read videos)
CREATE POLICY "Anyone can read videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'interview-videos');

-- Step 4: Create UPDATE policy (allows users to update their own videos)
CREATE POLICY "Users can update their own videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'interview-videos' AND
    auth.role() = 'authenticated' AND
    split_part(name, '/', 1) = 'interviews' AND
    split_part(name, '/', 2) = auth.uid()::text
  );

-- Step 5: Create DELETE policy (allows users to delete their own videos)
CREATE POLICY "Users can delete their own videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'interview-videos' AND
    auth.role() = 'authenticated' AND
    split_part(name, '/', 1) = 'interviews' AND
    split_part(name, '/', 2) = auth.uid()::text
  );

-- ============================================
-- Verification Query (optional - run this to check if policies were created)
-- ============================================
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

