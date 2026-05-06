# Supabase Storage

Purpose: Document image storage behavior for the Supabase runtime path.

Related: [[Home]], [[flows/image-upload]], [[modules/supabase-schema]], [[Configuration]]

## Bucket

`supabase/schema.sql` creates a public bucket named `chat-images`.

## Upload Interface

`client/src/ChatRoom.jsx` uploads the selected image to `chat-images` using a path shaped like `<chatId>/<timestamp>.<extension>`.

## Read Interface

The client calls `getPublicUrl()` and stores the resulting URL as `messages.content` for image messages.

## Policies

The schema allows anonymous inserts and anonymous reads for objects in `chat-images`.
