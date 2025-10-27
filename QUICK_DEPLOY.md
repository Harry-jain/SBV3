# Quick Deploy to Vercel (5 Minutes)

## Prerequisites
- GitHub account with your code pushed
- Supabase account
- Vercel account

## Step 1: Setup Supabase (2 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for project to initialize
3. Go to SQL Editor and run these two scripts:
   - Copy entire content of `scripts/001_create_tables.sql` and execute
   - Copy entire content of `scripts/002_create_profile_trigger.sql` and execute
4. Copy your project URL and anon key from Settings → API

## Step 2: Deploy to Vercel (2 minutes)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub repo URL and click Import
5. In "Environment Variables" section, add:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL = [your-supabase-url]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-supabase-anon-key]
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL = https://[your-project].vercel.app
   \`\`\`
6. Click "Deploy"
7. Wait for build to complete (usually 2-3 minutes)

## Step 3: Configure Supabase Auth (1 minute)

1. Go to Supabase Dashboard
2. Click Authentication → URL Configuration
3. Add these redirect URLs:
   - `https://[your-project].vercel.app/auth/callback`
   - `https://[your-project].vercel.app/dashboard`
   - `https://[your-project].vercel.app/`
4. Click Save

## Done! 🎉

Your app is now live at `https://[your-project].vercel.app`

### Test It
1. Visit your Vercel URL
2. Sign up with an email
3. Confirm your email
4. Create a room
5. Start collaborating!

## Troubleshooting

**Build failed?**
- Check Vercel build logs
- Verify all env vars are set
- Make sure Node.js version is 20+

**Can't sign up?**
- Check Supabase project is active
- Verify email is working
- Check browser console for errors

**Real-time not working?**
- Go to Supabase → Replication
- Enable real-time for: rooms, room_members, messages

Need more help? See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
