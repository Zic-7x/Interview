# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Follow the detailed instructions in `SUPABASE_SETUP.md`
3. Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 3. Configure Admin Emails

Edit `src/constants/adminEmails.js` and add your admin email(s):

```javascript
export const ADMIN_EMAILS = [
  'your-admin-email@example.com',
]
```

## 4. Set Up Admin User in Database

After signing up with an admin email:

1. Go to Supabase Dashboard → Authentication → Users
2. Find your user and copy the User UID
3. Run this SQL in the SQL Editor:

```sql
INSERT INTO admins (user_id, email)
VALUES ('YOUR_USER_UID_HERE', 'your-admin-email@example.com');
```

## 5. Start Development Server

```bash
npm run dev
```

## 6. Test the Application

1. Open the application in your browser
2. Sign up with a test account
3. Complete the interview (20 questions)
4. Log in with an admin account and go to `/admin` to review responses

## Troubleshooting

- **Videos not uploading**: Check that the storage bucket `interview-videos` is created and public
- **Database errors**: Verify that all SQL from `SUPABASE_SETUP.md` has been executed
- **Admin access denied**: Make sure you've added your email to `ADMIN_EMAILS` and inserted your user into the `admins` table
- **Camera not working**: Ensure you've granted camera and microphone permissions in your browser

For more details, see `SUPABASE_SETUP.md` and `README.md`.

