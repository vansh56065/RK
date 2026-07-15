import { AdminPanelClient } from "@/components/rk/admin/AdminPanelClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Admin Console — RK Residency",
  robots: { index: false, follow: false },
};

/**
 * Admin page — lightweight wrapper. The AdminPanelClient component handles
 * login first, then fetches data client-side via the consolidated API.
 * This prevents the server from trying to fetch 14 DB queries during
 * page compilation (which causes OOM).
 */
export default function AdminRoute() {
  return <AdminPanelClient />;
}
