# Testing

Purpose: Explain the current testing and verification posture.

Related: [[Home]], [[Commands]], [[Development Workflow]]

## Automated Tests

No first-party test files were found under the project source directories.

- Root `package.json` has a placeholder `test` script that exits with failure.
- `server/package.json` has a placeholder `test` script that exits with failure.
- `client/package.json` has no `test` script.
- Test-looking files found under `server/node_modules/` belong to installed dependencies, not this project.

## Static Verification

- `cd client && npm run lint` runs ESLint using `client/eslint.config.js`.
- `cd client && npm run build` runs the Vite production build.

## Manual Verification Checklist

- Create a workspace from `/` and confirm navigation to `/chat/:chatId`.
- Join an existing workspace ID from `/`.
- Send a text message and confirm it persists after reload.
- Open the same workspace in two browser sessions and confirm Realtime delivery.
- Upload an image and confirm it displays using Supabase Storage or local uploads, depending on runtime path.
- Search for an existing text message and confirm jump-to-message behavior loads older history when needed.

## Testing Gap

Important flows in `client/src/ChatRoom.jsx` are currently only manually verifiable. Good first automated coverage would target message pagination, search behavior, image upload failure handling, and route-level smoke tests.
