# Commands

Purpose: List build, run, lint, test, and deployment commands discovered in the repo.

Related: [[Home]], [[Development Workflow]], [[Testing]], [[Deployment]]

## Root

- `./start.sh`: Starts the local Express backend and Vite frontend together.
- `npm test`: Root placeholder command that prints `Error: no test specified` and exits with failure.

## Client

- `cd client && npm install`: Install Vite/React client dependencies.
- `cd client && npm run dev`: Start the Vite development server.
- `cd client && npm run build`: Build the static client into `client/dist/`.
- `cd client && npm run lint`: Run ESLint over client files.
- `cd client && npm run preview`: Preview the production build locally.

## Server

- `cd server && npm install`: Install Express, Socket.IO, Multer, CORS, and SQLite dependencies.
- `cd server && node index.js`: Start the local backend on `PORT` or `3001`.
- `cd server && npm test`: Server placeholder command that prints `Error: no test specified` and exits with failure.

## Supabase

- Run `supabase/schema.sql` manually in the Supabase SQL editor according to `DEPLOY.md`.

## Vercel

- Vercel build command from `vercel.json`: `cd client && npm install && npm run build`.
- Vercel output directory from `vercel.json`: `client/dist`.
