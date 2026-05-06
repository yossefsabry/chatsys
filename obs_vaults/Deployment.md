# Deployment

Purpose: Explain the deployment path documented by the repo.

Related: [[Home]], [[Commands]], [[Configuration]], [[Integrations]]

## Vercel Static Client

`DEPLOY.md` describes deploying the React client to Vercel with Supabase as the backend.

- `vercel.json` sets `buildCommand` to `cd client && npm install && npm run build`.
- `vercel.json` sets `outputDirectory` to `client/dist`.
- `vercel.json` rewrites all routes to `/index.html` so React Router can handle `/chat/:chatId`.

## Supabase Backend

- `supabase/schema.sql` must be run in the Supabase SQL editor before the deployed app is useful.
- Vercel environment variables must include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Supabase provides PostgreSQL persistence, Realtime delivery, and public image storage.

## Not Deployed By Vercel Config

- `server/index.js` is not referenced by `vercel.json`.
- `server/chat.db` and `server/uploads/` are local runtime artifacts, not part of the Vercel static output.

## Open Question

`DEPLOY.md` references setting the branch to `vercel-deploy`; this documentation was created from the current checkout and did not verify the active branch name.
