<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Perfect Perfections

This repo is a React + Vite frontend with Vercel serverless API routes. It is not a static-only site.

View your app in AI Studio: https://ai.studio/apps/0510704f-c796-4761-ac50-299976a5a66d

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your Square credentials and `ADMIN_SECRET`
3. Run the frontend:
   `npm run dev`

The Vite dev server runs on `localhost:5173` by default. API routes are Vercel serverless functions, so use `vercel dev` when you need to test `/api/*` locally.

## Admin Dashboard

Visit `/?admin=true` to view leads. `ADMIN_SECRET` must be set on the server, and you will be prompted for the token in the browser.

## Content And Menu Ownership

Contentful is for editable site content that is not the menu: hero copy, about copy, services, testimonials, FAQ, and site settings.

Square is the source of truth for menu/catalog data, including menu items, prices, categories, package settings, add-ons, signature dishes, and deposit settings. The site fetches `/api/square/menu` from Square on load and does not cache that response, so published Square catalog changes are reflected on fresh page loads.

## Deployment

Do not deploy this repo to GitHub Pages. GitHub Pages can only host the built frontend assets, but this app also requires the Vercel API routes in `api/` for leads, admin access, and Square routes.

Deploy it to Vercel or another platform that supports serverless Node API routes, and make sure the runtime has:

- `ADMIN_SECRET`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `SQUARE_ENVIRONMENT`
- `VITE_SQUARE_APPLICATION_ID`
- `VITE_SQUARE_LOCATION_ID`
- `VITE_SQUARE_ENVIRONMENT`
- `VITE_CONTENTFUL_SPACE_ID` (optional)
- `VITE_CONTENTFUL_ACCESS_TOKEN` (optional)
- `GMAIL_USER` (optional)
- `GMAIL_APP_PASSWORD` (optional)
- `NOTIFY_EMAIL` (optional)
