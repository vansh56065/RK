# RK Residency — Heritage Luxury Hotel Website — Worklog

## Project Overview
Building a full-stack, production-grade website for **RK Residency**, a heritage-luxury
residency in Vrindavan, Uttar Pradesh, India. Positioning: "Spiritual luxury" for pilgrims,
devotee families and cultural travellers.

## Architecture (real Next.js App Router routes)
- **Real Next.js App Router routes** (no longer hash-based):
  - `/` — home (marketing sections + FAQ + FestivalCalendar + TempleTour + ReviewForm + Weather)
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
- **SEO**: sitemap.xml (dynamic, includes all rooms/offers/blog/experiences), robots.txt
  (disallows /admin + /api/admin), Open Graph images, Twitter cards, JSON-LD structured
  data (Hotel, FAQPage, BreadcrumbList).
- **Visitor tracking**: Every page view tracked via `POST /api/track`. PageView records
  stored in Prisma. Anonymous session ID in sessionStorage.
- **Admin analytics**: `/api/admin/analytics` returns today's KPIs, 7-day traffic, monthly
  trend, top pages, top referrers, booking funnel, SEO keywords.

## Current project status (this session)
- **Lint: PASS** (0 errors)
- **Analytics OOM FIXED**: The `/api/admin/analytics` route was making 40+ Prisma queries
  (7 days × 2 queries + 6 months × 3 queries + others), causing OOM-kill in the sandbox.
  Rewrote to fetch ALL page views for last 30 days in a SINGLE query, then compute all
  daily/monthly breakdowns in JavaScript. Now uses only ~10 queries instead of 40+.
- **SEO infrastructure added**:
  1. **sitemap.xml** — dynamic, generated from database. Includes all static pages +
     dynamic room/offer/blog/experience URLs with lastModified, changeFrequency, priority.
  2. **robots.txt** — allows all crawlers, disallows /admin and /api/admin, points to
     sitemap.
  3. **Open Graph images** — added to layout metadata with hero image (1344×768).
  4. **Twitter card** — summary_large_image with hero image.
  5. **JSON-LD structured data** — FAQPage (4 Q&As for rich snippets) + BreadcrumbList
     added to home page. Hotel schema already present.
- **New features added**:
  1. **Temple Tour booking** — New section on home page with 4 tour types (Private Temple
     Circuit ₹2,500, Guided Walking Yatra ₹1,200, Yamuna Boat + Aarti ₹1,500, Full-Day
     Guided Braj Tour ₹4,500). Tour selection cards + booking form (name, email, phone,
     date, guests, language, special requests). Creates a ContactMessage with topic
     "BOOKING" for admin follow-up. Diya-glow confirmation animation.
  2. **Scroll progress bar** — Thin gold gradient bar at top of page that fills as user
     scrolls. Uses framer-motion useScroll + useSpring.
  3. **Back-to-top button** — Appears after scrolling 600px. Smooth scroll to top.
- **Bugs fixed this session**:
  1. `Boat` icon doesn't exist in lucide-react — replaced with `Ship`.
  2. `public/robots.txt` conflicted with `src/app/robots.ts` — removed the public file.
  3. `robots.ts` needed `default export` (not named `GET`) — rewrote as MetadataRoute.Robots.
  4. `sitemap.ts` needed `default export` returning `MetadataRoute.Sitemap` — rewrote.

## Files of interest (this session)
- `src/app/sitemap.ts` — NEW: dynamic sitemap.xml (rooms, offers, blog, experiences)
- `src/app/robots.ts` — NEW: robots.txt (disallows admin, points to sitemap)
- `src/components/rk/TempleTour.tsx` — NEW: 4 tour types + booking form + diya confirmation
- `src/components/rk/ScrollProgress.tsx` — NEW: scroll progress bar + back-to-top button
- `src/app/api/tour-booking/route.ts` — NEW: public POST endpoint for temple tour bookings
- `src/app/api/admin/analytics/route.ts` — OPTIMIZED: single-query approach (was 40+ queries)
- `src/app/layout.tsx` — updated with Open Graph + Twitter card images
- `src/app/page.tsx` — added TempleTour, ScrollProgress, FAQPage JSON-LD, BreadcrumbList JSON-LD

## Verification results (this session)
- **Lint**: 0 errors
- **Home page**: HTTP 200, 280KB (up from 247KB due to TempleTour section). All key
  content present: Temple Tour section, 4 tour types, FAQ structured data, BreadcrumbList,
  Open Graph image, Twitter card.
- **Admin analytics API**: Returns 106 today views, 106 unique visitors, 7-day chart,
  10 top pages, 4 referrers, 6-month trend, 12 SEO keywords, 0.2% conversion rate.
- **Sitemap**: Returns valid XML with all static + dynamic URLs.
- **Robots.txt**: Returns correct content (allow /, disallow /admin, sitemap reference).
- **Admin APIs**: All return 200 with auth token (login, stats, analytics, bookings,
  rooms, offers, blog, reviews, data).

## Unresolved issues / risks
- **Sandbox memory (3.9GB RAM)**: Server can OOM-kill when compiling multiple new routes
  in quick succession. Each route works when tested individually. The analytics route
  was optimized to use fewer queries.
- **Admin auth is sandbox-grade**: Plain text password hash. Production needs bcrypt + NextAuth.
- **No real payment gateway**: Razorpay/Stripe stubbed.
- **Analytics queries**: The single-query + JS computation approach works well for the
  sandbox's data volume (~500 page views). For production scale, use DailyAnalytics
  aggregation or a proper analytics DB.

## Priority recommendations for next phase
1. Wire up real Razorpay/Stripe webhook handlers.
2. Add NextAuth.js for proper admin auth.
3. Add SMTP email for booking confirmations + tour booking confirmations.
4. Add Open Graph images per page (not just the hero image for all pages).
5. Implement `DailyAnalytics` aggregation job (run nightly to pre-compute daily stats).
6. Add Google Search Console integration for real SEO keyword data.
7. Add multi-language (Hindi/English) content for all sections.
8. Add a room availability calendar on the room detail page.
9. Add a "Book a Temple Tour" confirmation email with meeting point + what to bring.
10. Add structured data for Review (individual reviews) and Article (blog posts).
