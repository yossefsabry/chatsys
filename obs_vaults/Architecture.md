# Architecture

Purpose: Explain the high-level components and data flow for NeoChat.

Related: [[Home]], [[Project Map]], [[Data Model]], [[Integrations]]

## What It Is

NeoChat is a browser chat workspace app. Users create a workspace, share its URL, join by workspace ID, exchange text messages, search history, and upload images.

## Primary Runtime Path

The current client code uses Supabase directly from the browser.

- `client/src/LandingPage.jsx` inserts or checks `chats` rows.
- `client/src/ChatRoom.jsx` reads and writes `messages` rows.
- `client/src/ChatRoom.jsx` subscribes to Supabase Realtime inserts on `messages`.
- `client/src/ChatRoom.jsx` uploads images to Supabase Storage bucket `chat-images`.
- `supabase/schema.sql` defines the database, storage bucket, RLS policies, and Realtime publication.

## Local Server Runtime Path

The repo also contains a local Node server path.

- `server/index.js` exposes REST endpoints under `/api/chats`.
- `server/index.js` exposes Socket.IO events for room join and message broadcast.
- `server/db.js` stores local state in SQLite at `server/chat.db`.
- `start.sh` starts `node server/index.js` and `npm run dev` in `client/`.

## Boundaries

- The React client owns routing, UI state, pagination, search UI, image previews, and browser persistence of `senderId`.
- Supabase owns deployed database persistence, Realtime fanout, and image storage.
- The local Express server owns local API, Socket.IO fanout, and local uploaded image storage when that runtime path is used.

## Important Ambiguity

`DEPLOY.md` says the deployment branch uses no Express server or Socket.IO, while `start.sh` and `server/` still document and implement a local backend. The client currently imports `client/src/lib/supabase.js`, not the local REST or Socket.IO APIs.
