# Nilgiri Trip Planner Live

Render-ready version of `nilgiri-trip-planner_1.jsx`.

## What Changed

- Wrapped the JSX file in a Vite React app.
- Added a Node server that serves the built React app.
- Added `/api/state`, `/api/action`, and `/api/events` so profiles, votes, comments, and game choices sync live across different networks.

## Render

Deploy this folder as a Render web service.

- Build command: `npm install && npm run build`
- Start command: `npm start`

The app stores shared state in `data/state.json` on the server. On Render's free plan, this may reset on redeploy/restart unless persistent disk is added.
