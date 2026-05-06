# Development Workflow

Purpose: Describe how to set up, run, change, and verify this project locally.

Related: [[Home]], [[Commands]], [[Testing]], [[Configuration]]

## Setup

- Install client dependencies from `client/package.json` with `npm install` in `client/`.
- Install server dependencies from `server/package.json` with `npm install` in `server/` if using the local Express runtime.
- For Supabase-backed client development, copy `client/.env.example` to `client/.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Do not copy real `.env` values into documentation or commits.

## Run The Supabase Client Path

- Apply `supabase/schema.sql` in the Supabase SQL editor as described by `DEPLOY.md`.
- Run `npm run dev` from `client/`.
- Open the Vite URL printed by the dev server.

## Run The Local Express Path

- Run `./start.sh` from the project root.
- The script starts `server/index.js` on port `3001` and the Vite client.
- Static uploads are served from `server/uploads/`.

## Change Flow

- Routing changes usually start in `client/src/App.jsx`.
- Landing and workspace creation changes usually start in `client/src/LandingPage.jsx`.
- Chat behavior changes usually start in `client/src/ChatRoom.jsx`.
- Supabase schema or policy changes start in `supabase/schema.sql`.
- Local backend API changes start in `server/index.js` and may require schema changes in `server/db.js`.

## Verification

- Run `npm run lint` in `client/` after client changes.
- Run `npm run build` in `client/` before deploy changes.
- Use manual browser checks for workspace creation, joining, realtime messages, search, and image upload because no first-party automated tests are currently defined.
