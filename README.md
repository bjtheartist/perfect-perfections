<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0510704f-c796-4761-ac50-299976a5a66d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your Square credentials and `ADMIN_SECRET`
3. Run the app:
   `npm run dev`

## Admin Dashboard

Visit `/?admin=true` to view leads. If `ADMIN_SECRET` is set, enter the token when prompted (or pass `?token=YOUR_SECRET`).
