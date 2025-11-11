# Quick Fix for Recursion Error

## The Error
```
"Upload Failed"
"failed to save response: infinite recursion detected in policy for relations admins"
```

## The Fix (2 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Fix
1. Open the file `fix-all-policies.sql` from this project
2. Copy **ALL** the content from the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

## That's It!
After running the SQL, try uploading a video again. The error should be gone.

## What Changed?
- Created a helper function that checks admin status without causing recursion
- Updated RLS policies to use this function
- Fixed storage policies

## Still Having Issues?
1. Make sure you copied the entire SQL file
2. Make sure you clicked "Run" in the SQL Editor
3. Try refreshing your browser and logging in again
4. Check that the storage bucket `interview-videos` exists and is public

