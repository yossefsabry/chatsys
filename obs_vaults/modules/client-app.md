# Client App

Purpose: Explain the React application shell and routing.

Related: [[Home]], [[Architecture]], [[modules/landing-page]], [[modules/chat-room]]

## What It Does

The client is a Vite React app under `client/`. It renders the NeoChat landing page and chat room UI, and currently talks directly to Supabase for backend operations.

## Important Files

- `client/src/main.jsx`: Creates the React root and renders `App` inside `StrictMode`.
- `client/src/App.jsx`: Defines routes for `/` and `/chat/:chatId`.
- `client/package.json`: Defines scripts and dependencies.
- `client/vite.config.js`: Configures Vite with React and Tailwind plugins.

## How It Connects

`App.jsx` maps the home route to [[modules/landing-page]] and chat route to [[modules/chat-room]]. Supabase access is centralized in [[modules/supabase-client]].
