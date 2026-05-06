# Supabase Tables

Purpose: Document the browser-facing Supabase table interface.

Related: [[Home]], [[Data Model]], [[modules/supabase-schema]], [[flows/realtime-messaging]]

## Tables

- `chats`: Created and checked by `client/src/LandingPage.jsx`.
- `messages`: Loaded, searched, inserted, and subscribed to by `client/src/ChatRoom.jsx`.

## Client Queries

- Insert `chats` row and select the created ID.
- Select a `chats.id` by exact ID match.
- Select `messages` by `chat_id`, ordered by descending `id`, with range pagination.
- Search text messages with `ilike('content', '%query%')`.
- Insert text and image message rows.

## Realtime Interface

`ChatRoom` subscribes to inserted `messages` rows filtered by `chat_id=eq.<chatId>`.

## Policy Note

`supabase/schema.sql` currently allows anonymous users full access to `chats` and `messages`.
