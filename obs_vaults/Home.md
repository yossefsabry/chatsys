# Home

Purpose: Entry point for understanding the NeoChat project.

## Start Here

- [[Project Map]]
- [[Architecture]]
- [[Development Workflow]]
- [[Commands]]
- [[Testing]]
- [[Glossary]]

## Main Areas

- [[modules/client-app]]
- [[modules/chat-room]]
- [[modules/landing-page]]
- [[modules/supabase-client]]
- [[modules/supabase-schema]]
- [[modules/local-express-server]]
- [[modules/sqlite-db]]
- [[modules/styles-and-assets]]

## Runtime Flows

- [[flows/workspace-lifecycle]]
- [[flows/realtime-messaging]]
- [[flows/image-upload]]
- [[flows/local-express-runtime]]

## Interfaces

- [[apis/supabase-tables]]
- [[apis/supabase-storage]]
- [[apis/local-rest-api]]
- [[apis/local-socket-events]]

## Operations

- [[Configuration]]
- [[Deployment]]
- [[Data Model]]
- [[Integrations]]
- [[decisions/README]]

## Open Questions

- `DEPLOY.md` says this branch deploys fully with Vercel and Supabase and does not use Express or Socket.IO, but `server/` and `start.sh` still provide a local Express, Socket.IO, and SQLite stack.
- There are no first-party automated tests in the repo; verification currently relies on build, lint, and manual runtime checks.
