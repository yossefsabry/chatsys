# Chat Room

Purpose: Explain the main chat experience and state management.

Related: [[Home]], [[modules/client-app]], [[flows/realtime-messaging]], [[flows/image-upload]]

## What It Does

`client/src/ChatRoom.jsx` is the `/chat/:chatId` route. It manages message history, Supabase Realtime subscription, text sending, image upload, search, scroll position, and share-link copying.

## Important State

- `messages`: Currently loaded chronological message list.
- `senderId`: Browser-stable ID stored in `localStorage` as `neochat_sender_id`.
- `hasMore` and `loadingMore`: Pagination state for older history.
- `searchQuery`, `searchResults`, and `jumpingToMsgId`: Search and jump-to-result state.
- `uploading` and `uploadError`: Image upload state.

## Data Access

The component reads and writes `messages` through Supabase, subscribes to Postgres inserts for the current `chatId`, and uploads files through Supabase Storage.

## How It Connects

The chat room depends on [[modules/supabase-client]], the schema described in [[Data Model]], and flows documented in [[flows/realtime-messaging]] and [[flows/image-upload]].
