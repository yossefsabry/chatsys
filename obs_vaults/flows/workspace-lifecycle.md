# Workspace Lifecycle

Purpose: Explain how workspaces are created, joined, and routed.

Related: [[Home]], [[modules/landing-page]], [[modules/chat-room]], [[apis/supabase-tables]]

## Create

`client/src/LandingPage.jsx` inserts into `chats` through Supabase and navigates to `/chat/:id` using the returned row ID.

## Join

The landing page checks for an existing `chats.id` matching the user's input. If found, it navigates to the chat route.

## Route

`client/src/App.jsx` maps `/chat/:chatId` to `ChatRoom`, and `client/src/ChatRoom.jsx` reads the route parameter with `useParams()`.

## Share

Inside a chat room, the share button copies `window.location.href`, so access is based on possessing the workspace URL or ID.
