# Local Socket Events

Purpose: Document Socket.IO events implemented by the local server.

Related: [[Home]], [[modules/local-express-server]], [[flows/local-express-runtime]]

## Events From Client To Server

- `join_room`: Accepts a `chatId` and joins the socket to that room.
- `send_message`: Accepts `{ chatId, senderId, type, content }`, saves the message, and broadcasts it.

## Events From Server To Client

- `receive_message`: Emits the saved message row to everyone in the room, including the sender.

## Storage

Messages are saved through `server/db.js` before broadcast.

## Current Fit

`socket.io-client` is listed in `client/package.json`, but the current React source does not import it.
