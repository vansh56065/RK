"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { BookingWidget } from "@/components/rk/BookingWidget";
import { useRouter, initRouter } from "@/lib/router";
import type { Room } from "@/components/rk/Rooms";

// Code-split everything so Turbopack compiles each in its own worker pass.
// This keeps the sandbox memory budget healthy on initial compile.
const HomeSections = lazy(() =>
  import("@/components/rk/HomeSections").then((m) => ({ default: m.HomeSections }))
);
const RoomDetailPage = lazy(() => import("@/components/rk/pages/RoomDetailPage").then(m => ({ default: m.RoomDetailPage })));
const RoomsListPage = lazy(() => import("@/components/rk/pages/RoomsListPage").then(m => ({ default: m.RoomsListPage })));
const ExperiencesListPage = lazy(() => import("@/components/rk/pages/ExperiencesPages").then(m => ({ default: m.ExperiencesListPage })));
const ExperienceDetailPage = lazy(() => import("@/components/rk/pages/ExperiencesPages").then(m => ({ default: m.ExperienceDetailPage })));
const OffersListPage = lazy(() => import("@/components/rk/pages/OffersPages").then(m => ({ default: m.OffersListPage })));
const OfferDetailPage = lazy(() => import("@/components/rk/pages/OffersPages").then(m => ({ default: m.OfferDetailPage })));
const GalleryPage = lazy(() => import("@/components/rk/pages/GalleryPage").then(m => ({ default: m.GalleryPage })));
const DiningPage = lazy(() => import("@/components/rk/pages/DiningPage").then(m => ({ default: m.DiningPage })));
const BlogListPage = lazy(() => import("@/components/rk/pages/BlogPages").then(m => ({ default: m.BlogListPage })));
const BlogDetailPage = lazy(() => import("@/components/rk/pages/BlogPages").then(m => ({ default: m.BlogDetailPage })));
const AboutPage = lazy(() => import("@/components/rk/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/components/rk/pages/ContactPage").then(m => ({ default: m.ContactPage })));
const AdminPanel = lazy(() => import("@/components/rk/admin/AdminPanel").then(m => ({ default: m.AdminPanel })));

function OverlayFallback() {
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-ivory">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
    </div>
  );
}

export default function Home() {
  const route = useRouter((s) => s.route);
  const param = useRouter((s) => s.param);
  const bookingOpen = useRouter((s) => s.bookingOpen);
  const bookingRoomSlug = useRouter((s) => s.bookingRoomSlug);
  const openBooking = useRouter((s) => s.openBooking);
  const closeBooking = useRouter((s) => s.closeBooking);

  const [rooms, setRooms] = useState<Room[]>([]);

  // Init router (hashchange listener) once
  useEffect(() => {
    const cleanup = initRouter();
    return cleanup;
  }, []);

  // Load rooms once (used by booking widget preselect)
  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => setRooms(data.rooms || []))
      .catch(() => {});
  }, []);

  const openBookingCb = useCallback(() => openBooking(), [openBooking]);
  const openBookingWithRoom = useCallback((room: Room) => openBooking(room.slug), [openBooking]);

  const preselectRoom = bookingRoomSlug
    ? rooms.find((r) => r.slug === bookingRoomSlug) || null
    : null;

  const isHome = route === "home";

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hotel",
            name: "RK Residency",
            description:
              "Heritage-luxury residency in Vrindavan on the banks of the Yamuna. Spiritual luxury for pilgrims, devotee families and cultural travellers.",
            starRating: { "@type": "Rating", ratingValue: "5" },
            priceRange: "₹5,800 – ₹28,000",
            telephone: "+91-565-234-5678",
            email: "stay@rkresidency.in",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Parikrama Marg, Vrindavan",
              addressLocality: "Vrindavan",
              addressRegion: "Uttar Pradesh",
              postalCode: "281121",
              addressCountry: "IN",
            },
            geo: { "@type": "GeoCoordinates", latitude: 27.5756, longitude: 77.7100 },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1240" },
          }),
        }}
      />

      {isHome && (
        <Suspense fallback={<OverlayFallback />}>
          <HomeSections onBook={openBookingCb} onBookRoom={openBookingWithRoom} />
        </Suspense>
      )}

      {/* Booking widget — accessible from any route */}
      <BookingWidget
        open={bookingOpen}
        onOpenChange={(o) => (o ? openBooking() : closeBooking())}
        preselectRoom={preselectRoom}
      />

      {/* Overlay "pages" */}
      <AnimatePresence>
        {route !== "home" && (
          <Suspense fallback={<OverlayFallback />}>
            {route === "rooms" && <RoomsListPage key="rooms-list" />}
            {route === "room-detail" && param && <RoomDetailPage key={`room-${param}`} slug={param} />}
            {route === "experiences" && <ExperiencesListPage key="experiences-list" />}
            {route === "experience-detail" && param && <ExperienceDetailPage key={`exp-${param}`} slug={param} />}
            {route === "dining" && <DiningPage key="dining" />}
            {route === "gallery" && <GalleryPage key="gallery" />}
            {route === "offers" && <OffersListPage key="offers-list" onBookClick={openBookingCb} />}
            {route === "offer-detail" && param && <OfferDetailPage key={`offer-${param}`} slug={param} onBookClick={openBookingCb} />}
            {route === "blog" && <BlogListPage key="blog-list" />}
            {route === "blog-detail" && param && <BlogDetailPage key={`blog-${param}`} slug={param} />}
            {route === "about" && <AboutPage key="about" />}
            {route === "contact" && <ContactPage key="contact" />}
            {route === "admin" && <AdminPanel key="admin" />}
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
