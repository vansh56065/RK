"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, BedDouble, Star, Mail, Newspaper,
  ScrollText, LogOut, Lock, Loader2, Menu, X, Search,
  TrendingUp, IndianRupee, Percent, Users, ArrowDownToLine, ArrowUpFromLine,
  Check, Eye, EyeOff, ShieldCheck, Edit, Trash2, Plus, Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Logo, Lotus } from "../Motifs";
import { useRouter } from "@/lib/router";
import { toast } from "sonner";

type AdminUser = { id: string; email: string; name: string; role: string };
type Tab = "dashboard" | "bookings" | "rooms" | "reviews" | "newsletter" | "messages" | "audit";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "rooms", label: "Rooms & Rates", icon: BedDouble },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "messages", label: "Messages", icon: ScrollText },
  { id: "audit", label: "Audit Log", icon: ShieldCheck },
];

export function AdminPanel() {
  const navigate = useRouter((s) => s.navigate);
  // Lazy initializer reads localStorage once on first render — no effect needed
  const [stored, setStored] = useState<AdminUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = localStorage.getItem("rk_admin");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const authed = stored !== null;
  const admin = stored;
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = useCallback((a: AdminUser) => {
    localStorage.setItem("rk_admin", JSON.stringify(a));
    setStored(a);
  }, []);

  const handleLogout = useCallback(async () => {
    try { await fetch("/api/admin/auth", { method: "DELETE" }); } catch {}
    localStorage.removeItem("rk_admin");
    setStored(null);
    navigate("home");
  }, [navigate]);

  if (!authed) {
    return <AdminLogin onLogin={handleLogin} onBack={() => navigate("home")} />;
  }

  return (
    <div className="fixed inset-0 z-[70] flex bg-ivory">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-charcoal text-ivory transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-ivory/10 p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-ivory/5 text-gold">
                <Logo size={20} />
              </span>
              <div>
                <div className="font-serif text-sm font-semibold text-ivory">RK Residency</div>
                <div className="font-display text-[9px] uppercase tracking-[0.24em] text-gold-soft">Admin Console</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full border border-ivory/15 text-ivory/70 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm transition-all focus-ring ${
                  tab === t.id
                    ? "bg-gold/15 text-gold-soft"
                    : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
                }`}
                aria-pressed={tab === t.id}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-ivory/10 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/20 font-serif text-sm font-bold text-gold-soft">
                {admin?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-serif text-sm font-semibold text-ivory">{admin?.name}</div>
                <div className="truncate font-display text-[10px] text-ivory/60">
                  {admin?.role === "SUPER_ADMIN" ? "Super Admin" : admin?.role}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-ivory/15 px-3 py-2 font-display text-xs font-semibold text-ivory/80 transition-colors hover:border-marsala hover:bg-marsala hover:text-ivory"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-charcoal/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="scrollbar-thin flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-charcoal/10 bg-ivory/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-serif text-lg font-semibold text-charcoal">
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="font-display text-[10px] uppercase tracking-wider text-charcoal-soft">
                RK Residency · Admin Console
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("home")}
            className="rounded-full border border-charcoal/15 bg-white px-3 py-1.5 font-display text-xs font-semibold text-charcoal-soft transition-colors hover:bg-ivory-deep"
          >
            View site
          </button>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "dashboard" && <DashboardTab />}
              {tab === "bookings" && <BookingsTab />}
              {tab === "rooms" && <RoomsTab />}
              {tab === "reviews" && <ReviewsTab />}
              {tab === "newsletter" && <NewsletterTab />}
              {tab === "messages" && <MessagesTab />}
              {tab === "audit" && <AuditTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// =================== LOGIN ===================

function AdminLogin({ onLogin, onBack }: { onLogin: (a: AdminUser) => void; onBack: () => void }) {
  const [email, setEmail] = useState("admin@rkresidency.in");
  const [password, setPassword] = useState("rk-admin-2026");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLogin(data.admin);
      toast.success(`Welcome, ${data.admin.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setError(msg);
      toast.error("Login failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-charcoal p-4">
      <div className="pointer-events-none absolute inset-0 bg-yamuna-ripple opacity-15" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-ivory shadow-2xl"
      >
        <div className="border-b border-charcoal/10 bg-teal px-6 py-5 text-ivory">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-ivory/5 text-gold">
              <Logo size={24} />
            </span>
            <div>
              <div className="font-serif text-lg font-semibold">RK Residency Admin</div>
              <div className="font-display text-[10px] uppercase tracking-[0.28em] text-gold-soft">
                Restricted access
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          <div>
            <Label htmlFor="a-email" className="mb-1.5 block font-display text-xs uppercase tracking-wider text-charcoal-soft">
              Email
            </Label>
            <Input
              id="a-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-ivory-deep/40"
            />
          </div>
          <div>
            <Label htmlFor="a-pass" className="mb-1.5 block font-display text-xs uppercase tracking-wider text-charcoal-soft">
              Password
            </Label>
            <div className="relative">
              <Input
                id="a-pass"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-ivory-deep/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-soft hover:text-charcoal"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-marsala/30 bg-marsala/5 px-3 py-2 font-display text-xs text-marsala">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-teal py-3 font-serif text-base font-semibold text-ivory hover:bg-teal-deep disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              <><Lock className="mr-2 h-4 w-4" /> Sign in</>
            )}
          </Button>

          <div className="rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 font-display text-[11px] leading-relaxed text-charcoal-soft">
            <strong className="text-gold-deep">Demo credentials</strong> — admin@rkresidency.in / rk-admin-2026
          </div>

          <button
            type="button"
            onClick={onBack}
            className="block w-full text-center font-display text-xs text-charcoal-soft hover:text-charcoal"
          >
            ← Back to website
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// =================== DASHBOARD ===================

function DashboardTab() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof loadStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats().then((s) => { setStats(s); setLoading(false); });
  }, []);

  if (loading || !stats) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Percent}
          label="Occupancy (next 30 days)"
          value={`${stats.occupancyPct}%`}
          accent="teal"
        />
        <KpiCard
          icon={IndianRupee}
          label="Total revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          sub={`ADR ₹${stats.adr.toLocaleString("en-IN")} · RevPAR ₹${stats.revpar.toLocaleString("en-IN")}`}
          accent="gold"
        />
        <KpiCard
          icon={CalendarDays}
          label="Total bookings"
          value={stats.totalBookings.toString()}
          sub={`${stats.cancelledBookings} cancelled`}
          accent="marsala"
        />
        <KpiCard
          icon={Users}
          label="Today"
          value={`${stats.arrivalsToday}/${stats.departuresToday}`}
          sub="arrivals / departures"
          accent="teal"
        />
      </div>

      {/* Revenue trend chart */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-semibold text-charcoal">Revenue trend</h3>
            <p className="font-display text-xs text-charcoal-soft">Last 7 days</p>
          </div>
          <TrendingUp className="h-5 w-5 text-teal" />
        </div>
        <div className="flex h-44 items-end justify-between gap-2 sm:gap-4">
          {stats.revenueTrend.map((d) => {
            const max = Math.max(...stats.revenueTrend.map((x) => x.revenue), 1);
            const h = Math.max(4, (d.revenue / max) * 100);
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="text-[10px] font-semibold text-charcoal-soft">
                  {d.revenue > 0 ? `₹${(d.revenue / 1000).toFixed(0)}k` : ""}
                </div>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-teal to-teal-soft transition-all"
                    style={{ height: `${h}%` }}
                    title={`${d.bookings} bookings · ₹${d.revenue}`}
                  />
                </div>
                <div className="font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Room type breakdown */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
        <h3 className="mb-4 font-serif text-base font-semibold text-charcoal">Bookings &amp; revenue by room</h3>
        <div className="space-y-3">
          {stats.roomTypeStats.map((r) => {
            const maxRev = Math.max(...stats.roomTypeStats.map((x) => x.revenue), 1);
            return (
              <div key={r.roomId}>
                <div className="mb-1 flex items-center justify-between font-display text-xs">
                  <span className="font-semibold text-charcoal">{r.roomName}</span>
                  <span className="text-charcoal-soft">
                    {r.bookings} bookings · ₹{r.revenue.toLocaleString("en-IN")} · {r.occupancy}% occ
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ivory-deep">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft"
                    style={{ width: `${(r.revenue / maxRev) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

async function loadStats() {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

// =================== BOOKINGS ===================

function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (search) params.set("search", search);
    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setBookings(data.bookings || []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [statusFilter, search]);

  const reload = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (search) params.set("search", search);
    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      });
  }, [statusFilter, search]);

  const action = async (id: string, a: string) => {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: a }),
    });
    if (res.ok) {
      toast.success(`Booking ${a.toLowerCase().replace("_", " ")}`);
      reload();
    } else {
      toast.error("Action failed");
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    CONFIRMED: "bg-teal/10 text-teal",
    CHECKED_IN: "bg-gold/15 text-gold-deep",
    CHECKED_OUT: "bg-charcoal/10 text-charcoal-soft",
    CANCELLED: "bg-marsala/10 text-marsala",
    NO_SHOW: "bg-marsala/10 text-marsala",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-soft" />
          <Input
            placeholder="Search by reference, name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full bg-white sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CHECKED_IN">Checked in</SelectItem>
            <SelectItem value="CHECKED_OUT">Checked out</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-charcoal/10 bg-ivory-deep font-display text-[10px] uppercase tracking-wider text-charcoal-soft">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pay</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8 font-display text-xs">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-charcoal-soft">Loading…</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-charcoal-soft">No bookings found.</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="hover:bg-ivory-deep/30">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-teal">{b.referenceCode}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-charcoal">{b.guestName}</div>
                    <div className="text-[10px] text-charcoal-soft">{b.guestEmail}</div>
                    <div className="text-[10px] text-charcoal-soft">{b.guestPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-soft">{b.room?.name || "—"}</td>
                  <td className="px-4 py-3 text-charcoal-soft">
                    <div>{new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → {new Date(b.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    <div className="text-[10px]">{b.nights}n · {b.adults}a {b.children > 0 && `· ${b.children}c`}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-serif text-sm font-bold text-teal">₹{b.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[b.status] || "bg-charcoal/10"}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      b.paymentStatus === "PAID" ? "bg-teal/10 text-teal" :
                      b.paymentStatus === "REFUNDED" ? "bg-marsala/10 text-marsala" :
                      "bg-gold/15 text-gold-deep"
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {b.status === "CONFIRMED" && (
                        <ActionBtn label="Check-in" icon={ArrowDownToLine} onClick={() => action(b.id, "CHECK_IN")} />
                      )}
                      {b.status === "CHECKED_IN" && (
                        <ActionBtn label="Check-out" icon={ArrowUpFromLine} onClick={() => action(b.id, "CHECK_OUT")} />
                      )}
                      {b.paymentStatus === "PENDING" && (
                        <ActionBtn label="Mark paid" icon={IndianRupee} onClick={() => action(b.id, "MARK_PAID")} color="teal" />
                      )}
                      {b.status !== "CANCELLED" && b.status !== "CHECKED_OUT" && (
                        <ActionBtn label="Cancel" icon={X} onClick={() => action(b.id, "CANCEL")} color="marsala" />
                      )}
                      {b.paymentStatus === "PAID" && (
                        <ActionBtn label="Refund" icon={IndianRupee} onClick={() => action(b.id, "REFUND")} color="marsala" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =================== ROOMS ===================

function RoomsTab() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const reload = useCallback(() => {
    fetch("/api/admin/rooms")
      .then((r) => r.json())
      .then((data) => {
        setRooms(data.rooms || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/rooms")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setRooms(data.rooms || []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const save = async (room: any) => {
    const method = room.id ? "PATCH" : "POST";
    const res = await fetch("/api/admin/rooms", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    });
    if (res.ok) {
      toast.success(room.id ? "Room updated" : "Room created");
      setEditing(null);
      reload();
    } else {
      toast.error("Save failed");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/rooms?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Room deleted");
      reload();
    } else toast.error("Delete failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-charcoal-soft">
          {rooms.length} rooms · manage rates, inventory &amp; amenities
        </p>
        <Button
          onClick={() => setEditing({ slug: "", name: "", tagline: "", description: "", longDescription: "", basePrice: 5000, maxGuests: 2, sizeSqft: 300, bedType: "Queen", view: "Garden", imageUrls: "[]", amenities: "[]", totalCount: 4, badge: null, featured: false, sortOrder: rooms.length + 1 })}
          className="rounded-full bg-teal px-4 py-2 text-sm text-ivory hover:bg-teal-deep"
        >
          <Plus className="mr-1 h-4 w-4" /> New room
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-charcoal-soft">Loading…</div>
        ) : rooms.map((r) => {
          const imgs: string[] = JSON.parse(r.imageUrls || "[]");
          return (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
              <div className="relative h-32 overflow-hidden">
                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${imgs[0] || "/images/heritage-room.jpg"})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="font-serif text-sm font-semibold text-ivory">{r.name}</div>
                  <div className="font-serif text-base font-bold text-gold-soft">₹{r.basePrice.toLocaleString("en-IN")}/night</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="font-display text-[11px] text-charcoal-soft">
                  {r.totalCount} inventory · {r.maxGuests} guests · {r.sizeSqft} sq.ft
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(r)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-teal hover:text-ivory" aria-label="Edit">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => del(r.id)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-marsala hover:text-ivory" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <RoomEditor room={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function RoomEditor({ room, onClose, onSave }: { room: any; onClose: () => void; onSave: (r: any) => void }) {
  const [form, setForm] = useState(room);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-charcoal/70 p-4" onClick={onClose}>
      <div className="scrollbar-thin max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-ivory p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-charcoal">{room.id ? "Edit room" : "New room"}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
          <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
          <Field label="Bed type" value={form.bedType} onChange={(v) => set("bedType", v)} />
          <Field label="View" value={form.view} onChange={(v) => set("view", v)} />
          <Field label="Badge (or blank)" value={form.badge || ""} onChange={(v) => set("badge", v || null)} />
          <Field label="Base price (₹)" type="number" value={form.basePrice} onChange={(v) => set("basePrice", parseInt(v) || 0)} />
          <Field label="Max guests" type="number" value={form.maxGuests} onChange={(v) => set("maxGuests", parseInt(v) || 1)} />
          <Field label="Size (sq.ft)" type="number" value={form.sizeSqft} onChange={(v) => set("sizeSqft", parseInt(v) || 1)} />
          <Field label="Inventory count" type="number" value={form.totalCount} onChange={(v) => set("totalCount", parseInt(v) || 1)} />
          <Field label="Sort order" type="number" value={form.sortOrder} onChange={(v) => set("sortOrder", parseInt(v) || 0)} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} />
            <Label htmlFor="featured">Featured on home</Label>
          </div>
        </div>
        <div className="mt-3">
          <Field label="Short description" value={form.description} onChange={(v) => set("description", v)} />
        </div>
        <div className="mt-3">
          <Field label="Long description" textarea value={form.longDescription} onChange={(v) => set("longDescription", v)} />
        </div>
        <div className="mt-3">
          <Field label="Image URLs (JSON array)" textarea value={form.imageUrls} onChange={(v) => set("imageUrls", v)} />
        </div>
        <div className="mt-3">
          <Field label="Amenities (JSON array)" textarea value={form.amenities} onChange={(v) => set("amenities", v)} />
        </div>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => onSave(form)} className="rounded-full bg-teal px-6 py-2 text-ivory hover:bg-teal-deep">Save room</Button>
          <Button onClick={onClose} variant="outline" className="rounded-full">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// =================== REVIEWS ===================

function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setReviews(data.reviews || []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggle = async (id: string, action: "APPROVE" | "HIDE") => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      toast.success(action === "APPROVE" ? "Review approved" : "Review hidden");
      reload();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid gap-3">
      {reviews.map((r) => (
        <div key={r.id} className={`rounded-2xl border bg-white p-4 ${r.approved ? "border-teal/30" : "border-marsala/30"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-gold text-gold" : "text-charcoal/20"}`} />
                  ))}
                </div>
                <h4 className="font-serif text-sm font-semibold text-charcoal">{r.title}</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.approved ? "bg-teal/10 text-teal" : "bg-marsala/10 text-marsala"}`}>
                  {r.approved ? "Live" : "Hidden"}
                </span>
              </div>
              <p className="mt-1.5 font-display text-xs leading-relaxed text-charcoal-soft">{r.body}</p>
              <div className="mt-2 font-display text-[10px] text-charcoal-soft">
                — {r.guestName} {r.guestLocation && `· ${r.guestLocation}`} · {r.source} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {r.approved ? (
                <button onClick={() => toggle(r.id, "HIDE")} className="rounded-full border border-marsala/30 px-3 py-1 text-[10px] font-semibold text-marsala hover:bg-marsala hover:text-ivory">Hide</button>
              ) : (
                <button onClick={() => toggle(r.id, "APPROVE")} className="rounded-full border border-teal/30 px-3 py-1 text-[10px] font-semibold text-teal hover:bg-teal hover:text-ivory">Approve</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =================== NEWSLETTER ===================

function NewsletterTab() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data").then((r) => r.json()).then((d) => {
      setSubs(d.subscribers || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold text-charcoal">{subs.length} subscribers</h3>
        <button
          onClick={() => {
            const csv = "email,name,language,subscribedAt\n" + subs.map((s) => `${s.email},${s.name || ""},${s.language},${new Date(s.createdAt).toISOString()}`).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "rk-newsletter.csv"; a.click();
            URL.revokeObjectURL(url);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/15 px-3 py-1.5 font-display text-xs font-semibold text-charcoal-soft hover:bg-ivory-deep"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>
      <div className="scrollbar-thin max-h-[60vh] space-y-1 overflow-y-auto">
        {subs.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-b border-charcoal/5 py-2 last:border-0">
            <div>
              <div className="font-serif text-sm font-semibold text-charcoal">{s.email}</div>
              <div className="font-display text-[10px] text-charcoal-soft">{s.name || "—"} · {s.language}</div>
            </div>
            <div className="font-display text-[10px] text-charcoal-soft">
              {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== MESSAGES ===================

function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data").then((r) => r.json()).then((d) => {
      setMessages(d.messages || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className="rounded-2xl border border-charcoal/10 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-serif text-sm font-semibold text-charcoal">{m.subject}</div>
              <div className="font-display text-[10px] text-charcoal-soft">
                {m.name} · {m.email} {m.phone && `· ${m.phone}`} · {m.topic}
              </div>
            </div>
            <div className="font-display text-[10px] text-charcoal-soft">
              {new Date(m.createdAt).toLocaleString("en-IN")}
            </div>
          </div>
          <p className="mt-2 font-display text-xs leading-relaxed text-charcoal-soft">{m.message}</p>
          <a
            href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
            className="mt-3 inline-block rounded-full bg-teal px-3 py-1 font-display text-[10px] font-semibold text-ivory hover:bg-teal-deep"
          >
            Reply by email
          </a>
        </div>
      ))}
    </div>
  );
}

// =================== AUDIT LOG ===================

function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data").then((r) => r.json()).then((d) => {
      setLogs(d.auditLogs || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
      <h3 className="mb-4 font-serif text-base font-semibold text-charcoal">{logs.length} recent actions</h3>
      <div className="scrollbar-thin max-h-[65vh] space-y-1 overflow-y-auto font-mono text-[11px]">
        {logs.map((l) => (
          <div key={l.id} className="flex items-start gap-3 border-b border-charcoal/5 py-2 last:border-0">
            <span className="shrink-0 text-charcoal-soft">{new Date(l.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
            <span className="shrink-0 rounded bg-gold/15 px-1.5 py-0.5 font-semibold text-gold-deep">{l.action}</span>
            <span className="flex-1 text-charcoal">
              {l.details}
              {l.admin && <span className="text-charcoal-soft"> · by {l.admin.name}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== Shared ===================

function KpiCard({ icon: Icon, label, value, sub, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; accent: "teal" | "gold" | "marsala" }) {
  const color = accent === "gold" ? "bg-gold/10 text-gold-deep" : accent === "marsala" ? "bg-marsala/10 text-marsala" : "bg-teal/10 text-teal";
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-full ${color}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="font-serif text-2xl font-bold text-charcoal">{value}</div>
      <div className="font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{label}</div>
      {sub && <div className="mt-1 font-display text-[10px] text-charcoal-soft">{sub}</div>}
    </div>
  );
}

function ActionBtn({ label, icon: Icon, onClick, color = "teal" }: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; color?: "teal" | "marsala" }) {
  const c = color === "marsala" ? "border-marsala/30 text-marsala hover:bg-marsala hover:text-ivory" : "border-teal/30 text-teal hover:bg-teal hover:text-ivory";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${c}`}
      title={label}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Field({ label, value, onChange, type = "text", textarea }: { label: string; value: any; onChange: (v: string) => void; type?: string; textarea?: boolean }) {
  return (
    <div>
      <Label className="mb-1 block font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{label}</Label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-charcoal/15 bg-ivory-deep/30 px-3 py-2 font-display text-xs text-charcoal"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-ivory-deep/30"
        />
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-teal" />
    </div>
  );
}
