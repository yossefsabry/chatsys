# Project Map

Purpose: Map the important directories and files in this repository.

Related: [[Home]], [[Architecture]], [[Development Workflow]]

## Root

- `README.md` only contains the project title.
- `DEPLOY.md` documents Vercel plus Supabase setup for the serverless deployment path.
- `package.json` is a minimal root package with only a placeholder `test` script.
- `start.sh` starts the local Express backend and Vite frontend together.
- `vercel.json` defines the Vercel build command and SPA rewrite.

## Client

- `client/package.json` defines the Vite, React, Tailwind, ESLint, Supabase, and React Router dependencies.
- `client/src/main.jsx` mounts React into `#root`.
- `client/src/App.jsx` wires routes for `/` and `/chat/:chatId`.
- `client/src/LandingPage.jsx` creates or joins workspaces through Supabase.
- `client/src/ChatRoom.jsx` loads, searches, sends, receives, and uploads chat messages.
- `client/src/lib/supabase.js` creates the Supabase client from Vite environment variables.
- `client/src/index.css` provides Tailwind import, theme tokens, and shared utility classes.
- `client/src/App.css` appears to be leftover template styling and is not imported by the current app entrypoint.

## Server

- `server/index.js` contains a local Express API, Socket.IO server, image upload handling, and static upload serving.
- `server/db.js` opens `server/chat.db`, creates SQLite tables, and exposes promise helpers.
- `server/uploads/` stores local uploaded images for the Express runtime.
- `server/chat.db` is the local SQLite database file.

## Supabase

- `supabase/schema.sql` creates PostgreSQL tables, RLS policies, Realtime publication, and a public storage bucket.

## Generated Or Installed

- `client/dist/` is a build output directory.
- `client/node_modules/` and `server/node_modules/` are installed dependencies.
