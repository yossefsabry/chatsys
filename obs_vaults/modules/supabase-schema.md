# Supabase Schema

Purpose: Explain the Supabase database, Realtime, and storage setup.

Related: [[Home]], [[Data Model]], [[Deployment]], [[apis/supabase-storage]]

## What It Does

`supabase/schema.sql` prepares Supabase for the serverless runtime path.

## Database Objects

- Creates `chats` with UUID primary keys.
- Creates `messages` with identity IDs and a foreign key to `chats`.
- Adds `messages_chat_id_idx` for chat-specific pagination queries.

## Security And Realtime

- Enables RLS on `chats` and `messages`.
- Allows anonymous users full access to both tables.
- Adds `messages` to the `supabase_realtime` publication.

## Storage

The schema creates a public `chat-images` bucket and policies for anonymous insert and read access.
