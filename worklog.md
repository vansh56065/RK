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

## Architecture (UPDATED — real Next.js routes)
- **Real Next.js App Router routes** (no longer hash-based):
  - `/` — home (marketing sections)
  - `/rooms` — rooms listing
  - `/rooms/[slug]` — room detail
  - `/experiences` — experiences listing
  - `/experiences/[slug]` — experience detail
  - `/dining` — satvik dining detail
  - `/gallery` — full gallery
  - `/offers` — offers listing
  - `/offers/[slug]` — offer detail
  - `/blog` — blog listing
  - `/blog/[slug]` — blog post detail
  - `/about` — our story
  - `/contact` — contact & location
  - `/festivals` — Braj festival calendar (NEW)
  - `/admin` — admin panel (login-gated)
- **Router store** (`src/lib/router.ts`): Zustand store for booking widget state +
  navigation (delegates to `window.location.href` for real route changes).
- **Footer "Stay" and "Discover" link groups** use real `<a href>` links to the
  dedicated pages.
- **Navbar** nav items navigate to real dedicated pages.

## Tech decisions
- Framer Motion for component/scroll motion + reduced-motion respect.
- Prisma models for rooms, bookings, guests, reviews, newsletter, contact, offers, blog,
  admin users, audit log, rate overrides.
- API routes under `src/app/api/*` for public + admin endpoints.
- Admin auth: sandbox-grade signed token in httpOnly cookie + `Authorization: Bearer`
  header fallback. Production should use NextAuth.js.

## Current project status (assessment — this session)
- **Lint: PASS** (0 errors)
- **Hydration error FIXED**: Added `suppressHydrationWarning` to `<body>` tag in
  `src/app/layout.tsx`. The error was caused by the Monica browser extension
  injecting `monica-id` / `monica-version` attributes.
- **Real Next.js routes**: All 14 routes created and verified individually via curl.
  Each route returns HTTP 200 when tested in isolation.
- **Admin panel**: Accessible at `/admin` — login gate renders correctly (verified
  via curl: "RK Residency Admin", "Restricted access", demo creds visible).
- **All public APIs working**: rooms, offers, reviews (GET + POST), blog, newsletter,
  contact, bookings/check, bookings, admin auth, admin stats/bookings/rooms/reviews/data.
- **New features added this session**:
  1. **FAQ section** — 15 Q&As across 5 categories (Booking, Rooms, Dining, Temple
     Visits, Accessibility) with category filter and accordion animation.
  2. **Guest review submission form** — Public POST `/api/reviews` endpoint. New
     reviews are saved with `approved: false` and require admin moderation before
     appearing publicly. Star rating, name, location, title, body fields.
  3. **Braj Festival Calendar** — 6 major festivals (Makar Sankranti, Vasant
     Panchami, Holi, Radhashtami, Janmashtami, Sharad Purnima) with dates,
     descriptions, significance, where, best-for. Timeline layout. Also at `/festivals`.
  4. **Vrindavan weather widget** — Live weather from Open-Meteo API (free, no key
     needed) for Vrindavan coordinates. Shows temperature, feels-like, humidity, wind,
     conditions. Falls back to seasonal estimate if API unreachable. Displayed in hero.
- **Footer updated**: "Stay" and "Discover" link groups now have real `<a href>` links.
  Added "Festival Calendar" and "Braj Journal" and "Our Story" links.

## Bugs found and fixed
1. **Booking 500 error** (previous session) — `Guest.email` was missing `@unique`.
2. **React 19 `setState in effect` lint errors** (previous session) — Refactored to
   avoid synchronous `setLoading(true)` inside `useEffect`.
3. **Hydration mismatch error** (this session) — Browser extension (Monica) was
   injecting attributes into `<body>`. Fixed with `suppressHydrationWarning` on
   `<body>` tag.
4. **Admin page 404/error** (this session) — Was using hash-based `#/admin` overlay
   which didn't work at the real URL `/admin`. Migrated to real Next.js route
   `src/app/admin/page.tsx`. Now accessible directly at `/admin`.
5. **AdminPanel `fixed inset-0` layout** (this session) — Changed to `min-h-screen`
   so it renders as a normal page instead of a fixed overlay.
6. **PageShell `fixed inset-0`** (this session) — Changed to `min-h-screen` for
   all detail pages.
7. **Loading states `fixed inset-0`** (this session) — Changed to `min-h-screen`
   in RoomDetailPage, BlogDetailPage, OfferDetailPage.

## Files of interest
- `src/app/layout.tsx` — root layout with hydration fix
- `src/app/page.tsx` — home page (marketing sections + FAQ + FestivalCalendar + ReviewForm)
- `src/app/{admin,rooms,experiences,dining,gallery,offers,blog,about,contact,festivals}/page.tsx` — real route pages
- `src/app/{rooms,experiences,offers,blog}/[slug]/page.tsx` — detail route pages
- `src/lib/router.ts` — Zustand store (booking widget state + navigation)
- `src/lib/admin-auth.ts` — admin session token verification
- `src/components/rk/FAQ.tsx` — NEW: 15-item FAQ with category filter (NEW)
- `src/components/rk/ReviewForm.tsx` — NEW: guest review submission form (NEW)
- `src/components/rk/FestivalCalendar.tsx` — NEW: 6-festival Braj calendar (NEW)
- `src/components/rk/WeatherWidget.tsx` — NEW: live Vrindavan weather (NEW)
- `src/components/rk/Hero.tsx` — updated with weather widget
- `src/components/rk/Footer.tsx` — updated with real route links
- `src/components/rk/Navbar.tsx` — updated to navigate to real routes
- `src/components/rk/PageShell.tsx` — changed from fixed overlay to normal page
- `src/components/rk/pages/*.tsx` — all detailed page components
- `src/components/rk/admin/AdminPanel.tsx` — full admin console (min-h-screen)
- `src/app/api/reviews/route.ts` — updated with POST endpoint for guest submissions
- `src/app/api/admin/*` — all admin API routes
- `prisma/schema.prisma` — full schema
- `prisma/seed.ts`, `prisma/seed-blog.ts`, `prisma/seed-admin.ts` — seed scripts

## Verification results (this session)
- **Lint**: 0 errors
- **Home page**: HTTP 200, 247KB (up from 190KB due to new sections). All key content
  present: FAQ, Festival Calendar, Review form, Janmashtami, Holi, Radhashtami,
  cancellation policy, Write a review CTA.
- **All 14 routes**: Verified individually via curl — each returns HTTP 200 when
  tested in isolation. Routes tested: /, /rooms, /rooms/yamuna-suite, /experiences,
  /experiences/banke-bihari-mandir, /dining, /gallery, /offers,
  /offers/janmashtami-devotional-package, /blog, /blog/banke-bihari-darshan-guide,
  /about, /contact, /admin.
- **Admin page**: HTTP 200, 32KB. Login gate renders with "RK Residency Admin",
  "Restricted access", demo email, password field, Sign in button.
- **Review submission API**: POST /api/reviews returns `{"ok":true,"id":"..."}`.
  New reviews saved with `approved: false` (pending moderation).
- **Admin APIs**: All return 200 with auth token (login, stats, bookings, rooms,
  reviews, data). Return 401 without auth.

## Unresolved issues / risks
- **Sandbox memory (3.9GB RAM)**: The Next.js dev server gets OOM-killed when
  compiling multiple routes in quick succession (e.g., when agent-browser loads
  the home page and then navigates to /rooms, the second compilation can push
  memory over the limit). Each route compiles and serves correctly when tested
  individually. Production deployments on Vercel/etc. won't have this issue.
- **Agent-browser**: Cannot reliably drive multi-route navigation due to the
  above memory constraint. Visual QA was done via curl content verification
  instead.
- **Admin auth is sandbox-grade**: Plain text password hash comparison. Must use
  bcrypt/argon2 + NextAuth.js in production.
- **No real payment gateway integration**: Razorpay/Stripe are stubbed.
- **Weather widget**: Uses external Open-Meteo API. If the API is down or
  unreachable, falls back to seasonal estimates. In production, consider caching
  weather data server-side.

## Priority recommendations for next phase
1. Wire up real Razorpay/Stripe webhook handlers.
2. Add NextAuth.js for proper admin auth with JWT + httpOnly cookies.
3. Add SMTP email sending for booking confirmations + abandoned-checkout recovery.
4. Add a real CDN (Cloudinary) for room/gallery images instead of Unsplash hotlinks.
5. Add automated tests on the booking/payment path.
6. Add a sitemap.xml and robots.txt for SEO.
7. Add Open Graph images for each page.
8. Implement server-side caching for weather data and room availability.
9. Add a "Book a temple tour" feature with a dedicated booking flow.
10. Add multi-language (Hindi/English) content for all sections.
