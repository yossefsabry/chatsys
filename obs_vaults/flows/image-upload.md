# Image Upload

Purpose: Explain how image messages are uploaded and displayed.

Related: [[Home]], [[modules/chat-room]], [[apis/supabase-storage]], [[Data Model]]

## Browser Flow

`client/src/ChatRoom.jsx` accepts image files from a hidden file input and shows an optimistic local preview using `URL.createObjectURL()`.

## Supabase Upload

The file is uploaded to Supabase Storage bucket `chat-images` under a path based on `chatId` and the current timestamp.

## Message Insert

After upload, the component gets the public URL, removes the optimistic preview, and inserts a `messages` row with `type: 'image'` and `content` set to the public URL.

## Failure Handling

If upload fails, the preview is removed, the local object URL is revoked, and a temporary upload error is shown.

## Display

`ChatImage` handles lazy loading, skeleton display, and image load failure fallback.
