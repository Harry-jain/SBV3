# SyncBoard - Collaborative IDE

A real-time collaborative IDE built with Next.js, Supabase, and shadcn/ui. Deploy instantly to Vercel with zero infrastructure management.

## Features

- **Real-time Code Editing** - Edit code together with instant synchronization
- **Supabase Authentication** - Secure email/password authentication with JWT tokens
- **Room-based Collaboration** - Create and join collaborative coding sessions
- **User Presence** - See active members in real-time
- **Live Chat** - Communicate with team members in the editor
- **Dark Theme UI** - Professional dark-themed interface with shadcn/ui components
- **Vercel Deployment** - Deploy in seconds with automatic scaling

## Architecture

### Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time API)
- **Authentication**: Supabase Auth with JWT
- **Real-time**: Supabase Real-time Subscriptions
- **Deployment**: Vercel (serverless)

### Database Schema

- **profiles** - User profiles with display names
- **rooms** - Collaborative coding sessions
- **room_members** - Room membership tracking
- **messages** - Chat messages with timestamps

All tables have Row Level Security (RLS) enabled for data protection.

## Quick Start

### Prerequisites

- Node.js 20+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create `.env.local` with Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`

4. Run database migrations in Supabase SQL Editor:
   - Copy and run `scripts/001_create_tables.sql`
   - Copy and run `scripts/002_create_profile_trigger.sql`

5. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open http://localhost:3000

### Vercel Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for step-by-step deployment instructions.

Quick deploy:
1. Push code to GitHub
2. Import repository in Vercel
3. Add Supabase environment variables
4. Deploy

## Project Structure

\`\`\`
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── auth/
│   ├── login/page.tsx      # Login page
│   ├── sign-up/page.tsx    # Sign up page
│   └── sign-up-success/    # Confirmation page
├── dashboard/page.tsx      # Room management
└── editor/[roomId]/
    ├── page.tsx            # Code editor
    └── layout.tsx          # Editor layout

components/
├── code-editor.tsx         # Code editor component
├── chat-panel.tsx          # Chat component
└── ui/                     # shadcn/ui components

lib/
└── supabase/
    ├── client.ts           # Browser client
    ├── server.ts           # Server client
    └── middleware.ts       # Auth middleware

scripts/
├── 001_create_tables.sql   # Database schema
└── 002_create_profile_trigger.sql  # Auto-create profiles
\`\`\`

## Usage

### Create a Room

1. Sign up or log in
2. Go to Dashboard
3. Enter room name, description, and language
4. Click "Create Room"

### Join a Room

1. Click "Open" on any room in your dashboard
2. Start editing code in real-time
3. Use chat to communicate with team members
4. Click "Save" to persist changes

### Share a Room

1. Click "Share" button in the editor
2. Copy the room link
3. Send to team members
4. They can join and collaborate

## API Routes

### Authentication

- `POST /api/auth/callback` - Supabase auth callback

### Real-time

All real-time features use Supabase subscriptions:
- Code updates
- Member presence
- Chat messages

## Environment Variables

Required for deployment:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL  # Auth redirect URL
\`\`\`

## Security

- Row Level Security (RLS) enabled on all tables
- Email verification required for signup
- JWT token-based authentication
- Secure password hashing with bcrypt
- HTTPS enforced in production

## Performance

- Optimized for Vercel's serverless platform
- Automatic code splitting and lazy loading
- Real-time subscriptions with efficient polling
- Database query optimization with indexes

## Troubleshooting

### Authentication Issues

- Verify Supabase credentials in environment variables
- Check email confirmation is working
- Clear browser cookies and try again

### Real-time Not Working

- Verify real-time is enabled in Supabase
- Check browser WebSocket connection
- Ensure user is authenticated

### Build Errors

- Check all environment variables are set
- Verify Node.js version is 20+
- Clear `.next` folder and rebuild

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for deployment help
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for local setup
- Open an issue on GitHub
