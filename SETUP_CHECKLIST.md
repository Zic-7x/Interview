# Supabase Setup Checklist

## ✅ Completed Automatically

- [x] Environment variables configured in `.env`
- [x] SQL setup script created (`supabase-setup.sql`)
- [x] Verification script created (`setup-supabase.js`)
- [x] Package.json updated with setup:check command

## 📋 Manual Steps Required

### Step 1: Run Database Setup SQL
- [ ] Open Supabase Dashboard: https://supabase.com/dashboard/project/tbhmyxbdgenxvhbotgwv
- [ ] Go to SQL Editor
- [ ] Copy and paste contents of `supabase-setup.sql`
- [ ] Click Run
- [ ] Verify no errors

### Step 2: Create Storage Bucket
- [ ] Go to Storage in Supabase Dashboard
- [ ] Click "New bucket"
- [ ] Name: `interview-videos`
- [ ] Make it **Public** (toggle switch)
- [ ] Click "Create bucket"

### Step 3: Install Dependencies
- [ ] Run: `npm install`

### Step 4: Verify Setup
- [ ] Run: `npm run setup:check`
- [ ] Verify all checks pass

### Step 5: Configure Admin Emails
- [ ] Edit `src/constants/adminEmails.js`
- [ ] Add your admin email(s)

### Step 6: Add Admin User to Database
- [ ] Sign up with an admin email in the app
- [ ] Go to Supabase Dashboard → Authentication → Users
- [ ] Find your user and copy the User UID
- [ ] Run this SQL in SQL Editor:

```sql
INSERT INTO admins (user_id, email)
VALUES ('YOUR_USER_UID_HERE', 'your-admin-email@example.com');
```

### Step 7: Test the Application
- [ ] Run: `npm run dev`
- [ ] Sign up with a test account
- [ ] Complete the interview
- [ ] Log in as admin and go to `/admin`
- [ ] Verify you can see the completed interview

## 🎉 Done!

Your video interview system should now be fully operational!

## ❓ Need Help?

- Check `SETUP_INSTRUCTIONS.md` for detailed steps
- Check `SUPABASE_SETUP.md` for troubleshooting
- Run `npm run setup:check` to verify setup

