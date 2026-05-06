# Local Express Server

Purpose: Explain the local Node backend included in `server/`.

Related: [[Home]], [[Architecture]], [[apis/local-rest-api]], [[apis/local-socket-events]], [[flows/local-express-runtime]]

## What It Does

`server/index.js` provides a local backend with REST APIs, Socket.IO events, and image upload handling.

## REST Responsibilities

- Create a chat.
- Check whether a chat exists.
- Fetch paginated messages.
- Search text messages.
- Upload an image to `server/uploads/`.

## Realtime Responsibilities

Socket.IO lets clients join a chat room and broadcast saved messages to everyone in that room.

## Current Fit

The current React client uses Supabase directly, so this server appears to be a local or legacy runtime path unless the client is changed to call it.
