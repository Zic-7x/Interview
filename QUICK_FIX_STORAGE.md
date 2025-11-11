# Quick Fix for Storage Upload Issues

## Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

## Step 2: Copy and Paste SQL
1. Open the file `storage-policies.sql` from this project
2. Copy ALL the content (from the file)
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

## Step 3: Verify Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Make sure bucket `interview-videos` exists
3. Make sure it's set to **Public**
4. If it doesn't exist, create it:
   - Click **New bucket**
   - Name: `interview-videos`
   - Toggle **Public bucket** to ON
   - Click **Create bucket**

## Step 4: Test Upload
1. Go back to your interview app
2. Try recording and uploading a video again
3. If you see an error message on the page, it will tell you what's wrong

## What the SQL Does
The SQL file creates 4 storage policies:
- ✅ Users can upload videos to their own folder
- ✅ Anyone can read/view videos
- ✅ Users can update their own videos
- ✅ Users can delete their own videos

## Still Having Issues?
If upload still fails after running the SQL:
1. Check the error message displayed on the page (not in console)
2. Make sure you're logged in
3. Make sure the storage bucket is public
4. Try logging out and logging back in

## File Location
The SQL file to copy is: `storage-policies.sql`

