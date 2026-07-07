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
- Headings: Playfair Display / Cormorant Garamond / Marcellus (serif)
- Body/UI: Inter / Work Sans / Sora (humanist sans)
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

## Tech decisions
- Single-page `/` route with anchor sections (Hero, About, Rooms, Experiences, Dining,
  Amenities, Gallery, Offers, Testimonials, Booking, Contact) + a top-of-page sticky
  booking widget and floating WhatsApp.
- Framer Motion (already installed) for component/scroll motion + reduced-motion respect.
- Prisma models for rooms, bookings, guests, reviews, newsletter, contact, offers, blog.
- API routes under `src/app/api/*` for rooms, bookings, newsletter, contact, reviews.

---
Task ID: 0
Agent: main
Task: Bootstrap worklog, design system, schema, image generation kickoff.

Work Log:
- Read uploaded PDF brief (11 pages) — extracted full requirements.
- Audited existing scaffold (Next 16.1.3, Turbopack running on :3000).
- Defined Vrindavan design tokens (Section 4) above.
- Created TodoWrite plan with 17 tasks.

Stage Summary:
- Project brief fully understood.
- Design system + image generation + section build plan in place.
- Starting with design system + Prisma schema, then parallel image gen.

---
Task ID: 3
Agent: image-generation
Task: Generate brand images for RK Residency

Work Log:
- Loaded `image-generation` skill and reviewed z-ai CLI usage (`z-ai image -p <prompt> -o <path> -s <size>`).
- Created output directory `/home/z/my-project/public/images/`.
- NOTE: Skill docs list `1440x720` and `720x1440` as supported, but the upstream API rejects them
  (HTTP 400: width/height must be multiples of 32 within 512–2880px; 720 is not a multiple of 32).
  Substituted the closest valid supported sizes for the wide-aspect images.
- Generated the following 5 on-brand cinematic hero/section images (all verified as valid JFIF/JPEG):

  | File               | Size (WxH)  | Bytes   | ~KB  | Purpose                          |
  |--------------------|-------------|---------|------|----------------------------------|
  | hero-vrindavan.jpg | 1344x768    | 120,005 | 117  | Hero background (Vrindavan skyline at sunrise) |
  | yamuna-aarti.jpg   | 1024x1024   |  99,812 |  97  | Signature Yamuna aarti section image |
  | satvik-dining.jpg  | 1152x864    | 160,798 | 157  | Satvik dining section (top-down thali) |
  | heritage-room.jpg  | 1152x864    | 124,505 | 122  | Heritage room interior showcase |
  | marigold-garland.jpg | 1344x768  | 148,205 | 145  | Decorative marigold garland texture/banner |

- All prompts followed brand palette (peacock teal #0E4C4F, temple gold #C7A250, warm ivory
  #FBF6EC, marigold orange), included "no text" instructions, and used cinematic photography style.
- One transient timeout on the first `yamuna-aarti.jpg` attempt ("context deadline exceeded") —
  retried successfully on the second attempt with a longer timeout.
- All files confirmed present in `/home/z/my-project/public/images/` and verified via `file` to
  be valid baseline JPEGs at the expected pixel dimensions.

Stage Summary:
Generated image paths (ready for main UI to reference via `/images/<filename>`):
- `/home/z/my-project/public/images/hero-vrindavan.jpg`       (1344x768, ~117 KB)  — Hero section background
- `/home/z/my-project/public/images/yamuna-aarti.jpg`         (1024x1024, ~97 KB)  — Yamuna Aarti signature section
- `/home/z/my-project/public/images/satvik-dining.jpg`        (1152x864, ~157 KB)  — Dining / Satvik thali section
- `/home/z/my-project/public/images/heritage-room.jpg`        (1152x864, ~122 KB)  — Rooms / Heritage suite showcase
- `/home/z/my-project/public/images/marigold-garland.jpg`     (1344x768, ~145 KB)  — Decorative garland texture/divider banner
