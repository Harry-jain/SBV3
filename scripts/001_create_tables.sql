-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create rooms table for collaborative sessions
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT DEFAULT '',
  language TEXT DEFAULT 'javascript',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create room members table
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(room_id, user_id)
);

-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Rooms RLS Policies
CREATE POLICY "Users can view public rooms"
  ON public.rooms FOR SELECT
  USING (is_public = TRUE OR owner_id = auth.uid() OR id IN (
    SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Room owners can update their rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Room owners can delete their rooms"
  ON public.rooms FOR DELETE
  USING (auth.uid() = owner_id);

-- Room Members RLS Policies
CREATE POLICY "Users can view room members"
  ON public.room_members FOR SELECT
  USING (room_id IN (
    SELECT id FROM public.rooms WHERE owner_id = auth.uid() OR is_public = TRUE
  ) OR user_id = auth.uid());

CREATE POLICY "Users can join rooms"
  ON public.room_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON public.room_members FOR DELETE
  USING (auth.uid() = user_id);

-- Messages RLS Policies
CREATE POLICY "Users can view messages in their rooms"
  ON public.messages FOR SELECT
  USING (room_id IN (
    SELECT id FROM public.rooms WHERE owner_id = auth.uid() OR is_public = TRUE
  ) OR room_id IN (
    SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages in their rooms"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND room_id IN (
    SELECT id FROM public.rooms WHERE owner_id = auth.uid() OR is_public = TRUE
  ) OR room_id IN (
    SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
