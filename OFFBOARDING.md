# Perfect Perfections Client Offboarding Checklist

Use this checklist to hand the site over cleanly to the client and make sure they can operate it without needing developer access.

## Project Snapshot

- Project: Perfect Perfections Catering website and booking flow
- Repository: `bjtheartist/perfect-perfections`
- Production domain: `perfectperfectionscatering.com`
- Frontend: React 19, TypeScript, Vite 6, Tailwind CSS 4
- Backend: Vercel serverless functions in `api/`
- Payments/catalog/customer system: Square
- Optional CMS: Contentful for editable page content
- Lead notifications: Gmail SMTP via Nodemailer, if configured
- Admin dashboard: `https://perfectperfectionscatering.com/?admin=true`

## Access To Transfer

- [ ] GitHub repository ownership or collaborator access has been granted.
- [ ] Vercel project ownership or team access has been granted.
- [ ] Production domain/DNS registrar access has been granted.
- [ ] Square Dashboard access has been granted.
- [ ] Square Developer app access has been granted.
- [ ] Contentful space access has been granted, if the client will edit content through Contentful.
- [ ] Gmail account or Google Workspace account access has been granted for notification email, if lead notifications are enabled.
- [ ] Instagram account access has been confirmed for profile links and social updates.
- [ ] Client has a secure copy of non-code credentials through a password manager, not through email or chat.
- [ ] Developer-only credentials have been revoked or rotated after handoff.

## Environment Variables

Configure these in Vercel for production. Do not commit real values to the repo.

Required Square variables:

- [ ] `VITE_SQUARE_APPLICATION_ID`
- [ ] `VITE_SQUARE_LOCATION_ID`
- [ ] `VITE_SQUARE_ENVIRONMENT` set to `production`
- [ ] `SQUARE_ACCESS_TOKEN`
- [ ] `SQUARE_LOCATION_ID`
- [ ] `SQUARE_ENVIRONMENT` set to `production`

Required admin variable:

- [ ] `ADMIN_SECRET`

Optional Contentful variables:

- [ ] `VITE_CONTENTFUL_SPACE_ID`
- [ ] `VITE_CONTENTFUL_ACCESS_TOKEN`

Optional lead notification variables:

- [ ] `GMAIL_USER`
- [ ] `GMAIL_APP_PASSWORD`
- [ ] `NOTIFY_EMAIL`

## Client Operations

- [ ] Client can log into the admin dashboard at `/?admin=true`.
- [ ] Client knows where to find new leads in the admin dashboard.
- [ ] Client knows how to update lead status: `new`, `contacted`, `booked`, or `closed`.
- [ ] Client knows that Contentful is for non-menu site content only.
- [ ] Client knows that menu/catalog edits must happen in Square Dashboard.
- [ ] Client knows that Square menu/catalog changes appear on fresh page loads because `/api/square/menu` is fetched without caching.
- [ ] Client knows that fallback menu data lives in `src/data/constants.ts` and requires a developer change.
- [ ] Client knows how invoices, deposits, and Square receipts are sent.
- [ ] Client has confirmed deposit policy. Current code uses a 50% deposit.
- [ ] Client has confirmed tax policy. Current quote code applies 10.25% Chicago sales tax.
- [ ] Client has confirmed phone, email, Instagram, domain, and FAQ copy.
- [ ] Client has confirmed all gallery images and menu PDF are approved to use.

## Square Handoff

- [ ] Square application is switched from sandbox credentials to production credentials.
- [ ] Square location ID matches the business location used for payments/orders.
- [ ] Square Web Payments SDK works on the production domain.
- [ ] Square catalog contains packages, add-ons, signature dishes, menu categories, and item variations.
- [ ] A dry-run booking has been tested with a small real or test item before launch.
- [ ] Refund/cancellation policy has been confirmed with the client.
- [ ] Client knows how to view customers, orders, payments, invoices, and receipts in Square Dashboard.
- [ ] Client knows how to edit item names, descriptions, prices, and photos in Square Dashboard.
- [ ] Run `POST /api/square/seed` only when intentionally seeding baseline Square catalog data.
- [ ] Run `POST /api/square/cleanup?dry=true` before any catalog cleanup, then review the report before running without `dry=true`.

## Contentful Handoff

- [ ] Contentful is used only for non-menu site content: hero, about, services, testimonials, FAQ, and site settings.
- [ ] Menu items, prices, packages, add-ons, signature dishes, deposit settings, and catalog categories are not managed in Contentful.
- [ ] `VITE_CONTENTFUL_ACCESS_TOKEN` is a Content Delivery API token, not a Content Management API token.
- [ ] Preview API tokens are not used in production unless draft content is intentionally public.
- [ ] Contentful users have least-privilege roles and former developer access is removed after handoff.

## Deployment Handoff

- [ ] Vercel production deployment is connected to the intended GitHub branch.
- [ ] Production environment variables are set in Vercel.
- [ ] Preview environment variables are set separately, if previews are used.
- [ ] Domain is attached in Vercel.
- [ ] DNS records point to Vercel.
- [ ] SSL certificate is active.
- [ ] Vercel Analytics and Speed Insights are visible to the client or owner.
- [ ] Client knows how to trigger or inspect deployments.
- [ ] Client knows not to deploy this project to GitHub Pages because it needs serverless API routes.

## QA Before Final Handoff

- [ ] Home page loads on desktop and mobile.
- [ ] Main CTA opens booking flow.
- [ ] Estimate flow completes without payment.
- [ ] Booking flow creates a Square order.
- [ ] Deposit payment flow works with Square Web Payments.
- [ ] Invoice creation works and sends/opens the Square invoice URL.
- [ ] Lead form creates a customer/lead in Square.
- [ ] Lead notification email sends, if Gmail variables are configured.
- [ ] Admin dashboard login works with `ADMIN_SECRET`.
- [ ] Admin leads list loads.
- [ ] Admin lead status update works.
- [ ] Admin orders, transactions, and customers tabs load.
- [ ] `/api/square/health` returns `success: true` in production.
- [ ] `/api/square/menu` returns live Square catalog data in production.
- [ ] SEO metadata, `robots.txt`, and `sitemap.xml` use the correct production domain.
- [ ] Favicon, logo, menu PDF, and gallery assets load.

## Developer Handoff

Common commands:

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Notes:

- Vite dev server runs the frontend locally. Vercel API routes are best tested with `vercel dev` or in a Vercel deployment.
- `npm run lint` is a TypeScript typecheck, not an ESLint run.
- The app falls back to static catalog/content when Square or Contentful are not configured.
- Contentful controls non-menu site content only; Square controls the live menu/catalog.
- `/api/square/menu` and the frontend catalog fetch are configured with no-cache behavior so Square catalog updates are pulled on fresh loads.
- API routes are under `api/`; there is no active Express server in the current checkout.
- Confirm the 50% deposit policy and 10.25% tax policy with the client before final launch.
- `npm audit` is currently clean. `package.json` uses npm `overrides` to keep patched transitive versions under `@vercel/node`.
- Run `npm audit` before final delivery and review any new dependency advisories.

## Final Signoff

- [ ] Client reviewed the live site.
- [ ] Client approved copy, prices, photos, policies, and contact information.
- [ ] Client completed a real admin login test.
- [ ] Client completed or observed a booking/payment test.
- [ ] Client confirmed they have access to GitHub, Vercel, Square, domain/DNS, and any CMS/email accounts.
- [ ] Client confirmed ongoing support terms, response expectations, and post-handoff maintenance owner.
- [ ] Secrets were rotated after handoff where needed.
- [ ] Final repository state was pushed and production deployment was verified.
