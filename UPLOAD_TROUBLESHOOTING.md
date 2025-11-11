# Upload Troubleshooting Guide

If you're experiencing "Failed to upload" errors, follow these steps to diagnose and fix the issue.

## Quick Checks

### 1. Verify Storage Bucket Exists
1. Go to Supabase Dashboard → **Storage**
2. Check if bucket `interview-videos` exists
3. If it doesn't exist:
   - Click **New bucket**
   - Name: `interview-videos`
   - Make it **Public** (important!)
   - Click **Create bucket**

### 2. Update Storage Policies
The storage policies have been updated in `supabase-setup.sql`. You need to run the updated policies:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the storage policies section from `supabase-setup.sql` (lines 79-131)

Or run this SQL directly:

```sql
-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'interview-videos' AND
    auth.role() = 'authenticated' AND
    split_part(name, '/', 1) = 'interviews' AND
    split_part(name, '/', 2) = auth.uid()::text
  );

-- Allow anyone to read videos
CREATE POLICY "Anyone can read videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'interview-videos');

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'interview-videos' AND
    auth.role() = 'authenticated' AND
    split_part(name, '/', 1) = 'interviews' AND
    split_part(name, '/', 2) = auth.uid()::text
  );

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'interview-videos' AND
    auth.role() = 'authenticated' AND
    split_part(name, '/', 1) = 'interviews' AND
    split_part(name, '/', 2) = auth.uid()::text
  );
```

### 3. Verify RLS is Enabled on Storage
1. Go to Supabase Dashboard → **Storage** → **Policies**
2. Make sure Row Level Security (RLS) is enabled for the `interview-videos` bucket
3. Verify the policies are applied (you should see 4 policies)

### 4. Check Authentication
1. Make sure you're logged in to the application
2. Check browser console for authentication errors
3. Try logging out and logging back in

### 5. Check Browser Console
Open browser developer tools (F12) and check the Console tab for detailed error messages. The updated code now provides more specific error messages.

## Common Error Messages and Solutions

### "Storage bucket not found"
- **Solution**: Create the `interview-videos` bucket in Supabase Dashboard → Storage

### "Upload denied by security policy"
- **Solution**: Run the updated storage policies SQL (see step 2 above)

### "Authentication failed"
- **Solution**: Log out and log back in

### "Session expired"
- **Solution**: Refresh the page and log in again

### "Cannot access storage"
- **Solution**: Check your Supabase environment variables in `.env` file

## Verify Your Setup

Run this in your browser console (while logged in) to test storage access:

```javascript
// Check if you can list buckets (might require admin, but worth trying)
const { data, error } = await supabase.storage.listBuckets()
console.log('Buckets:', data, 'Error:', error)

// Try to upload a test file (replace with your actual user ID)
const testBlob = new Blob(['test'], { type: 'text/plain' })
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('interview-videos')
  .upload(`interviews/YOUR_USER_ID/test.txt`, testBlob)
console.log('Upload test:', uploadData, 'Error:', uploadError)
```

## Still Having Issues?

1. Check the browser console for the exact error message
2. Verify all steps above are completed
3. Make sure your Supabase project is active and not paused
4. Check your Supabase project limits (storage quota, etc.)
5. Verify your `.env` file has correct Supabase credentials

## Recent Changes

The upload code has been updated to:
- Provide more detailed error messages
- Verify authentication before uploading
- Handle file deletion for re-recording
- Better error handling and logging

Make sure you've pulled the latest code and restarted your development server.

