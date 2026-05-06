-- ============================================================
-- NeoChat Supabase Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- 1. Create tables
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast pagination queries
CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON messages(chat_id, id DESC);

-- 2. Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Allow full anonymous access (public chat app)
CREATE POLICY "allow_all_chats" ON chats
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_messages" ON messages
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. Enable Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 5. Create public image storage bucket
INSERT INTO storage.buckets (id, name, public)
  VALUES ('chat-images', 'chat-images', true)
  ON CONFLICT (id) DO NOTHING;

-- 6. Allow anon users to upload and read images
CREATE POLICY "allow_public_upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "allow_public_read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'chat-images');
