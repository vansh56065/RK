# RK Residency — Heritage Luxury Hotel Website — Worklog

## Project Overview
Building a full-stack, production-grade website for **RK Residency**, a heritage-luxury
residency in Vrindavan, Uttar Pradesh, India. Positioning: "Spiritual luxury" for pilgrims,
devotee families and cultural travellers.

## Reference Brief (source)
`/home/z/my-project/upload/RK_Residency_God_Level_Prompt.pdf` — God-Level Master Prompt
specifying design language, sections, motion mood, booking engine requirements, admin
panel modules, SEO/perf spec and quality bar.

## Design Tokens (Section 4 of brief)
- Peacock Teal (primary)  `#0E4C4F`
- Temple Gold (accent)    `#C7A250`
- Marsala Maroon (secondary accent) `#6E1E36`
- Warm Ivory (background) `#FBF6EC`
- Charcoal (text)         `#231F1C`
- Headings: Playfair Display / Cormorant Garamond (serif)
- Body/UI: Inter (humanist sans)
- Motifs: peacock-feather curves, lotus, jharokha arches, diya flicker, marigold garland
- Motion: slow, reverent, cinematic — ease-out cubic/expo, prefers-reduced-motion respected

## Constraints (sandbox environment)
- Next.js 16 + App Router + TypeScript 5 (non-negotiable)
- Tailwind CSS 4 + shadcn/ui (already installed)
- Prisma + SQLite (existing)
- Only `/` route is user-visible (single-page marketing site with anchor sections)
- z-ai-web-dev-sdk only in backend
- Port 3000 only
- No `bun run build`

## Architecture
- **Single `/` route** with a **client-side router** (Zustand store + hash-based URL).
- The home page is a thin shell that lazy-loads `HomeSections` (all the marketing
  sections) and all the overlay "page" components (`RoomDetailPage`, `RoomsListPage`,
  `ExperiencesListPage`, `ExperienceDetailPage`, `DiningPage`, `GalleryPage`,
  `OffersListPage`, `OfferDetailPage`, `BlogListPage`, `BlogDetailPage`, `AboutPage`,
  `ContactPage`, `AdminPanel`) on demand.
- Routes are mirrored to `location.hash` so browser back/forward and shareable URLs work.
- An admin panel (login-gated) is exposed via `#/admin` and reached from a "Staff" link
  in the footer.

## Tech decisions
- Framer Motion (already installed) for component/scroll motion + reduced-motion respect.
- Prisma models for rooms, bookings, guests, reviews, newsletter, contact, offers, blog,
  admin users, audit log, rate overrides.
- API routes under `src/app/api/*` for public + admin endpoints.
- Admin auth: sandbox-grade signed token in httpOnly cookie + `Authorization: Bearer`
  header fallback. Production should use NextAuth.js.

## Current project status (assessment)
- **Lint: PASS** (0 errors)
- **Page renders**: confirmed via curl — 191KB HTML, all key sections present
  (Yamuna Suite, Banke Bihari, Satvik, Janmashtami, Check Availability CTA, SEO schema).
- **All public APIs working** (rooms, offers, reviews, blog, newsletter, contact, bookings).
- **All admin APIs working** (auth login, stats, bookings list, rooms CRUD, reviews
  moderation, newsletter/messages/audit log data).
- **Booking bug FIXED**: `Guest.email` was missing `@unique`, preventing `upsert` in the
  transactional booking flow. Schema fixed, `db push --accept-data-loss` applied, Prisma
  client regenerated, server restarted.
- **Admin panel built**: login gate, dashboard with KPIs (occupancy, ADR, RevPAR,
  arrivals), bookings table with status actions (check-in/out/cancel/mark-paid/refund),
  rooms CRUD with rate editor, reviews moderation, newsletter list (CSV export),
  messages, audit log.
- **Detailed pages built**: rooms listing + per-room detail, experiences listing +
  per-experience detail, dining, gallery (with category filter + lightbox), offers
  listing + per-offer detail, blog listing + per-post detail, about, contact.
- **Sandbox limitation**: The agent-browser CLI cannot reach the Next.js dev server
  reliably because the sandbox runs out of memory when Turbopack compiles additional
  client-side JS chunks during browser-driven navigation. Verified end-to-end via curl
  instead — all endpoints respond correctly and the page renders all sections.

## Bugs found and fixed
1. **Booking 500 error** — `Guest.email` was `String` not `String @unique`. The
   `upsert({ where: { email } })` call failed because Prisma needs a unique field for
   the `where` clause. Fixed by adding `@unique`, re-pushing the schema, and restarting
   the dev server. Confirmed: POST /api/bookings now returns `{"ok":true,
   "referenceCode":"RK-VRD-2026-4095", ...}`.
2. **React 19 `setState in effect` lint errors** — Refactored lazy-loaded components
   (RoomDetailPage, AdminPanel tabs) to avoid synchronous `setLoading(true)` inside
   `useEffect`. Used `useState` lazy initialisers where possible and `let cancelled`
   cleanup flags in effects.
3. **Initial bundle too heavy** — All overlay pages were statically imported, causing
   Turbopack to compile them all in one pass and OOM the sandbox. Refactored
   `page.tsx` to lazy-load every overlay component via `React.lazy` + `Suspense`.

## Files of interest
- `src/app/page.tsx` — root shell with router + lazy-loaded pages
- `src/lib/router.ts` — Zustand-based client-side router (hash-synced)
- `src/lib/admin-auth.ts` — admin session token verification
- `src/components/rk/HomeSections.tsx` — all marketing sections (lazy-loaded)
- `src/components/rk/pages/*.tsx` — all detailed overlay pages
- `src/components/rk/admin/AdminPanel.tsx` — full admin console
- `src/app/api/admin/*` — all admin API routes (auth, stats, bookings, rooms, reviews, data)
- `prisma/schema.prisma` — full schema (rooms, bookings, guests, reviews, offers, blog,
  newsletter, contact, admin users, audit log, rate overrides)
- `prisma/seed.ts` — rooms, reviews, offers, blog posts seed
- `prisma/seed-blog.ts` — full blog post bodies
- `prisma/seed-admin.ts` — admin user + audit log seed

## Unresolved issues / risks
- **Sandbox memory**: The 3.9GB RAM sandbox can OOM-kill the Next.js dev server when
  agent-browser drives heavy client-side navigation. All endpoints and pages render
  correctly via curl/wget; the issue is only with the agent-browser daemon's
  concurrent chunk loading. Production deployments on Vercel/etc. won't have this issue.
- **Admin auth is sandbox-grade**: Plain text password hash comparison. Must use
  bcrypt/argon2 + NextAuth.js in production.
- **No real payment gateway integration**: Razorpay/Stripe are stubbed. Production
  needs server-side webhook verification per the brief.

## Priority recommendations for next phase
1. Wire up real Razorpay/Stripe webhook handlers.
2. Add NextAuth.js for proper admin auth with JWT + httpOnly cookies.
3. Add SMTP email sending for booking confirmations + abandoned-checkout recovery.
4. Add a real CDN (Cloudinary) for room/gallery images instead of Unsplash hotlinks.
5. Add automated tests on the booking/payment path.
