# Styles And Assets

Purpose: Explain the styling setup and static assets.

Related: [[Home]], [[modules/client-app]], [[Configuration]]

## What It Does

The client uses Tailwind CSS through Vite and local CSS utilities.

## Important Files

- `client/src/index.css`: Imports Tailwind, defines theme tokens, body defaults, scrollbar styling, panel styles, button styles, and message entry animation.
- `client/public/icons.svg`: Static icon asset.
- `client/public/favicon.svg`: Static favicon asset.
- `client/src/App.css`: Looks like leftover template CSS and is not imported by `client/src/main.jsx` or `client/src/App.jsx`.

## How It Connects

UI components use Tailwind utility classes plus shared classes like `saas-panel`, `btn-primary`, `btn-secondary`, and `message-enter`.
