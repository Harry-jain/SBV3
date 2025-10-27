# SyncBoard Deployment Checklist

## Pre-Deployment

### Code Preparation
- [ ] All code is committed to GitHub
- [ ] No sensitive data in code (check `.env.example`)
- [ ] All dependencies are in `package.json`
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] No console.log statements left in production code

### Supabase Setup
- [ ] Supabase project created
- [ ] Database migrations run:
  - [ ] `scripts/001_create_tables.sql` executed
  - [ ] `scripts/002_create_profile_trigger.sql` executed
- [ ] Row Level Security (RLS) policies verified
- [ ] Real-time enabled for tables:
  - [ ] `rooms`
  - [ ] `room_members`
  - [ ] `messages`
- [ ] Supabase project URL noted
- [ ] Supabase anon key noted

### Vercel Setup
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project created in Vercel dashboard

## Deployment Steps

### 1. Environment Variables in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` set to Vercel domain

### 2. Deploy to Vercel
- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for build to complete
- [ ] Verify no build errors
- [ ] Check deployment logs

### 3. Post-Deployment Configuration

#### Supabase Auth Settings
- [ ] Go to Supabase Dashboard
- [ ] Navigate to Authentication → URL Configuration
- [ ] Add redirect URLs:
  - [ ] `https://your-project.vercel.app/auth/callback`
  - [ ] `https://your-project.vercel.app/dashboard`
  - [ ] `https://your-project.vercel.app/`

#### Enable Real-time
- [ ] Go to Supabase Dashboard
- [ ] Navigate to Replication
- [ ] Enable real-time for:
  - [ ] `rooms` table
  - [ ] `room_members` table
  - [ ] `messages` table

## Testing

### Authentication Flow
- [ ] Visit deployed app
- [ ] Sign up with new email
- [ ] Confirm email
- [ ] Log in successfully
- [ ] Log out successfully
- [ ] Try invalid credentials (should fail)

### Dashboard Features
- [ ] Create a new room
- [ ] View room in dashboard
- [ ] Edit room details
- [ ] Delete room

### Editor Features
- [ ] Open a room
- [ ] Edit code
- [ ] See code changes persist
- [ ] Send chat message
- [ ] See chat message appear

### Real-time Features
- [ ] Open same room in two browser tabs
- [ ] Edit code in one tab
- [ ] Verify code updates in other tab
- [ ] Send message in one tab
- [ ] Verify message appears in other tab

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Code editor is responsive
- [ ] Chat messages send quickly
- [ ] No console errors

## Monitoring

### Vercel Dashboard
- [ ] Check deployment status
- [ ] Monitor function execution time
- [ ] Check error rate
- [ ] Review analytics

### Supabase Dashboard
- [ ] Check database connections
- [ ] Monitor query performance
- [ ] Review real-time connections
- [ ] Check storage usage

## Troubleshooting

### If Build Fails
1. [ ] Check build logs in Vercel
2. [ ] Verify all environment variables are set
3. [ ] Check for TypeScript errors
4. [ ] Verify all dependencies are installed

### If Authentication Fails
1. [ ] Verify Supabase credentials
2. [ ] Check email is confirmed
3. [ ] Verify redirect URLs in Supabase
4. [ ] Check browser console for errors

### If Real-time Doesn't Work
1. [ ] Verify real-time is enabled in Supabase
2. [ ] Check WebSocket connection in browser DevTools
3. [ ] Verify user is authenticated
4. [ ] Check Supabase logs

## Post-Deployment

### Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (optional)
- [ ] Configure email notifications

### Backup Strategy
- [ ] Enable Supabase backups
- [ ] Test backup restoration
- [ ] Document backup procedure

### Security Review
- [ ] Verify HTTPS is enabled
- [ ] Check RLS policies are correct
- [ ] Review environment variables
- [ ] Verify no sensitive data in logs

### Documentation
- [ ] Update README with live URL
- [ ] Document any custom configurations
- [ ] Create user guide for team members

## Rollback Plan

If deployment has critical issues:

1. [ ] Identify the issue
2. [ ] Revert to previous deployment in Vercel
3. [ ] Or redeploy from previous commit
4. [ ] Notify team members
5. [ ] Document the issue

## Success Criteria

- [ ] App is live and accessible
- [ ] All authentication flows work
- [ ] Real-time features are functional
- [ ] No critical errors in logs
- [ ] Performance is acceptable
- [ ] Team can create and join rooms
- [ ] Code editing works in real-time
- [ ] Chat functionality works

## Next Steps

After successful deployment:

1. Share the live URL with team
2. Create user accounts for team members
3. Test collaborative features with team
4. Gather feedback
5. Plan future improvements
