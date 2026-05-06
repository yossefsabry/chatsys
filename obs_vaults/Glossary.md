# Glossary

Purpose: Define project-specific terms and naming conventions.

Related: [[Home]], [[Architecture]], [[Data Model]]

## Terms

- NeoChat: The chat application name used in UI and deployment documentation.
- Workspace: User-facing name for a chat room; represented by a row in `chats`.
- Chat ID: UUID-style workspace identifier used in `/chat/:chatId` and `messages.chat_id`.
- Message: A text or image entry stored in `messages`.
- Sender ID: Browser-generated identifier stored in `localStorage` as `neochat_sender_id`.
- Supabase Realtime: Postgres change feed used by the current client to receive inserted messages.
- `chat-images`: Public Supabase Storage bucket used for uploaded images.
- RLS: Row Level Security; enabled in `supabase/schema.sql` with permissive anonymous policies.
- Local Express runtime: The `server/` stack using Express, Socket.IO, SQLite, and Multer.
- Serverless deployment path: The Vercel static client plus Supabase backend described in `DEPLOY.md`.
