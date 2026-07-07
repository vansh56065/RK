"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/rk/Navbar";
import { Hero, TrustBadges } from "@/components/rk/Hero";
import { About } from "@/components/rk/About";
import { Rooms, type Room } from "@/components/rk/Rooms";
import { Experiences } from "@/components/rk/Experiences";
import { Dining } from "@/components/rk/Dining";
import { Gallery } from "@/components/rk/Gallery";
import { Offers } from "@/components/rk/Offers";
import { Testimonials } from "@/components/rk/Testimonials";
import { BookingWidget } from "@/components/rk/BookingWidget";
import { Contact } from "@/components/rk/Contact";
import { Footer } from "@/components/rk/Footer";
import { FloatingWhatsApp, ExitIntentModal } from "@/components/rk/FloatingActions";

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectRoom, setPreselectRoom] = useState<Room | null>(null);

  const openBooking = useCallback(() => {
    setPreselectRoom(null);
    setBookingOpen(true);
  }, []);

  const openBookingWithRoom = useCallback((room: Room) => {
    setPreselectRoom(room);
    setBookingOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      {/* Structured data for SEO — Hotel / LodgingBusiness */}
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
            geo: {
              "@type": "GeoCoordinates",
              latitude: 27.5756,
              longitude: 77.7100,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "1240",
            },
          }),
        }}
      />

      <Navbar onBookClick={openBooking} />

      <main className="flex-1">
        <Hero onBookClick={openBooking} />
        <TrustBadges />
        <About />
        <Rooms onBookRoom={openBookingWithRoom} />
        <Experiences />
        <Dining />
        <Gallery />
        <Offers onBookClick={openBooking} />
        <Testimonials />
        <Contact />
      </main>

      <Footer />

      {/* Floating / overlay UI */}
      <FloatingWhatsApp />
      <ExitIntentModal onBookClick={openBooking} />
      <BookingWidget
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        preselectRoom={preselectRoom}
      />
    </div>
  );
}
