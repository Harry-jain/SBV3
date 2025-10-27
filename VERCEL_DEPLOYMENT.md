# Deploying SyncBoard to Vercel

## Prerequisites

- GitHub account with repository
- Supabase account
- Vercel account

## Step-by-Step Guide

### 1. Prepare Your Repository

Ensure your repository has:
- `package.json` with all dependencies
- `.env.example` with required variables
- `next.config.mjs` for Next.js configuration
- All source files in `app/`, `components/`, `lib/` directories

### 2. Setup Supabase

1. Create a new Supabase project
2. Run the SQL migrations:
   - Go to SQL Editor
   - Copy and run `scripts/001_create_tables.sql`
   - Copy and run `scripts/002_create_profile_trigger.sql`
3. Note your project URL and anon key

### 3. Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL
5. Click "Import"

### 4. Configure Environment Variables

In the Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL = your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL = https://your-project.vercel.app
\`\`\`

### 5. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Post-Deployment

### Update Supabase Auth Redirect URLs

1. Go to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel domain to "Redirect URLs":
   \`\`\`
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/dashboard
   \`\`\`

### Enable Real-time

1. In Supabase, go to Replication
2. Enable real-time for tables:
   - `rooms`
   - `room_members`
   - `messages`

### Test the Deployment

1. Visit your Vercel domain
2. Sign up for a new account
3. Confirm email
4. Create a room
5. Test real-time features

## Monitoring

### Vercel Analytics

- Go to Vercel Dashboard
- Check "Analytics" for performance metrics
- Monitor function execution time

### Supabase Monitoring

- Go to Supabase Dashboard
- Check "Database" for query performance
- Monitor real-time connections

## Troubleshooting

### Build Fails

Check the build logs in Vercel:
1. Go to "Deployments"
2. Click on the failed deployment
3. Check "Build Logs" for errors

Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Authentication Not Working

1. Verify environment variables are set
2. Check Supabase project is active
3. Verify email confirmation is working
4. Check browser console for errors

### Real-time Not Working

1. Verify real-time is enabled in Supabase
2. Check browser WebSocket connection
3. Verify user is authenticated
4. Check Supabase logs

## Performance Optimization

### Caching

- Vercel automatically caches static assets
- Use `revalidate` for ISR (Incremental Static Regeneration)

### Database

- Supabase automatically optimizes queries
- Use indexes for frequently queried columns
- Monitor slow queries in Supabase dashboard

### Frontend

- Use dynamic imports for code splitting
- Optimize images with Next.js Image component
- Minimize bundle size

## Scaling

### Horizontal Scaling

Vercel automatically scales your app based on traffic.

### Database Scaling

Upgrade your Supabase plan for:
- More concurrent connections
- Higher query limits
- Better performance

## Backup and Recovery

### Database Backups

Supabase automatically backs up your database daily.

To manually backup:
1. Go to Supabase Dashboard
2. Click "Backups"
3. Click "Create Backup"

### Restore from Backup

1. Go to Supabase Dashboard
2. Click "Backups"
3. Select backup and click "Restore"

## Security Checklist

- [ ] Environment variables are set in Vercel
- [ ] Supabase RLS policies are enabled
- [ ] Email verification is required
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Database backups are configured
- [ ] Monitoring is set up
- [ ] Error logging is configured

## Support

For issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Supabase documentation: https://supabase.com/docs
3. Open an issue on GitHub
\`\`\`

```json file="" isHidden
