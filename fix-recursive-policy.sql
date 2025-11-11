-- ============================================
-- Fix for Infinite Recursion in RLS Policies
-- This fixes the "infinite recursion detected in policy for relations admins" error
-- Copy and paste this entire file into Supabase SQL Editor
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
-- Verification (optional)
-- ============================================
-- Test the function (replace 'USER_UUID_HERE' with an actual UUID):
-- SELECT public.is_admin('USER_UUID_HERE');

-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('interview_responses', 'admins');

