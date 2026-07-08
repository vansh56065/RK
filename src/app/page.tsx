"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/rk/Navbar";
import { Hero, TrustBadges } from "@/components/rk/Hero";
import { About } from "@/components/rk/About";
import { Rooms, type Room } from "@/components/rk/Rooms";
import { Experiences } from "@/components/rk/Experiences";
import { Dining } from "@/components/rk/Dining";
import { Gallery } from "@/components/rk/Gallery";
import { Offers } from "@/components/rk/Offers";
import { Testimonials } from "@/components/rk/Testimonials";
import { FestivalCalendar } from "@/components/rk/FestivalCalendar";
import { TempleTour } from "@/components/rk/TempleTour";
import { FAQ } from "@/components/rk/FAQ";
import { ReviewForm } from "@/components/rk/ReviewForm";
import { BookingWidget } from "@/components/rk/BookingWidget";
import { Contact } from "@/components/rk/Contact";
import { Footer } from "@/components/rk/Footer";
import { FloatingWhatsApp, ExitIntentModal } from "@/components/rk/FloatingActions";
import { ScrollProgress } from "@/components/rk/ScrollProgress";
import { LiveChat } from "@/components/rk/LiveChat";
import { useRouter } from "@/lib/router";
import type { Room as RoomType } from "@/components/rk/Rooms";

export default function Home() {
  const bookingOpen = useRouter((s) => s.bookingOpen);
  const bookingRoomSlug = useRouter((s) => s.bookingRoomSlug);
  const openBooking = useRouter((s) => s.openBooking);
  const closeBooking = useRouter((s) => s.closeBooking);

  const [rooms, setRooms] = useState<RoomType[]>([]);

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => setRooms(data.rooms || []))
      .catch(() => {});
  }, []);

  const openBookingCb = useCallback(() => openBooking(), [openBooking]);
  const openBookingWithRoom = useCallback((room: RoomType) => openBooking(room.slug), [openBooking]);

  const preselectRoom = bookingRoomSlug
    ? rooms.find((r) => r.slug === bookingRoomSlug) || null
    : null;

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

      {/* FAQ structured data for SEO rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is your cancellation policy?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Free cancellation up to 72 hours before check-in. Cancellations within 72 hours forfeit one night's charge. Festival periods (Janmashtami, Holi, Radhashtami) have a 7-day cancellation window.",
                },
              },
              {
                "@type": "Question",
                name: "Is the food pure vegetarian?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, our kitchen is strictly satvik — no onion, no garlic, no eggs, no meat. Vegan and Jain options available on request.",
                },
              },
              {
                "@type": "Question",
                name: "Can you arrange darshan passes for Banke Bihari?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Our concierge arranges reserved VIP darshan passes for Banke Bihari Mandir and ISKCON. 24 hours' notice required. Complimentary for stays of 2+ nights.",
                },
              },
              {
                "@type": "Question",
                name: "What time is check-in and check-out?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in from 10 AM and late check-out till 2 PM available on request.",
                },
              },
            ],
          }),
        }}
      />

      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://rkresidency.in/" },
            ],
          }),
        }}
      />

      <ScrollProgress />
      <Navbar onBookClick={openBookingCb} />

      <main className="flex-1">
        <Hero onBookClick={openBookingCb} />
        <TrustBadges />
        <About />
        <Rooms onBookRoom={openBookingWithRoom} />
        <Experiences />
        <Dining />
        <Gallery />
        <Offers onBookClick={openBookingCb} />
        <Testimonials />
        <FestivalCalendar />
        <TempleTour />
        <ReviewForm />
        <FAQ />
        <Contact />
      </main>

      <Footer />

      {/* Floating / overlay UI */}
      <FloatingWhatsApp />
      <LiveChat />
      <ExitIntentModal onBookClick={openBookingCb} />

      {/* Booking widget — accessible from any route via the store */}
      <BookingWidget
        open={bookingOpen}
        onOpenChange={(o) => (o ? openBooking() : closeBooking())}
        preselectRoom={preselectRoom}
      />
    </div>
  );
}
