# Fix for "Infinite Recursion Detected in Policy for Relations Admins" Error

## Problem
The error "failed to save response: infinite recursion detected in policy for relations admins" occurs because:

1. When inserting into `interview_responses`, Supabase checks all RLS policies
2. The "Admins can read all responses" policy queries the `admins` table
3. The `admins` table has RLS enabled with a policy that queries itself
4. This creates infinite recursion

## Solution
We need to use a **security definer function** that bypasses RLS to check admin status without causing recursion.

## Quick Fix

### Option 1: Run the Complete Fix (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Open the file `fix-all-policies.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**

This will:
- ✅ Fix the recursive RLS policies
- ✅ Fix/update storage policies
- ✅ Create a helper function to check admin status safely

### Option 2: Fix Only the Recursion Issue
1. Go to Supabase Dashboard → SQL Editor
2. Open the file `fix-recursive-policy.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**

Then separately run `storage-policies.sql` if needed.

## What the Fix Does

1. **Creates a security definer function** `public.is_admin(user_uuid UUID)`:
   - This function bypasses RLS when checking admin status
   - Prevents infinite recursion
   - Can be safely used in RLS policies

2. **Updates RLS policies** to use the function:
   - "Admins can read all responses" now uses `public.is_admin(auth.uid())`
   - "Admins can read all admin records" now uses `public.is_admin(auth.uid())`
   - "Users can read their own admin status" remains unchanged (no recursion)

## Verification

After running the fix, test by:
1. Recording and uploading a video in the interview app
2. The upload should succeed without the recursion error

## Files Created

- `fix-recursive-policy.sql` - Fixes only the recursion issue
- `fix-all-policies.sql` - Fixes recursion + updates storage policies (recommended)

## Technical Details

The issue was in `supabase-setup.sql`:
- Line 69-77: "Admins can read all admin records" policy had `EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())`
- This query triggers RLS on the `admins` table, which then queries itself again → infinite loop

The fix uses `SECURITY DEFINER` which runs with the privileges of the function creator (bypassing RLS), breaking the recursion cycle.

