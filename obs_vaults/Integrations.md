# Integrations

Purpose: List external services and third-party libraries that shape runtime behavior.

Related: [[Home]], [[Architecture]], [[Configuration]], [[Deployment]]

## Supabase

- `@supabase/supabase-js` is used by `client/src/lib/supabase.js`.
- Supabase tables are used directly by `client/src/LandingPage.jsx` and `client/src/ChatRoom.jsx`.
- Supabase Realtime delivers inserted messages to active chat rooms.
- Supabase Storage stores public uploaded images in `chat-images`.

## Vercel

- `vercel.json` deploys only the static client output.
- SPA rewrites allow direct navigation to chat URLs.

## React And Routing

- `react` and `react-dom` power the client.
- `react-router-dom` defines `/` and `/chat/:chatId` routes.

## Local Backend Libraries

- `express` provides REST routes in `server/index.js`.
- `socket.io` provides local websocket-style room events.
- `multer` handles local image uploads.
- `sqlite3` persists local chats and messages.
- `cors` allows broad local API access.
