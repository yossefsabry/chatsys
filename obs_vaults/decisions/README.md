# Decisions

Purpose: Preserve architectural decisions, tradeoffs, and unresolved direction questions.

Related: [[Home]], [[Architecture]], [[Deployment]]

## Current Decisions Found In Repo

- The deployed path is Vercel static hosting plus Supabase backend, according to `DEPLOY.md` and `vercel.json`.
- The Supabase schema intentionally enables broad anonymous access for a public chat app.
- A local Express, Socket.IO, and SQLite backend remains in `server/` and can be started by `start.sh`.

## Tradeoffs To Revisit

- Public anonymous RLS policies make sharing easy but provide no authorization boundary between users who know workspace IDs.
- Keeping both Supabase and local Express runtime paths increases maintenance cost unless both are intentionally supported.
- No automated tests means runtime regressions are likely to be caught manually or late.
