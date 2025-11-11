# Supabase Setup Instructions - Step by Step

## ✅ Step 1: Environment Variables (COMPLETED)
Your `.env` file has been created with your Supabase credentials.

## 📋 Step 2: Run Database Setup SQL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `tbhmyxbdgenxvhbotgwv`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase-setup.sql` from this project
6. Copy the entire contents of the file
7. Paste it into the SQL Editor
8. Click **Run** (or press Ctrl+Enter)

This will create:
- `interview_responses` table
- `admins` table
- All necessary indexes
- Row Level Security (RLS) policies
- Storage policies

## 🗂️ Step 3: Create Storage Bucket

1. In your Supabase Dashboard, click on **Storage** in the left sidebar
2. Click **New bucket**
3. Name: `interview-videos`
4. **Important**: Make it **Public** (toggle the switch)
5. Click **Create bucket**

## 🔐 Step 4: Add Admin Users

After you sign up with an admin email:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Find your user and copy the **User UID**
3. Go back to **SQL Editor**
4. Run this SQL (replace with your actual User UID and email):

```sql
INSERT INTO admins (user_id, email)
VALUES ('YOUR_USER_UID_HERE', 'your-admin-email@example.com');
```

5. Repeat for each admin email you want to add

## ✅ Step 5: Verify Setup

Run the verification script:

```bash
npm install
npm run setup:check
```

This will check if:
- Database tables exist
- Storage bucket exists
- Authentication is working

## 🚀 Step 6: Configure Admin Emails

Edit `src/constants/adminEmails.js` and add your admin email(s):

```javascript
export const ADMIN_EMAILS = [
  'your-admin-email@example.com',
]
```

## 🎉 Step 7: Start the Application

```bash
npm run dev
```

The application should now be fully configured and ready to use!

## 🧪 Testing

1. Open the application in your browser
2. Sign up with a test account
3. Complete the interview (20 questions)
4. Log in with an admin account and navigate to `/admin` to review responses

## ❓ Troubleshooting

### Database errors
- Make sure you ran the SQL from `supabase-setup.sql`
- Check that RLS policies are enabled
- Verify table names are correct

### Storage errors
- Verify the bucket name is exactly `interview-videos`
- Make sure the bucket is **public**
- Check that storage policies were created

### Admin access denied
- Make sure your email is in `ADMIN_EMAILS` in `src/constants/adminEmails.js`
- Verify you added your user to the `admins` table in the database
- Check that your User UID is correct

### Video upload fails
- Check browser console for errors
- Verify storage bucket is public
- Check that storage policies allow uploads
- Make sure you granted camera/microphone permissions

## 📝 Quick Reference

- **Supabase Project URL**: https://tbhmyxbdgenxvhbotgwv.supabase.co
- **Storage Bucket**: `interview-videos` (must be public)
- **Database Tables**: `interview_responses`, `admins`
- **Admin Route**: `/admin`

