# Landing Page

Purpose: Explain workspace creation and joining from the home route.

Related: [[Home]], [[modules/client-app]], [[flows/workspace-lifecycle]], [[apis/supabase-tables]]

## What It Does

`client/src/LandingPage.jsx` is the `/` route. It lets users create a new workspace or join an existing one by ID.

## Workspace Creation

The page inserts an empty row into Supabase table `chats`, selects the created row, and navigates to `/chat/:id`.

## Workspace Join

The page queries `chats` for the typed ID. If a row exists, it navigates to `/chat/:id`; otherwise it displays an error.

## UI Notes

The component uses `lucide-react` icons and shared classes from `client/src/index.css`, including `btn-primary`, `btn-secondary`, and `saas-panel`.
