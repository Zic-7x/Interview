/**
 * Supabase Setup Helper Script
 * 
 * This script helps verify your Supabase setup.
 * Run with: node setup-supabase.js
 * 
 * Note: This requires @supabase/supabase-js to be installed
 * Install with: npm install @supabase/supabase-js dotenv
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSetup() {
  console.log('🔍 Checking Supabase setup...\n')

  // Check database tables
  console.log('1. Checking database tables...')
  try {
    const { data, error } = await supabase
      .from('interview_responses')
      .select('id')
      .limit(1)

    if (error) {
      console.log('   ❌ interview_responses table not found or not accessible')
      console.log('   💡 Run the SQL from supabase-setup.sql in your Supabase SQL Editor')
    } else {
      console.log('   ✅ interview_responses table exists')
    }
  } catch (error) {
    console.log('   ❌ Error checking interview_responses table:', error.message)
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .limit(1)

    if (error) {
      console.log('   ❌ admins table not found or not accessible')
      console.log('   💡 Run the SQL from supabase-setup.sql in your Supabase SQL Editor')
    } else {
      console.log('   ✅ admins table exists')
    }
  } catch (error) {
    console.log('   ❌ Error checking admins table:', error.message)
  }

  // Check storage bucket
  console.log('\n2. Checking storage bucket...')
  try {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.log('   ❌ Error accessing storage:', error.message)
    } else {
      const bucket = data.find(b => b.name === 'interview-videos')
      if (bucket) {
        console.log('   ✅ interview-videos bucket exists')
        console.log('   📦 Bucket is', bucket.public ? 'public' : 'private')
        if (!bucket.public) {
          console.log('   ⚠️  Warning: Bucket should be public for video access')
        }
      } else {
        console.log('   ❌ interview-videos bucket not found')
        console.log('   💡 Create the bucket in Supabase Dashboard → Storage')
        console.log('   💡 Make it public and name it "interview-videos"')
      }
    }
  } catch (error) {
    console.log('   ❌ Error checking storage:', error.message)
  }

  // Check authentication
  console.log('\n3. Checking authentication...')
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('   ✅ Authenticated as:', user.email)
    } else {
      console.log('   ℹ️  Not authenticated (this is normal if you haven\'t logged in)')
    }
  } catch (error) {
    console.log('   ❌ Error checking auth:', error.message)
  }

  console.log('\n✅ Setup check complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Run the SQL from supabase-setup.sql in Supabase SQL Editor')
  console.log('   2. Create the "interview-videos" storage bucket (public)')
  console.log('   3. Run the storage policies SQL from supabase-setup.sql')
  console.log('   4. Add admin users to the admins table')
  console.log('   5. Start the app with: npm run dev')
}

checkSetup().catch(console.error)

