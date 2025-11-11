# Video Interview System

A front-end only automated video interview system built with React, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Email-password authentication using Supabase Auth
- **Video Recording**: Record video responses (up to 90 seconds) using MediaRecorder API
- **Question Management**: 20 predefined interview questions
- **Progress Tracking**: Visual progress indicator and automatic question advancement
- **Admin Review**: Admin panel to review all completed interviews
- **Storage**: Automatic video upload to Supabase Storage
- **Database**: Stores interview responses with metadata

## Tech Stack

- **React 18** - UI framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Supabase** - Authentication, Storage, and Database
- **Vite** - Build tool

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd video-interview-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Configure admin emails:
   - Edit `src/constants/adminEmails.js` and add admin email addresses

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
video-interview-system/
├── src/
│   ├── components/
│   │   ├── ProgressBar.jsx      # Progress indicator component
│   │   └── Recorder.jsx         # Video recording component
│   ├── constants/
│   │   ├── adminEmails.js       # Admin email list
│   │   └── questions.js         # Interview questions
│   ├── lib/
│   │   └── supabase.js          # Supabase client initialization
│   ├── pages/
│   │   ├── AdminReview.jsx      # Admin review page
│   │   ├── Completed.jsx        # Interview completion page
│   │   ├── Interview.jsx        # Main interview page
│   │   └── Login.jsx            # Login/signup page
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── .env.example                 # Environment variables template
├── SUPABASE_SETUP.md            # Supabase setup instructions
├── package.json
└── README.md
```

## Usage

### For Interview Candidates

1. Navigate to the application
2. Sign up or log in
3. Start the interview
4. For each question:
   - Read the question
   - Click "Start Recording"
   - Record your answer (up to 90 seconds)
   - Click "Stop Recording" or wait for auto-stop
   - Wait for upload to complete
5. After all 20 questions, you'll see the completion page

### For Admins

1. Log in with an admin email (configured in `adminEmails.js`)
2. Navigate to `/admin`
3. View list of users who completed the interview
4. Select a user to view their video responses
5. Watch each response video

## Features Details

### Authentication
- Email-password authentication
- Protected routes for authenticated users
- Automatic redirect to login for unauthenticated users

### Interview Flow
- 20 predefined questions
- Progress indicator showing current question
- Video recording with 90-second limit
- Automatic upload after recording
- Auto-advance to next question
- No skipping ahead
- Resume from last completed question if interrupted

### Admin Panel
- Access restricted to configured admin emails
- List all users who completed all 20 questions
- View all video responses for each user
- Play videos directly in the browser

## Configuration

### Admin Emails
Edit `src/constants/adminEmails.js` to add or remove admin emails:

```javascript
export const ADMIN_EMAILS = [
  'admin@example.com',
  'another-admin@example.com',
]
```

### Interview Questions
Edit `src/constants/questions.js` to modify the interview questions:

```javascript
export const INTERVIEW_QUESTIONS = [
  "Question 1",
  "Question 2",
  // ... etc
]
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Security Notes

- Admin access is controlled client-side via email checking. For production, consider implementing server-side admin verification.
- Storage policies allow users to upload only to their own folder
- RLS policies protect database access
- Videos are stored in a public bucket for easy access

## Troubleshooting

See `SUPABASE_SETUP.md` for detailed troubleshooting steps.

## License

MIT

