# Supabase Client

Purpose: Explain how browser code connects to Supabase.

Related: [[Home]], [[Configuration]], [[Integrations]], [[apis/supabase-tables]]

## What It Does

`client/src/lib/supabase.js` creates and exports a Supabase client using `@supabase/supabase-js`.

## Configuration

The client reads these Vite environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If either value is missing, the module logs an error to the browser console.

## How It Connects

`client/src/LandingPage.jsx` and `client/src/ChatRoom.jsx` import the exported `supabase` instance for table queries, Realtime subscriptions, and storage operations.
