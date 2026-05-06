# Configuration

Purpose: Document environment variables and runtime configuration files.

Related: [[Home]], [[Development Workflow]], [[Deployment]], [[Integrations]]

## Client Environment

The browser client reads Supabase settings in `client/src/lib/supabase.js`.

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous public key.
- `client/.env.example` provides placeholder values.
- `client/.env` exists locally but should not be copied into docs because it may contain real credentials.

## Vite And Tailwind

- `client/vite.config.js` enables React through `@vitejs/plugin-react` and Tailwind through `@tailwindcss/vite`.
- `client/src/index.css` imports Tailwind and defines app theme tokens.

## ESLint

- `client/eslint.config.js` applies JavaScript recommended rules, React Hooks rules, and React Refresh/Vite rules for `**/*.{js,jsx}`.
- `client/dist` is ignored by ESLint.

## Local Server

- `server/index.js` uses `process.env.PORT || 3001`.
- `server/db.js` resolves SQLite storage to `server/chat.db`.
- `server/index.js` creates `server/uploads/` if missing.
