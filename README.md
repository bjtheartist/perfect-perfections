<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Perfect Perfections

This repo is a React + Vite frontend served by an Express + TypeScript backend. It is not a static-only site.

View your app in AI Studio: https://ai.studio/apps/0510704f-c796-4761-ac50-299976a5a66d

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your Square credentials and `ADMIN_SECRET`
3. Run the app:
   `npm run dev`

The app starts an Express server on `PORT` or `3001` by default.

## Admin Dashboard

Visit `/?admin=true` to view leads. `ADMIN_SECRET` must be set on the server, and you will be prompted for the token in the browser.

## Deployment

Do not deploy this repo to GitHub Pages. GitHub Pages can only host the built frontend assets, but this app also requires the Express API in `server.ts` for leads, admin access, and Square routes.

Deploy it to a platform that supports a Node server, and make sure the runtime has:

- `ADMIN_SECRET`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `SQUARE_ENVIRONMENT`
- `VITE_SQUARE_APPLICATION_ID`
- `VITE_SQUARE_LOCATION_ID`
- `VITE_SQUARE_ENVIRONMENT`
