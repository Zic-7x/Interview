-- ============================================
-- Complete Fix for RLS and Storage Policies
-- Fixes infinite recursion error and ensures storage policies are correct
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: Fix Recursive RLS Policies
-- ============================================

-- Step 1: Create a security definer function to check admin status
-- This function bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = user_uuid
  );
$$;

-- Step 2: Drop existing recursive policies
DROP POLICY IF EXISTS "Admins can read all responses" ON interview_responses;
DROP POLICY IF EXISTS "Admins can read all admin records" ON admins;
DROP POLICY IF EXISTS "Users can read their own admin status" ON admins;

-- Step 3: Recreate the "Admins can read all responses" policy using the function
CREATE POLICY "Admins can read all responses"
  ON interview_responses
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Step 4: Recreate admin table policies without recursion
-- Users can read their own admin status
CREATE POLICY "Users can read their own admin status"
  ON admins
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all admin records using the function
CREATE POLICY "Admins can read all admin records"
  ON admins
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- PART 2: Fix Storage Policies
-- ============================================

-- Step 1: Drop existing storage policies (if they exist)
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
-- Verification Queries (optional)
-- ============================================
-- Test the function (replace 'USER_UUID_HERE' with an actual UUID):
-- SELECT public.is_admin('USER_UUID_HERE');

-- Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('interview_responses', 'admins');

-- Check storage policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

