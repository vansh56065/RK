import { AdminPanel } from "@/components/rk/admin/AdminPanel";

export const metadata = {
  title: "Admin Console — RK Residency",
  robots: { index: false, follow: false },
};

export default function AdminRoute() {
  return <AdminPanel />;
}
