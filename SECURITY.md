# Security Notes

## Square

Square is the source of truth for menu/catalog data, pricing, packages, add-ons, signature dishes, deposit settings, customers, orders, invoices, and payments.

- Keep `SQUARE_ACCESS_TOKEN` server-side in Vercel environment variables only.
- Use `VITE_SQUARE_APPLICATION_ID`, `VITE_SQUARE_LOCATION_ID`, and `VITE_SQUARE_ENVIRONMENT` in the browser; these are public Web Payments SDK values.
- Set `SQUARE_ENVIRONMENT=production` and `VITE_SQUARE_ENVIRONMENT=production` for the live site.
- Card data must stay inside Square Web Payments SDK. This app should only receive Square payment tokens.
- Menu changes should be made in Square Dashboard. The site fetches `/api/square/menu` without caching so Square catalog edits are reflected on fresh page loads.
- Use `POST /api/square/seed` and `POST /api/square/cleanup` only with the admin token and only when intentionally changing Square catalog structure.

## Contentful

Contentful is for non-menu site content only: hero copy, about copy, services, testimonials, FAQ, and site settings.

- Do not store menu items, prices, packages, add-ons, deposit settings, customer data, orders, invoices, or payment information in Contentful.
- `VITE_CONTENTFUL_ACCESS_TOKEN` must be a Content Delivery API token for published read-only content.
- Do not expose Content Management API tokens in Vercel frontend variables or browser code.
- Do not use Preview API tokens in production unless draft content is intentionally public.
- Remove former developer users from Contentful after handoff and keep client roles least-privilege.

## Admin

- `ADMIN_SECRET` protects admin-only routes and should be a long random value stored only in Vercel environment variables and the client's password manager.
- Rotate `ADMIN_SECRET` after handoff.
- Avoid sharing admin tokens in email, chat, screenshots, or recorded walkthroughs.
