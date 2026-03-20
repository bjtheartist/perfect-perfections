# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build
npm run test         # Run all tests (Vitest)
npm run lint         # Type-check with tsc --noEmit
```

API routes run as Vercel serverless functions — they only work when deployed or via `vercel dev`. The Vite dev server proxies `/api/*` requests.

## Architecture

**Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Vercel serverless functions + Square SDK v44

### Frontend (`src/`)

Single-page app with one main layout component (`MockupC.tsx`) and a multi-step booking modal (`BookingModal.tsx`).

- **`hooks/useCatalog.ts`** — Fetches menu from `/api/square/menu`. If Square is unavailable, falls back to hardcoded data in `data/constants.ts`. The `isLive` flag tells the UI whether Square is connected.
- **`hooks/useBookingFlow.ts`** — State machine for the 5-step booking wizard (package → details → quote → deposit → confirmed). Tracks selected package, menu items with pan sizes (small/large), add-ons, customer info, and Square integration state.
- **`lib/quote.ts`** — `buildQuoteFromCatalog()` calculates line items from selected package (flat service fee), menu items (per-pan pricing), and add-ons. Applies 10.25% Chicago tax and 25% deposit.
- **`lib/square/useSquare.ts`** — Frontend API client that calls backend routes (not Square SDK directly). Handles health checks, quotes, orders, invoices, and payments.
- **`lib/square/types.ts`** — Shared types between frontend and backend. `CatalogData` is the unified shape for both live Square data and fallback constants.
- **`data/constants.ts`** — Fallback menu data (90+ items with small/large pan prices), catering packages, add-ons, meal prep menus, FAQ. This is the offline source of truth.

### Backend (`api/`)

Vercel serverless functions (30s max duration). All Square API calls happen server-side.

- **`api/square/menu.ts`** — Lists Square catalog, transforms items into `CatalogData`. Supports two variations per item (Small Pan / Large Pan).
- **`api/square/orders.ts`** — Creates Square orders with customer lookup/creation, line items, 10.25% tax, and PICKUP fulfillment.
- **`api/square/invoices.ts`** — Creates invoices with DEPOSIT (25%) + BALANCE payment requests.
- **`api/square/seed.ts`** — Admin-only endpoint that seeds Square catalog with custom attributes and categories.
- **`api/leads/index.ts`** — Lead capture: creates Square customers and sends notification emails via nodemailer.
- **`api/_lib/admin.ts`** — `requireAdmin()` middleware checks `x-admin-token` header against `ADMIN_SECRET`.

### Data Flow

Menu prices come from Square catalog (two variations: Small Pan / Large Pan per item). If Square is unreachable, `FALLBACK_MENU_ITEMS` in `constants.ts` provides the same data statically. The quote calculator works identically with either source — same `CatalogData` shape.

Catering packages are flat service fees (not per-person). Menu items are priced per pan (small or large). The booking wizard lets users toggle pan size per dish.

### Admin

Access admin dashboard at `/?admin=true` — prompts for `ADMIN_SECRET` token (stored in sessionStorage).

## Environment Variables

**Frontend (VITE_ prefix, exposed to browser):**
- `VITE_SQUARE_APPLICATION_ID` — Square app ID for Web Payments SDK
- `VITE_SQUARE_LOCATION_ID` — Square location
- `VITE_SQUARE_ENVIRONMENT` — `sandbox` or `production`

**Backend (server-only):**
- `SQUARE_ACCESS_TOKEN` — Square API token
- `SQUARE_LOCATION_ID` — Square location
- `SQUARE_ENVIRONMENT` — `sandbox` or `production`
- `ADMIN_SECRET` — Protects admin endpoints

## Deployment

Hosted on Vercel. The `vercel.json` configures SPA rewrites, serverless function routing, security headers, and asset caching. Domain: `perfectperfectionscatering.com`.

## Square Custom Attributes

Seeded via `POST /api/square/seed` (admin-only):
- `pp_min_guests` (NUMBER) — minimum guests for a package
- `pp_includes` (STRING, JSON array) — what's included in a package
- `pp_pricing_type` (STRING) — `per-person` or `flat` for add-ons
- `pp_icon` (STRING) — `utensils`, `truck`, or `cake`
