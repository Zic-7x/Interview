# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be fully provisioned

## 2. Database Setup

### Create the `interview_responses` table

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create the interview_responses table
CREATE TABLE interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_number)
);

-- Create an admins table to store admin user IDs
-- This allows RLS policies to check for admin status
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX idx_interview_responses_user_id ON interview_responses(user_id);
CREATE INDEX idx_interview_responses_question_number ON interview_responses(question_number);
CREATE INDEX idx_admins_user_id ON admins(user_id);

-- Enable Row Level Security
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own responses
CREATE POLICY "Users can insert their own responses"
  ON interview_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to read their own responses
CREATE POLICY "Users can read their own responses"
  ON interview_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow admins to read all responses
CREATE POLICY "Admins can read all responses"
  ON interview_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Allow users to read if they are an admin (for checking admin status)
CREATE POLICY "Users can read their own admin status"
  ON admins
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to read all admin records (so admins can see who else is admin)
CREATE POLICY "Admins can read all admin records"
  ON admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  );
```

**Important**: After creating the tables, you need to manually insert admin users into the `admins` table:

1. Sign up or log in with an admin email (from `ADMIN_EMAILS` in your app)
2. Go to the Supabase dashboard → **Authentication** → **Users**
3. Find your user and copy their User UID
4. Run this SQL in the SQL Editor (replace `USER_UID_HERE` and `admin@example.com`):

```sql
INSERT INTO admins (user_id, email)
VALUES ('USER_UID_HERE', 'admin@example.com');
```

Repeat this for each admin email. The application code also checks `ADMIN_EMAILS` for UI access control, and the RLS policy ensures database-level security.

## 3. Storage Setup

### Create the storage bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it: `interview-videos`
4. Make it **Public** (so videos can be accessed via URL)
5. Click **Create bucket**

### Set up storage policies

Run the following SQL in the Supabase SQL Editor:

```sql
-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'interview-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone to read videos (since bucket is public)
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
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own videos (optional)
CREATE POLICY "Users can delete their own videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'interview-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**Note**: The folder structure in storage should be `interviews/{user_id}/{question_number}.webm`

## 4. Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** (this is `VITE_SUPABASE_URL`)
3. Copy your **anon/public key** (this is `VITE_SUPABASE_ANON_KEY`)

## 5. Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. Configure Admin Emails

Edit `src/constants/adminEmails.js` and add the email addresses that should have admin access:

```javascript
export const ADMIN_EMAILS = [
  'admin@example.com',
  'another-admin@example.com',
]
```

## 7. Authentication Setup

Supabase Auth is already configured by default. Email-password authentication should work out of the box.

### Optional: Configure Email Templates

1. Go to **Authentication** → **Email Templates** in your Supabase dashboard
2. Customize the email templates as needed

## 8. Test Your Setup

1. Start your development server: `npm run dev`
2. Sign up with a test account
3. Complete the interview flow
4. Check that videos are uploaded to the storage bucket
5. Check that records are created in the `interview_responses` table
6. Log in as an admin and test the admin review page

## Troubleshooting

### Videos not uploading
- Check that the storage bucket is public
- Verify storage policies are set correctly
- Check browser console for errors

### Database errors
- Verify RLS policies are set correctly
- Check that the table exists and has the correct schema
- Verify your user is authenticated

### Admin page access denied
- Verify the email in `ADMIN_EMAILS` matches your logged-in email exactly
- Check that you're logged in with the correct account

