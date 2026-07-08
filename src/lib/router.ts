"use client";

import { create } from "zustand";

/**
 * Client-side router for the RK Residency single-page site.
 *
 * The sandbox constraint requires only `/` to be user-visible, so all
 * "separate pages" (room detail, gallery, offers, admin panel, etc.) are
 * rendered as full-screen overlays driven by this router. The route is
 * mirrored to `location.hash` so the browser back button and shareable
 * URLs keep working.
 *
 * Route shapes:
 *   "#/"                            → home (no overlay)
 *   "#/rooms"                       → all rooms listing
 *   "#/rooms/:slug"                 → single room detail
 *   "#/experiences"                 → all experiences
 *   "#/experiences/:slug"           → single experience detail
 *   "#/dining"                      → dining detail
 *   "#/gallery"                     → full gallery page
 *   "#/offers"                      → all offers
 *   "#/offers/:slug"                → single offer detail
 *   "#/blog"                        → blog/journal listing
 *   "#/blog/:slug"                  → single blog post
 *   "#/about"                       → about detail
 *   "#/contact"                     → contact detail
 *   "#/admin"                       → admin panel (login-gated)
 */

export type RouteName =
  | "home"
  | "rooms"
  | "room-detail"
  | "experiences"
  | "experience-detail"
  | "dining"
  | "gallery"
  | "offers"
  | "offer-detail"
  | "blog"
  | "blog-detail"
  | "about"
  | "contact"
  | "admin";

export interface RouterState {
  route: RouteName;
  param?: string; // slug for detail pages
  // Booking widget state (lifted here so any page can open it)
  bookingOpen: boolean;
  bookingRoomSlug?: string;
  openBooking: (roomSlug?: string) => void;
  closeBooking: () => void;
  // Navigation
  navigate: (route: RouteName, param?: string) => void;
  back: () => void;
  hydrateFromHash: () => void;
}

function parseHash(): { route: RouteName; param?: string } {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash || hash === "") return { route: "home" };
  const parts = hash.split("/").filter(Boolean);
  const [first, second] = parts;
  switch (first) {
    case "rooms":
      return second ? { route: "room-detail", param: second } : { route: "rooms" };
    case "experiences":
      return second ? { route: "experience-detail", param: second } : { route: "experiences" };
    case "dining":
      return { route: "dining" };
    case "gallery":
      return { route: "gallery" };
    case "offers":
      return second ? { route: "offer-detail", param: second } : { route: "offers" };
    case "blog":
      return second ? { route: "blog-detail", param: second } : { route: "blog" };
    case "about":
      return { route: "about" };
    case "contact":
      return { route: "contact" };
    case "admin":
      return { route: "admin" };
    default:
      return { route: "home" };
  }
}

function toHash(route: RouteName, param?: string): string {
  if (route === "home") return "#/";
  const base: Record<RouteName, string> = {
    home: "",
    rooms: "rooms",
    "room-detail": "rooms",
    experiences: "experiences",
    "experience-detail": "experiences",
    dining: "dining",
    gallery: "gallery",
    offers: "offers",
    "offer-detail": "offers",
    blog: "blog",
    "blog-detail": "blog",
    about: "about",
    contact: "contact",
    admin: "admin",
  };
  const path = base[route];
  return param ? `#/${path}/${param}` : `#/${path}`;
}

export const useRouter = create<RouterState>((set, get) => ({
  route: "home",
  param: undefined,
  bookingOpen: false,
  bookingRoomSlug: undefined,
  openBooking: (roomSlug) =>
    set({ bookingOpen: true, bookingRoomSlug: roomSlug }),
  closeBooking: () => set({ bookingOpen: false, bookingRoomSlug: undefined }),
  navigate: (route, param) => {
    const hash = toHash(route, param);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    set({ route, param });
    // Scroll to top on navigation (not on home, where we scroll to section)
    if (route !== "home") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  },
  back: () => window.history.back(),
  hydrateFromHash: () => {
    const { route, param } = parseHash();
    set({ route, param });
  },
}));

/** Subscribe to hashchange (call once on app mount). */
export function initRouter() {
  if (typeof window === "undefined") return;
  const handler = () => useRouter.getState().hydrateFromHash();
  window.addEventListener("hashchange", handler);
  // Hydrate on first load
  useRouter.getState().hydrateFromHash();
  return () => window.removeEventListener("hashchange", handler);
}

/** Helper hook for components to render the right link href. */
export function routeHref(route: RouteName, param?: string): string {
  return toHash(route, param);
}
