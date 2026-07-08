# RK Residency — Heritage Luxury Hotel Website — Worklog

## Project Overview
Building a full-stack, production-grade website for **RK Residency**, a heritage-luxury
residency in Vrindavan, Uttar Pradesh, India. Positioning: "Spiritual luxury" for pilgrims,
devotee families and cultural travellers.

## Architecture (real Next.js App Router routes)
- **Real Next.js App Router routes** (no longer hash-based):
  - `/` — home (marketing sections + FAQ + FestivalCalendar + ReviewForm + Weather)
  - `/rooms`, `/rooms/[slug]` — rooms listing + detail
  - `/experiences`, `/experiences/[slug]` — experiences listing + detail
  - `/dining` — satvik dining detail
  - `/gallery` — full gallery
  - `/offers`, `/offers/[slug]` — offers listing + detail
  - `/blog`, `/blog/[slug]` — blog listing + detail
  - `/about` — our story
  - `/contact` — contact & location
  - `/festivals` — Braj festival calendar
  - `/admin` — admin panel (login-gated)
- **Visitor tracking**: Every page view is tracked via `POST /api/track` (anonymous session
  ID stored in sessionStorage). PageView records stored in Prisma.
- **Admin analytics**: `/api/admin/analytics` returns today's KPIs, 7-day traffic, monthly
  trend, top pages, top referrers, booking funnel, SEO keywords.

## Current project status (this session)
- **Lint: PASS** (0 errors)
- **Admin runtime error FIXED**: `DashboardTab` was throwing an unhandled error when
  the admin stats API returned 401 (expired/missing token). Root cause: the `loadStats()`
  function threw an error that wasn't caught by the `useEffect`. Fixed by:
  1. Creating `src/lib/admin-client.ts` — a client-side admin API helper that stores the
     session token in localStorage and includes it as a `Bearer` header in all requests.
  2. Updating the login flow to store both the admin user object AND the token.
  3. Adding proper error handling (try/catch + error state) in all admin tab components.
  4. If the API returns null (unauthorized), showing a friendly "session expired" message
     instead of crashing.
- **Admin panel completely rewritten** with:
  1. **Dashboard** — KPI cards (occupancy, revenue, bookings, arrivals), revenue trend
     chart, room-type breakdown.
  2. **Analytics & SEO** (NEW TAB) — today's page views/unique visitors/conversion rate,
     7-day traffic chart (views vs unique), 6-month monthly trend table, top 10 pages,
     top 8 referrers, booking funnel (views → checks → bookings → conversion), SEO
     keyword tracking table.
  3. **Bookings** — full table with search + status filter, action buttons (check-in,
     check-out, cancel, mark-paid, refund).
  4. **Rooms** — full CRUD (create/edit/delete) with modal editor for all fields.
  5. **Offers** (NEW CRUD) — full create/edit/delete with modal editor.
  6. **Blog** (NEW CRUD) — full create/edit/delete with modal editor, category dropdown,
     publish toggle.
  7. **Reviews** — approve/hide moderation.
  8. **Newsletter** — subscriber list with CSV export.
  9. **Messages** — contact form submissions with reply-by-email.
  10. **Audit Log** — all admin actions logged.
- **Visitor tracking** (NEW): `VisitorTracker` component added to root layout. Fires
  `POST /api/track` on every route change. Records path, referrer, sessionId, userAgent,
  isBot. Anonymous — no PII stored.
- **Analytics data seeded**: 502 page views across last 7 days + 12 SEO keywords.
- **Prisma schema updated**: Added `PageView`, `DailyAnalytics`, `SEOKeyword` models.

## Bugs found and fixed (this session)
1. **Admin runtime crash** — `loadStats()` threw unhandled error on 401. Fixed with
   `adminFetch` helper that catches errors and returns null, plus error state in all tabs.
2. **Prisma `distinct` query error** — `findMany` with `select: { sessionId: true },
   distinct: true` is invalid Prisma syntax. Fixed by fetching all sessionIds and
   using `new Set().size` for unique counts.
3. **Token not sent in admin API requests** — Login stored user object in localStorage
   but not the token. API calls relied on httpOnly cookie which wasn't always sent.
   Fixed by storing token in localStorage and adding `Authorization: Bearer` header
   via `adminFetch` helper.

## Files of interest (this session)
- `src/lib/admin-client.ts` — NEW: client-side admin API helper with token management
- `src/components/rk/admin/AdminPanel.tsx` — COMPLETELY REWRITTEN with 10 tabs, error
  handling, full CRUD for rooms/offers/blog, analytics dashboard
- `src/components/rk/VisitorTracker.tsx` — NEW: fires page-view tracking on route change
- `src/app/api/track/route.ts` — NEW: public POST endpoint for page-view tracking
- `src/app/api/admin/analytics/route.ts` — NEW: admin analytics (visitors, SEO, funnel)
- `src/app/api/admin/offers/route.ts` — NEW: full CRUD for offers
- `src/app/api/admin/blog/route.ts` — NEW: full CRUD for blog posts
- `src/app/layout.tsx` — updated with VisitorTracker
- `prisma/schema.prisma` — added PageView, DailyAnalytics, SEOKeyword models
- `prisma/seed-analytics.ts` — NEW: seeds 502 page views + 12 SEO keywords

## Verification results (this session)
- **Lint**: 0 errors
- **Admin login**: POST /api/admin/auth returns token (len 148) + admin user object
- **Admin stats**: GET /api/admin/stats with Bearer token returns 200 with KPIs
- **Admin analytics**: GET /api/admin/analytics returns:
  - today: 103 page views, 103 unique visitors
  - last7Days: 7 data points
  - topPages: 10 pages
  - topReferrers: 4 sources
  - monthlyTrend: 6 months
  - seoKeywords: 12 keywords
  - bookingFunnel: conversion rate 0.2%
- **Visitor tracking**: POST /api/track returns {"ok":true}
- **Admin page**: /admin renders login gate correctly

## Unresolved issues / risks
- **Sandbox memory (3.9GB RAM)**: Server can OOM-kill when compiling multiple new routes
  in quick succession. Each route works when tested individually.
- **Admin auth is sandbox-grade**: Plain text password hash. Production needs bcrypt + NextAuth.
- **No real payment gateway**: Razorpay/Stripe stubbed.
- **Analytics queries**: The `findMany` + `Set` approach for unique visitors works for
  small datasets but won't scale to millions of page views. In production, use
  `DailyAnalytics` aggregation or a proper analytics DB (ClickHouse, BigQuery).

## Priority recommendations for next phase
1. Wire up real Razorpay/Stripe webhook handlers.
2. Add NextAuth.js for proper admin auth.
3. Add SMTP email for booking confirmations.
4. Add sitemap.xml + robots.txt.
5. Implement `DailyAnalytics` aggregation job (run nightly to pre-compute daily stats).
6. Add Google Search Console integration for real SEO keyword data.
7. Add multi-language (Hindi/English) content.
