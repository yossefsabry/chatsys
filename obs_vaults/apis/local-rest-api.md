# Local REST API

Purpose: Document the Express REST endpoints in `server/index.js`.

Related: [[Home]], [[modules/local-express-server]], [[flows/local-express-runtime]], [[Data Model]]

## Endpoints

- `POST /api/chats`: Creates a chat with `crypto.randomUUID()` and returns `{ id }`.
- `GET /api/chats/:id`: Returns a chat row or `404` if missing.
- `GET /api/chats/:id/messages`: Returns paginated messages using `limit` and `offset` query parameters.
- `GET /api/chats/:id/search`: Searches text messages by `q` and returns up to 50 results.
- `POST /api/chats/:id/upload`: Accepts one image field named `image` and returns a local `/uploads/...` URL.

## Upload Limits

Multer is configured for image MIME types only and a 10 MB max file size.

## Current Fit

The current client code does not call these endpoints directly.
