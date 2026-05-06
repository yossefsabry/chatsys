# SQLite DB

Purpose: Explain local database initialization and helper functions.

Related: [[Home]], [[Data Model]], [[modules/local-express-server]]

## What It Does

`server/db.js` opens `server/chat.db`, creates local `chats` and `messages` tables if they do not exist, and exports promise-based helpers.

## Helpers

- `run(sql, params)`: Executes a statement and resolves `lastID` and `changes`.
- `get(sql, params)`: Fetches one row.
- `all(sql, params)`: Fetches all matching rows.

## How It Connects

`server/index.js` imports `run`, `get`, and `all` for all local REST and Socket.IO persistence.
