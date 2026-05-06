# Local Express Runtime

Purpose: Explain the runtime flow when using `server/` and `start.sh`.

Related: [[Home]], [[modules/local-express-server]], [[modules/sqlite-db]], [[apis/local-rest-api]], [[apis/local-socket-events]]

## Start

`start.sh` changes into `server/`, starts `node index.js` in the background, then changes into `client/` and starts `npm run dev`.

## Backend Startup

`server/index.js` creates an Express app, HTTP server, and Socket.IO server. It also ensures `server/uploads/` exists and serves it at `/uploads`.

## Database Startup

`server/db.js` opens `server/chat.db` and creates `chats` and `messages` tables if needed.

## Local Message Flow

For Socket.IO clients, `join_room` places the socket in a room, and `send_message` persists the message before emitting `receive_message` to that room.

## Current Fit

The current React client does not call these local APIs, so this runtime path may require client changes or older client code to be fully exercised.
