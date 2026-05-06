# Realtime Messaging

Purpose: Explain how text messages load, send, and appear live.

Related: [[Home]], [[modules/chat-room]], [[Data Model]], [[apis/supabase-tables]]

## Initial Load

`client/src/ChatRoom.jsx` fetches up to 20 newest messages for the current `chatId`, reverses them into chronological order, and scrolls to the bottom.

## Pagination

An `IntersectionObserver` watches a target near the top of the message list. When visible, older messages are fetched with a Supabase range offset based on the number already loaded.

## Send

Submitting the message form inserts a `messages` row with `chat_id`, `sender_id`, `type: 'text'`, and `content`.

## Receive

The component subscribes to Supabase `postgres_changes` for inserts into `messages` filtered by `chat_id`. New rows are appended if they are not already present.

## Search

Search uses a debounced Supabase `ilike` query on text messages and can load older history until the selected result is present in the DOM.
