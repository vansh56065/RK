"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, BedDouble, Star, Mail, Newspaper,
  ScrollText, LogOut, Lock, Loader2, Menu, X, Search,
  TrendingUp, IndianRupee, Percent, Users, ArrowDownToLine, ArrowUpFromLine,
  Check, Eye, EyeOff, ShieldCheck, Edit, Trash2, Plus, Sparkles,
  BarChart3, Globe, MousePointerClick, Target, Tag, FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Logo, Lotus } from "../Motifs";
import { useRouter } from "@/lib/router";
import {
  getAdmin, getAdminToken, setAdminSession, clearAdminSession, adminFetch, adminApi,
} from "@/lib/admin-client";
import { toast } from "sonner";

type AdminUser = { id: string; email: string; name: string; role: string };
type Tab =
  | "dashboard" | "analytics" | "bookings" | "rooms" | "offers"
  | "blog" | "reviews" | "leads" | "content" | "theme"
  | "settings" | "users" | "audit";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics & SEO", icon: BarChart3 },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "rooms", label: "Rooms & Rates", icon: BedDouble },
  { id: "offers", label: "Offers", icon: Tag },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "content", label: "Page Editor", icon: FileText },
  { id: "theme", label: "Theme & Colors", icon: Sparkles },
  { id: "settings", label: "Site Settings", icon: ShieldCheck },
  { id: "users", label: "User Management", icon: Users },
  { id: "leads", label: "Leads & Messages", icon: Mail },
  { id: "audit", label: "Audit Log", icon: ShieldCheck },
];

export function AdminPanel() {
  const navigate = useRouter((s) => s.navigate);
  const [stored, setStored] = useState<AdminUser | null>(() => getAdmin());
  const authed = stored !== null;
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = useCallback((admin: AdminUser, token: string) => {
    setAdminSession(admin, token);
    setStored(admin);
  }, []);

  const handleLogout = useCallback(async () => {
    try { await fetch("/api/admin/auth", { method: "DELETE" }); } catch {}
    clearAdminSession();
    setStored(null);
    navigate("home");
  }, [navigate]);

  if (!authed) {
    return <AdminLogin onLogin={handleLogin} onBack={() => navigate("home")} />;
  }

  return (
    <div className="flex min-h-screen bg-ivory">
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

          <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
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
                {stored?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-serif text-sm font-semibold text-ivory">{stored?.name}</div>
                <div className="truncate font-display text-[10px] text-ivory/60">
                  {stored?.role === "SUPER_ADMIN" ? "Super Admin" : stored?.role}
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
              {tab === "analytics" && <AnalyticsTab />}
              {tab === "bookings" && <BookingsTab />}
              {tab === "rooms" && <RoomsTab />}
              {tab === "offers" && <OffersTab />}
              {tab === "blog" && <BlogTab />}
              {tab === "reviews" && <ReviewsTab />}
              {tab === "content" && <ContentTab />}
              {tab === "theme" && <ThemeTab />}
              {tab === "settings" && <SettingsTab />}
              {tab === "users" && <UsersTab />}
              {tab === "leads" && <LeadsTab />}
              {tab === "audit" && <AuditTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// =================== LOGIN ===================

function AdminLogin({ onLogin, onBack }: { onLogin: (a: AdminUser, token: string) => void; onBack: () => void }) {
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
      onLogin(data.admin, data.token);
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
    <div className="grid min-h-screen place-items-center bg-charcoal p-4">
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadStats = useCallback(() => {
    let cancelled = false;
    adminApi.get("stats")
      .then((data) => {
        if (cancelled) return;
        if (!data) { setError(true); setLoading(false); return; }
        setStats(data);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cleanup = loadStats();
    return cleanup;
  }, [loadStats]);

  const retry = () => {
    setLoading(true);
    setError(false);
    loadStats();
  };

  if (loading) return <LoadingSpinner />;
  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-marsala/30 bg-marsala/5 p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-marsala" />
        <p className="font-serif text-lg font-semibold text-marsala">Unable to load dashboard</p>
        <p className="mt-1 font-display text-sm text-charcoal-soft">
          The server may be starting up or your session has expired.
        </p>
        <Button onClick={retry} className="mt-4 rounded-full bg-teal px-5 py-2 text-ivory hover:bg-teal-deep">
          <Loader2 className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Percent} label="Occupancy (next 30 days)" value={`${stats.occupancyPct}%`} accent="teal" />
        <KpiCard icon={IndianRupee} label="Total revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} sub={`ADR ₹${stats.adr.toLocaleString("en-IN")} · RevPAR ₹${stats.revpar.toLocaleString("en-IN")}`} accent="gold" />
        <KpiCard icon={CalendarDays} label="Total bookings" value={stats.totalBookings.toString()} sub={`${stats.cancelledBookings} cancelled`} accent="marsala" />
        <KpiCard icon={Users} label="Today" value={`${stats.arrivalsToday}/${stats.departuresToday}`} sub="arrivals / departures" accent="teal" />
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
          {stats.revenueTrend.map((d: any) => {
            const max = Math.max(...stats.revenueTrend.map((x: any) => x.revenue), 1);
            const h = Math.max(4, (d.revenue / max) * 100);
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="text-[10px] font-semibold text-charcoal-soft">
                  {d.revenue > 0 ? `₹${(d.revenue / 1000).toFixed(0)}k` : ""}
                </div>
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-teal to-teal-soft transition-all" style={{ height: `${h}%` }} title={`${d.bookings} bookings · ₹${d.revenue}`} />
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
          {stats.roomTypeStats.map((r: any) => {
            const maxRev = Math.max(...stats.roomTypeStats.map((x: any) => x.revenue), 1);
            return (
              <div key={r.roomId}>
                <div className="mb-1 flex items-center justify-between font-display text-xs">
                  <span className="font-semibold text-charcoal">{r.roomName}</span>
                  <span className="text-charcoal-soft">{r.bookings} bookings · ₹{r.revenue.toLocaleString("en-IN")} · {r.occupancy}% occ</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ivory-deep">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft" style={{ width: `${(r.revenue / maxRev) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =================== ANALYTICS & SEO ===================

function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(() => {
    let cancelled = false;
    adminApi.get("analytics")
      .then((d) => {
        if (cancelled) return;
        if (!d) { setError(true); setLoading(false); return; }
        setData(d);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  const retry = () => {
    setLoading(true);
    setError(false);
    loadData();
  };

  if (loading) return <LoadingSpinner />;
  if (error || !data) {
    return (
      <div className="rounded-2xl border border-marsala/30 bg-marsala/5 p-8 text-center">
        <BarChart3 className="mx-auto mb-3 h-8 w-8 text-marsala" />
        <p className="font-serif text-lg font-semibold text-marsala">Unable to load analytics</p>
        <p className="mt-1 font-display text-sm text-charcoal-soft">
          The server may be starting up. Please retry.
        </p>
        <Button onClick={retry} className="mt-4 rounded-full bg-teal px-5 py-2 text-ivory hover:bg-teal-deep">
          <Loader2 className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={MousePointerClick} label="Page views today" value={data.today.pageViews.toString()} accent="teal" />
        <KpiCard icon={Users} label="Unique visitors today" value={data.today.uniqueVisitors.toString()} accent="gold" />
        <KpiCard icon={Target} label="Booking conversion" value={`${data.bookingFunnel.conversionRate}%`} sub={`${data.bookingFunnel.bookings} / ${data.bookingFunnel.views} views`} accent="marsala" />
      </div>

      {/* 7-day traffic chart */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-semibold text-charcoal">Visitor traffic</h3>
            <p className="font-display text-xs text-charcoal-soft">Last 7 days — page views vs unique visitors</p>
          </div>
          <TrendingUp className="h-5 w-5 text-teal" />
        </div>
        <div className="flex h-48 items-end justify-between gap-2 sm:gap-4">
          {data.last7Days.map((d: any) => {
            const max = Math.max(...data.last7Days.map((x: any) => x.pageViews), 1);
            const h1 = Math.max(4, (d.pageViews / max) * 100);
            const h2 = Math.max(4, (d.uniqueVisitors / max) * 100);
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="text-[10px] font-semibold text-charcoal-soft">{d.pageViews}</div>
                <div className="flex w-full flex-1 items-end gap-1">
                  <div className="flex-1 rounded-t-md bg-teal transition-all" style={{ height: `${h1}%` }} title={`${d.pageViews} views`} />
                  <div className="flex-1 rounded-t-md bg-gold transition-all" style={{ height: `${h2}%` }} title={`${d.uniqueVisitors} unique`} />
                </div>
                <div className="font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{d.label}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 font-display text-[10px] text-charcoal-soft">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal" /> Page views</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold" /> Unique visitors</span>
        </div>
      </div>

      {/* Monthly trend (6 months) */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
        <h3 className="mb-4 font-serif text-base font-semibold text-charcoal">Monthly trend (last 6 months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-display text-xs">
            <thead className="border-b border-charcoal/10 text-[10px] uppercase tracking-wider text-charcoal-soft">
              <tr>
                <th className="py-2 pr-4">Month</th>
                <th className="py-2 pr-4 text-right">Views</th>
                <th className="py-2 pr-4 text-right">Visitors</th>
                <th className="py-2 pr-4 text-right">Bookings</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {data.monthlyTrend.map((m: any) => (
                <tr key={m.month} className="hover:bg-ivory-deep/30">
                  <td className="py-2 pr-4 font-semibold text-charcoal">{m.label}</td>
                  <td className="py-2 pr-4 text-right text-charcoal-soft">{m.pageViews}</td>
                  <td className="py-2 pr-4 text-right text-charcoal-soft">{m.uniqueVisitors}</td>
                  <td className="py-2 pr-4 text-right text-charcoal-soft">{m.bookings}</td>
                  <td className="py-2 text-right font-semibold text-teal">₹{m.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
          <h3 className="mb-4 font-serif text-base font-semibold text-charcoal">Top pages (30 days)</h3>
          <div className="space-y-2">
            {data.topPages.length === 0 ? (
              <p className="font-display text-xs text-charcoal-soft">No page views recorded yet.</p>
            ) : data.topPages.map((p: any, i: number) => (
              <div key={p.path} className="flex items-center justify-between font-display text-xs">
                <span className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-teal/10 text-[10px] font-bold text-teal">{i + 1}</span>
                  <span className="font-medium text-charcoal">{p.path}</span>
                </span>
                <span className="font-semibold text-charcoal-soft">{p.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top referrers */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
          <h3 className="mb-4 font-serif text-base font-semibold text-charcoal">Top referrers (30 days)</h3>
          <div className="space-y-2">
            {data.topReferrers.length === 0 ? (
              <p className="font-display text-xs text-charcoal-soft">No external referrers yet.</p>
            ) : data.topReferrers.map((r: any, i: number) => (
              <div key={r.source} className="flex items-center justify-between font-display text-xs">
                <span className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-gold/10 text-[10px] font-bold text-gold-deep">{i + 1}</span>
                  <span className="font-medium text-charcoal">{r.source}</span>
                </span>
                <span className="font-semibold text-charcoal-soft">{r.visits} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking funnel */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
        <h3 className="mb-4 font-serif text-base font-semibold text-charcoal">Booking funnel (30 days)</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FunnelStep label="Page views" value={data.bookingFunnel.views} color="bg-teal" />
          <FunnelStep label="Availability checks" value={data.bookingFunnel.checks} color="bg-gold" />
          <FunnelStep label="Bookings" value={data.bookingFunnel.bookings} color="bg-marsala" />
          <FunnelStep label="Conversion rate" value={`${data.bookingFunnel.conversionRate}%`} color="bg-teal" />
        </div>
      </div>

      {/* SEO keywords */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-base font-semibold text-charcoal">SEO keyword tracking</h3>
          <Globe className="h-5 w-5 text-teal" />
        </div>
        {data.seoKeywords.length === 0 ? (
          <p className="font-display text-xs text-charcoal-soft">
            No SEO keyword data yet. Keywords will appear here once Google Search Console
            is connected in production.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-display text-xs">
              <thead className="border-b border-charcoal/10 text-[10px] uppercase tracking-wider text-charcoal-soft">
                <tr>
                  <th className="py-2 pr-4">Keyword</th>
                  <th className="py-2 pr-4 text-right">Position</th>
                  <th className="py-2 pr-4 text-right">Clicks</th>
                  <th className="py-2 pr-4 text-right">Impr.</th>
                  <th className="py-2 text-right">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/8">
                {data.seoKeywords.map((k: any) => (
                  <tr key={k.id}>
                    <td className="py-2 pr-4 font-medium text-charcoal">{k.keyword}</td>
                    <td className="py-2 pr-4 text-right text-charcoal-soft">{k.position || "—"}</td>
                    <td className="py-2 pr-4 text-right text-charcoal-soft">{k.clicks}</td>
                    <td className="py-2 pr-4 text-right text-charcoal-soft">{k.impressions}</td>
                    <td className="py-2 text-right text-charcoal-soft">{k.ctr ? `${k.ctr.toFixed(1)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FunnelStep({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-ivory-deep/30 p-3 text-center">
      <div className={`mx-auto mb-2 h-1 w-12 rounded-full ${color}`} />
      <div className="font-serif text-xl font-bold text-charcoal">{value}</div>
      <div className="font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{label}</div>
    </div>
  );
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
    adminApi.get("bookings", { status: statusFilter, search })
      .then((data) => {
        if (cancelled || !data) { if (!cancelled) setLoading(false); return; }
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [statusFilter, search]);

  const reload = useCallback(() => {
    setLoading(true);
    adminApi.get("bookings", { status: statusFilter, search })
      .then((data) => {
        if (data) setBookings(data.bookings || []);
        setLoading(false);
      });
  }, [statusFilter, search]);

  const action = async (id: string, a: string) => {
    const res = await adminApi.patch("booking_status", { id, bookingAction: a });
    if (res) {
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-soft" />
          <Input placeholder="Search by reference, name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full bg-white sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CHECKED_IN">Checked in</SelectItem>
            <SelectItem value="CHECKED_OUT">Checked out</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[b.status] || "bg-charcoal/10"}`}>{b.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.paymentStatus === "PAID" ? "bg-teal/10 text-teal" : b.paymentStatus === "REFUNDED" ? "bg-marsala/10 text-marsala" : "bg-gold/15 text-gold-deep"}`}>{b.paymentStatus}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {b.status === "CONFIRMED" && <ActionBtn label="Check-in" icon={ArrowDownToLine} onClick={() => action(b.id, "CHECK_IN")} />}
                      {b.status === "CHECKED_IN" && <ActionBtn label="Check-out" icon={ArrowUpFromLine} onClick={() => action(b.id, "CHECK_OUT")} />}
                      {b.paymentStatus === "PENDING" && <ActionBtn label="Mark paid" icon={IndianRupee} onClick={() => action(b.id, "MARK_PAID")} color="teal" />}
                      {b.status !== "CANCELLED" && b.status !== "CHECKED_OUT" && <ActionBtn label="Cancel" icon={X} onClick={() => action(b.id, "CANCEL")} color="marsala" />}
                      {b.paymentStatus === "PAID" && <ActionBtn label="Refund" icon={IndianRupee} onClick={() => action(b.id, "REFUND")} color="marsala" />}
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
    adminApi.get("rooms").then((data) => {
      if (data) setRooms(data.rooms || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminApi.get("rooms").then((data) => {
      if (cancelled) return;
      if (data) setRooms(data.rooms || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const save = async (room: any) => {
    const method = room.id ? "PATCH" : "POST";
    const res = await adminFetch("/api/admin/rooms", { method, body: JSON.stringify(room) });
    if (res) {
      toast.success(room.id ? "Room updated" : "Room created");
      setEditing(null);
      reload();
    } else toast.error("Save failed");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    const res = await adminFetch(`/api/admin/rooms?id=${id}`, { method: "DELETE" });
    if (res) { toast.success("Room deleted"); reload(); } else toast.error("Delete failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-charcoal-soft">{rooms.length} rooms · manage rates, inventory &amp; amenities</p>
        <Button onClick={() => setEditing({ slug: "", name: "", tagline: "", description: "", longDescription: "", basePrice: 5000, maxGuests: 2, sizeSqft: 300, bedType: "Queen", view: "Garden", imageUrls: "[]", amenities: "[]", totalCount: 4, badge: null, featured: false, sortOrder: rooms.length + 1 })} className="rounded-full bg-teal px-4 py-2 text-sm text-ivory hover:bg-teal-deep">
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
                <div className="font-display text-[11px] text-charcoal-soft">{r.totalCount} inventory · {r.maxGuests} guests · {r.sizeSqft} sq.ft</div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(r)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-teal hover:text-ivory" aria-label="Edit"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => del(r.id)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-marsala hover:text-ivory" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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
        <div className="mt-3"><Field label="Short description" value={form.description} onChange={(v) => set("description", v)} /></div>
        <div className="mt-3"><Field label="Long description" textarea value={form.longDescription} onChange={(v) => set("longDescription", v)} /></div>
        <div className="mt-3"><Field label="Image URLs (JSON array)" textarea value={form.imageUrls} onChange={(v) => set("imageUrls", v)} /></div>
        <div className="mt-3"><Field label="Amenities (JSON array)" textarea value={form.amenities} onChange={(v) => set("amenities", v)} /></div>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => onSave(form)} className="rounded-full bg-teal px-6 py-2 text-ivory hover:bg-teal-deep">Save room</Button>
          <Button onClick={onClose} variant="outline" className="rounded-full">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// =================== OFFERS ===================

function OffersTab() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const reload = useCallback(() => {
    adminApi.get("offers").then((data) => {
      if (data) setOffers(data.offers || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminApi.get("offers").then((data) => {
      if (cancelled) return;
      if (data) setOffers(data.offers || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const save = async (offer: any) => {
    const method = offer.id ? "PATCH" : "POST";
    const res = await adminFetch("/api/admin/offers", { method, body: JSON.stringify(offer) });
    if (res) { toast.success(offer.id ? "Offer updated" : "Offer created"); setEditing(null); reload(); }
    else toast.error("Save failed");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    const res = await adminFetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
    if (res) { toast.success("Offer deleted"); reload(); } else toast.error("Delete failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-charcoal-soft">{offers.length} offers · manage packages &amp; discounts</p>
        <Button onClick={() => setEditing({ slug: "", title: "", tagline: "", description: "", perks: "[]", discountPct: null, validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 90*24*60*60*1000).toISOString(), imageUrl: null, badge: null, featured: false })} className="rounded-full bg-teal px-4 py-2 text-sm text-ivory hover:bg-teal-deep">
          <Plus className="mr-1 h-4 w-4" /> New offer
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <div className="col-span-full py-12 text-center text-charcoal-soft">Loading…</div> : offers.map((o) => (
          <div key={o.id} className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
            <div className="relative h-32 overflow-hidden">
              {o.imageUrl && <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${o.imageUrl})` }} />}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="font-serif text-sm font-semibold text-ivory">{o.title}</div>
                {o.discountPct && <div className="font-serif text-base font-bold text-gold-soft">{o.discountPct}% OFF</div>}
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="font-display text-[11px] text-charcoal-soft">{o.badge || "—"}</div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(o)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-teal hover:text-ivory"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => del(o.id)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-marsala hover:text-ivory"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <OfferEditor offer={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function OfferEditor({ offer, onClose, onSave }: { offer: any; onClose: () => void; onSave: (o: any) => void }) {
  const [form, setForm] = useState(offer);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-charcoal/70 p-4" onClick={onClose}>
      <div className="scrollbar-thin max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-ivory p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-charcoal">{offer.id ? "Edit offer" : "New offer"}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
          <Field label="Title" value={form.title} onChange={(v) => set("title", v)} />
          <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
          <Field label="Badge" value={form.badge || ""} onChange={(v) => set("badge", v || null)} />
          <Field label="Discount %" type="number" value={form.discountPct || ""} onChange={(v) => set("discountPct", v ? parseInt(v) : null)} />
          <Field label="Image URL" value={form.imageUrl || ""} onChange={(v) => set("imageUrl", v || null)} />
        </div>
        <div className="mt-3"><Field label="Description" textarea value={form.description} onChange={(v) => set("description", v)} /></div>
        <div className="mt-3"><Field label="Perks (JSON array)" textarea value={form.perks} onChange={(v) => set("perks", v)} /></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Valid from (ISO)" value={form.validFrom} onChange={(v) => set("validFrom", v)} />
          <Field label="Valid until (ISO)" value={form.validUntil} onChange={(v) => set("validUntil", v)} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input type="checkbox" id="offer-featured" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} />
          <Label htmlFor="offer-featured">Featured on home</Label>
        </div>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => onSave(form)} className="rounded-full bg-teal px-6 py-2 text-ivory hover:bg-teal-deep">Save offer</Button>
          <Button onClick={onClose} variant="outline" className="rounded-full">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// =================== BLOG ===================

function BlogTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const reload = useCallback(() => {
    adminApi.get("blog").then((data) => {
      if (data) setPosts(data.posts || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminApi.get("blog").then((data) => {
      if (cancelled) return;
      if (data) setPosts(data.posts || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const save = async (post: any) => {
    const method = post.id ? "PATCH" : "POST";
    const res = await adminFetch("/api/admin/blog", { method, body: JSON.stringify(post) });
    if (res) { toast.success(post.id ? "Post updated" : "Post created"); setEditing(null); reload(); }
    else toast.error("Save failed");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await adminFetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    if (res) { toast.success("Post deleted"); reload(); } else toast.error("Delete failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-charcoal-soft">{posts.length} posts · SEO content hub</p>
        <Button onClick={() => setEditing({ slug: "", title: "", excerpt: "", body: "", category: "TEMPLE_GUIDE", tags: "[]", imageUrl: null, published: false, publishedAt: null, readingMins: 4 })} className="rounded-full bg-teal px-4 py-2 text-sm text-ivory hover:bg-teal-deep">
          <Plus className="mr-1 h-4 w-4" /> New post
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? <div className="py-12 text-center text-charcoal-soft">Loading…</div> : posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-charcoal/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.published ? "bg-teal/10 text-teal" : "bg-marsala/10 text-marsala"}`}>{p.published ? "Published" : "Draft"}</span>
                  <span className="rounded-full bg-ivory-deep px-2 py-0.5 text-[10px] font-medium text-charcoal-soft">{p.category.replace("_", " ")}</span>
                </div>
                <h3 className="mt-1 font-serif text-base font-semibold text-charcoal">{p.title}</h3>
                <p className="mt-0.5 font-display text-xs text-charcoal-soft">/{p.slug} · {p.readingMins} min read</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-teal hover:text-ivory"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => del(p.id)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-marsala hover:text-ivory"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <BlogEditor post={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function BlogEditor({ post, onClose, onSave }: { post: any; onClose: () => void; onSave: (p: any) => void }) {
  const [form, setForm] = useState(post);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-charcoal/70 p-4" onClick={onClose}>
      <div className="scrollbar-thin max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-ivory p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-charcoal">{post.id ? "Edit post" : "New post"}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
          <Field label="Title" value={form.title} onChange={(v) => set("title", v)} />
          <div>
            <Label className="mb-1 block font-display text-[10px] uppercase tracking-wider text-charcoal-soft">Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="bg-ivory-deep/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TEMPLE_GUIDE">Temple Guide</SelectItem>
                <SelectItem value="FESTIVAL">Festival</SelectItem>
                <SelectItem value="LOCAL_TIP">Local Tip</SelectItem>
                <SelectItem value="EXPERIENCE">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Reading mins" type="number" value={form.readingMins} onChange={(v) => set("readingMins", parseInt(v) || 4)} />
          <Field label="Image URL" value={form.imageUrl || ""} onChange={(v) => set("imageUrl", v || null)} />
          <Field label="Published at (ISO)" value={form.publishedAt || ""} onChange={(v) => set("publishedAt", v || null)} />
        </div>
        <div className="mt-3"><Field label="Excerpt" textarea value={form.excerpt} onChange={(v) => set("excerpt", v)} /></div>
        <div className="mt-3"><Field label="Body (markdown-style, use ## for headings)" textarea value={form.body} onChange={(v) => set("body", v)} /></div>
        <div className="mt-3"><Field label="Tags (JSON array)" value={form.tags} onChange={(v) => set("tags", v)} /></div>
        <div className="mt-3 flex items-center gap-2">
          <input type="checkbox" id="post-published" checked={!!form.published} onChange={(e) => set("published", e.target.checked)} />
          <Label htmlFor="post-published">Published</Label>
        </div>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => onSave(form)} className="rounded-full bg-teal px-6 py-2 text-ivory hover:bg-teal-deep">Save post</Button>
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
    adminApi.get("reviews").then((data) => {
      if (data) setReviews(data.reviews || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminApi.get("reviews").then((data) => {
      if (cancelled) return;
      if (data) setReviews(data.reviews || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const toggle = async (id: string, action: "APPROVE" | "HIDE") => {
    const res = await adminApi.patch("review", { id, reviewAction: action });
    if (res) { toast.success(action === "APPROVE" ? "Review approved" : "Review hidden"); reload(); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid gap-3">
      {reviews.map((r) => (
        <div key={r.id} className={`rounded-2xl border bg-white p-4 ${r.approved ? "border-teal/30" : "border-marsala/30"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-gold text-gold" : "text-charcoal/20"}`} />)}</div>
                <h4 className="font-serif text-sm font-semibold text-charcoal">{r.title}</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.approved ? "bg-teal/10 text-teal" : "bg-marsala/10 text-marsala"}`}>{r.approved ? "Live" : "Pending"}</span>
              </div>
              <p className="mt-1.5 font-display text-xs leading-relaxed text-charcoal-soft">{r.body}</p>
              <div className="mt-2 font-display text-[10px] text-charcoal-soft">— {r.guestName} {r.guestLocation && `· ${r.guestLocation}`} · {r.source} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</div>
            </div>
            <div className="flex flex-col gap-1">
              {r.approved ? <button onClick={() => toggle(r.id, "HIDE")} className="rounded-full border border-marsala/30 px-3 py-1 text-[10px] font-semibold text-marsala hover:bg-marsala hover:text-ivory">Hide</button>
              : <button onClick={() => toggle(r.id, "APPROVE")} className="rounded-full border border-teal/30 px-3 py-1 text-[10px] font-semibold text-teal hover:bg-teal hover:text-ivory">Approve</button>}
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
    let cancelled = false;
    adminApi.get("data").then((data) => {
      if (cancelled || !data) { if (!cancelled) setLoading(false); return; }
      setSubs(data.subscribers || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold text-charcoal">{subs.length} subscribers</h3>
        <button onClick={() => {
          const csv = "email,name,language,subscribedAt\n" + subs.map((s) => `${s.email},${s.name || ""},${s.language},${new Date(s.createdAt).toISOString()}`).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "rk-newsletter.csv"; a.click(); URL.revokeObjectURL(url);
        }} className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/15 px-3 py-1.5 font-display text-xs font-semibold text-charcoal-soft hover:bg-ivory-deep">
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
            <div className="font-display text-[10px] text-charcoal-soft">{new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
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
    let cancelled = false;
    adminApi.get("data").then((data) => {
      if (cancelled || !data) { if (!cancelled) setLoading(false); return; }
      setMessages(data.messages || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className="rounded-2xl border border-charcoal/10 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-serif text-sm font-semibold text-charcoal">{m.subject}</div>
              <div className="font-display text-[10px] text-charcoal-soft">{m.name} · {m.email} {m.phone && `· ${m.phone}`} · {m.topic}</div>
            </div>
            <div className="font-display text-[10px] text-charcoal-soft">{new Date(m.createdAt).toLocaleString("en-IN")}</div>
          </div>
          <p className="mt-2 font-display text-xs leading-relaxed text-charcoal-soft">{m.message}</p>
          <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="mt-3 inline-block rounded-full bg-teal px-3 py-1 font-display text-[10px] font-semibold text-ivory hover:bg-teal-deep">Reply by email</a>
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
    let cancelled = false;
    adminApi.get("data").then((data) => {
      if (cancelled || !data) { if (!cancelled) setLoading(false); return; }
      setLogs(data.auditLogs || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
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
            <span className="flex-1 text-charcoal">{l.details}{l.admin && <span className="text-charcoal-soft"> · by {l.admin.name}</span>}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== SITE CONTENT MANAGEMENT ===================

function ContentTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const reload = useCallback(() => {
    adminApi.get("content").then((data) => {
      if (data) {
        setItems(data.items || []);
        const editMap: Record<string, string> = {};
        (data.items || []).forEach((item: any) => { editMap[item.id] = item.value; });
        setEditing(editMap);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminApi.get("content").then((data) => {
      if (cancelled || !data) { setLoading(false); return; }
      setItems(data.items || []);
      const editMap: Record<string, string> = {};
      (data.items || []).forEach((item: any) => { editMap[item.id] = item.value; });
      setEditing(editMap);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const save = async (id: string) => {
    setSaving((s) => ({ ...s, [id]: true }));
    const res = await adminApi.patch("content", { id, value: editing[id] });
    if (res) {
      toast.success("Content updated — changes are live on the website");
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, value: editing[id] } : item));
    } else {
      toast.error("Update failed");
    }
    setSaving((s) => ({ ...s, [id]: false }));
  };

  if (loading) return <LoadingSpinner />;

  const sections = Array.from(new Set(items.map((i) => i.section)));
  const visibleItems = items.filter((i) => i.section === activeSection);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-teal/20 bg-teal/5 p-4">
        <p className="font-display text-sm text-charcoal-soft">
          <strong className="text-teal">Edit website content directly.</strong> Changes are saved
          to the database and appear live on the website instantly. Edit headlines, descriptions,
          contact info, footer text — every word on the site.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
              activeSection === s ? "border-teal bg-teal text-ivory" : "border-charcoal/15 bg-white text-charcoal-soft hover:border-teal/40 hover:text-teal"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Content items */}
      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-charcoal/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="font-serif text-sm font-semibold text-charcoal">{item.label || item.key}</span>
                <span className="ml-2 font-mono text-[10px] text-charcoal-soft">{item.key}</span>
              </div>
              <span className="rounded-full bg-ivory-deep px-2 py-0.5 font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{item.type}</span>
            </div>
            {item.type === "textarea" ? (
              <textarea
                value={editing[item.id] || ""}
                onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-charcoal/15 bg-ivory-deep/30 px-3 py-2 font-display text-sm text-charcoal"
              />
            ) : (
              <Input
                value={editing[item.id] || ""}
                onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: e.target.value }))}
                className="bg-ivory-deep/30"
              />
            )}
            <div className="mt-2 flex justify-end">
              <Button
                onClick={() => save(item.id)}
                disabled={saving[item.id] || editing[item.id] === item.value}
                className="rounded-full bg-teal px-4 py-1.5 text-xs text-ivory hover:bg-teal-deep disabled:opacity-40"
              >
                {saving[item.id] ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving…</> : <><Check className="mr-1 h-3 w-3" /> Save</>}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== SITE SETTINGS ===================

function SettingsTab() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    adminApi.get("settings").then((data) => {
      if (cancelled || !data) { setLoading(false); return; }
      setSettings(data.settings || []);
      const editMap: Record<string, string> = {};
      (data.settings || []).forEach((s: any) => { editMap[s.id] = s.value; });
      setEditing(editMap);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const save = async (id: string) => {
    setSaving((s) => ({ ...s, [id]: true }));
    const res = await adminApi.patch("setting", { id, value: editing[id] });
    if (res) {
      toast.success("Setting updated");
      setSettings((prev) => prev.map((s) => s.id === id ? { ...s, value: editing[id] } : s));
    } else {
      toast.error("Update failed");
    }
    setSaving((s) => ({ ...s, [id]: false }));
  };

  if (loading) return <LoadingSpinner />;

  const categories = Array.from(new Set(settings.map((s) => s.category)));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-teal/20 bg-teal/5 p-4">
        <p className="font-display text-sm text-charcoal-soft">
          <strong className="text-teal">Site-wide settings.</strong> Configure Google Analytics,
          WhatsApp number, social media links, check-in/out times, and more.
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="mb-3 font-serif text-lg font-semibold text-charcoal">
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </h3>
          <div className="space-y-3">
            {settings.filter((s) => s.category === cat).map((s) => (
              <div key={s.id} className="rounded-2xl border border-charcoal/10 bg-white p-4">
                <div className="mb-2">
                  <span className="font-serif text-sm font-semibold text-charcoal">{s.label || s.key}</span>
                  <span className="ml-2 font-mono text-[10px] text-charcoal-soft">{s.key}</span>
                </div>
                <Input
                  value={editing[s.id] || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  className="bg-ivory-deep/30"
                  placeholder={s.key === "ga_measurement_id" ? "G-XXXXXXXXXX" : ""}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={() => save(s.id)}
                    disabled={saving[s.id] || editing[s.id] === s.value}
                    className="rounded-full bg-teal px-4 py-1.5 text-xs text-ivory hover:bg-teal-deep disabled:opacity-40"
                  >
                    {saving[s.id] ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving…</> : <><Check className="mr-1 h-3 w-3" /> Save</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =================== USER MANAGEMENT ===================

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const admin = getAdmin();

  const reload = useCallback(() => {
    adminApi.get("users").then((data) => {
      if (data) setUsers(data.users || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminApi.get("users").then((data) => {
      if (cancelled) return;
      if (data) setUsers(data.users || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const save = async (user: any) => {
    const method = user.id ? "PATCH" : "POST";
    const res = await adminFetch("/api/admin/users", { method, body: JSON.stringify(user) });
    if (res) {
      toast.success(user.id ? "User updated" : "User created");
      setEditing(null);
      reload();
    } else {
      toast.error("Save failed");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this admin user? This cannot be undone.")) return;
    const res = await adminFetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res) { toast.success("User deleted"); reload(); } else toast.error("Delete failed");
  };

  if (loading) return <LoadingSpinner />;

  const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: "bg-marsala/10 text-marsala",
    MANAGER: "bg-teal/10 text-teal",
    FRONT_DESK: "bg-gold/15 text-gold-deep",
  };

  return (
    <div className="space-y-4">
      {admin?.role !== "SUPER_ADMIN" ? (
        <div className="rounded-2xl border border-marsala/30 bg-marsala/5 p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-marsala" />
          <p className="font-serif text-lg font-semibold text-marsala">Access Denied</p>
          <p className="mt-1 font-display text-sm text-charcoal-soft">
            Only Super Admins can manage users.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="font-display text-sm text-charcoal-soft">{users.length} admin users</p>
            <Button onClick={() => setEditing({ name: "", email: "", password: "", role: "MANAGER" })} className="rounded-full bg-teal px-4 py-2 text-sm text-ivory hover:bg-teal-deep">
              <Plus className="mr-1 h-4 w-4" /> New user
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
            <table className="w-full text-left">
              <thead className="border-b border-charcoal/10 bg-ivory-deep font-display text-[10px] uppercase tracking-wider text-charcoal-soft">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/8 font-display text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-ivory-deep/30">
                    <td className="px-4 py-3 font-semibold text-charcoal">{u.name}</td>
                    <td className="px-4 py-3 text-charcoal-soft">{u.email}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role] || "bg-charcoal/10"}`}>{u.role.replace("_", " ")}</span></td>
                    <td className="px-4 py-3 text-charcoal-soft">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditing({ ...u, password: "" })} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-teal hover:text-ivory"><Edit className="h-3.5 w-3.5" /></button>
                        {u.id !== admin?.id && <button onClick={() => del(u.id)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft hover:bg-marsala hover:text-ivory"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editing && (
            <div className="fixed inset-0 z-[90] grid place-items-center bg-charcoal/70 p-4" onClick={() => setEditing(null)}>
              <div className="w-full max-w-md rounded-3xl bg-ivory p-6" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-serif text-lg font-semibold text-charcoal">{editing.id ? "Edit user" : "New user"}</h3>
                  <button onClick={() => setEditing(null)} className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/15 text-charcoal-soft"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <Field label="Name" value={editing.name} onChange={(v) => setEditing((f: any) => ({ ...f, name: v }))} />
                  <Field label="Email" value={editing.email} onChange={(v) => setEditing((f: any) => ({ ...f, email: v }))} />
                  <Field label={editing.id ? "New password (leave blank to keep)" : "Password"} value={editing.password || ""} onChange={(v) => setEditing((f: any) => ({ ...f, password: v }))} />
                  <div>
                    <Label className="mb-1 block font-display text-[10px] uppercase tracking-wider text-charcoal-soft">Role</Label>
                    <Select value={editing.role} onValueChange={(v) => setEditing((f: any) => ({ ...f, role: v }))}>
                      <SelectTrigger className="bg-ivory-deep/30"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="FRONT_DESK">Front Desk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <Button onClick={() => save(editing)} className="rounded-full bg-teal px-6 py-2 text-ivory hover:bg-teal-deep">Save user</Button>
                  <Button onClick={() => setEditing(null)} variant="outline" className="rounded-full">Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =================== THEME CUSTOMIZER ===================

function ThemeTab() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    adminApi.get("theme").then((data) => {
      if (cancelled || !data) { setLoading(false); return; }
      setThemes(data.themes || []);
      const editMap: Record<string, string> = {};
      (data.themes || []).forEach((t: any) => { editMap[t.id] = t.value; });
      setEditing(editMap);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const save = async (id: string) => {
    setSaving((s) => ({ ...s, [id]: true }));
    const res = await adminApi.patch("theme", { id, value: editing[id] });
    if (res) {
      toast.success("Theme color updated — changes are live!");
      setThemes((prev) => prev.map((t) => t.id === id ? { ...t, value: editing[id] } : t));
    } else {
      toast.error("Update failed");
    }
    setSaving((s) => ({ ...s, [id]: false }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-teal/20 bg-teal/5 p-4">
        <p className="font-display text-sm text-charcoal-soft">
          <strong className="text-teal">Customize your website colors.</strong> Changes apply
          instantly across the entire site. Use the color picker or enter a hex code.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((t) => (
          <div key={t.id} className="rounded-2xl border border-charcoal/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-serif text-sm font-semibold text-charcoal">{t.label || t.key}</span>
              <span className="font-mono text-[10px] text-charcoal-soft">{t.key}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={editing[t.id] || "#000000"}
                onChange={(e) => setEditing((prev) => ({ ...prev, [t.id]: e.target.value }))}
                className="h-12 w-16 cursor-pointer rounded-lg border border-charcoal/15"
              />
              <Input
                value={editing[t.id] || ""}
                onChange={(e) => setEditing((prev) => ({ ...prev, [t.id]: e.target.value }))}
                className="flex-1 bg-ivory-deep/30 font-mono text-sm"
                placeholder="#000000"
              />
              <div className="h-12 w-12 shrink-0 rounded-lg border border-charcoal/15" style={{ backgroundColor: editing[t.id] || "#fff" }} />
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                onClick={() => save(t.id)}
                disabled={saving[t.id] || editing[t.id] === t.value}
                className="rounded-full bg-teal px-4 py-1.5 text-xs text-ivory hover:bg-teal-deep disabled:opacity-40"
              >
                {saving[t.id] ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving…</> : <><Check className="mr-1 h-3 w-3" /> Save</>}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
        <p className="font-display text-xs text-charcoal-soft">
          <strong>Default colors:</strong> Primary #0E4C4F (Peacock Teal) · Accent #C7A250 (Temple Gold) ·
          Secondary #6E1E36 (Marsala Maroon) · Background #FBF6EC (Warm Ivory) · Text #231F1C (Charcoal)
        </p>
      </div>
    </div>
  );
}

// =================== LEADS & MESSAGES ===================

function LeadsTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"messages" | "subscribers">("messages");

  useEffect(() => {
    let cancelled = false;
    adminApi.get("data").then((data) => {
      if (cancelled || !data) { setLoading(false); return; }
      setMessages(data.messages || []);
      setSubscribers(data.subscribers || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("messages")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${view === "messages" ? "border-teal bg-teal text-ivory" : "border-charcoal/15 bg-white text-charcoal-soft hover:border-teal/40"}`}
        >
          Contact Leads ({messages.length})
        </button>
        <button
          onClick={() => setView("subscribers")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${view === "subscribers" ? "border-teal bg-teal text-ivory" : "border-charcoal/15 bg-white text-charcoal-soft hover:border-teal/40"}`}
        >
          Newsletter ({subscribers.length})
        </button>
        {view === "subscribers" && subscribers.length > 0 && (
          <button
            onClick={() => {
              const csv = "email,name,language,subscribedAt\n" + subscribers.map((s) => `${s.email},${s.name || ""},${s.language},${new Date(s.createdAt).toISOString()}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "rk-newsletter.csv"; a.click(); URL.revokeObjectURL(url);
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-charcoal/15 px-3 py-1.5 font-display text-xs font-semibold text-charcoal-soft hover:bg-ivory-deep"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" /> Export CSV
          </button>
        )}
      </div>

      {view === "messages" ? (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-charcoal/10 bg-white p-8 text-center">
              <Mail className="mx-auto mb-2 h-8 w-8 text-charcoal/30" />
              <p className="font-display text-sm text-charcoal-soft">No contact leads yet.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="rounded-2xl border border-charcoal/10 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-serif text-sm font-semibold text-charcoal">{m.subject}</div>
                    <div className="font-display text-[10px] text-charcoal-soft">
                      {m.name} · {m.email} {m.phone && `· ${m.phone}`} · <span className="rounded-full bg-teal/8 px-1.5 py-0.5 font-semibold text-teal">{m.topic}</span>
                    </div>
                  </div>
                  <div className="font-display text-[10px] text-charcoal-soft">{new Date(m.createdAt).toLocaleString("en-IN")}</div>
                </div>
                <p className="mt-2 font-display text-xs leading-relaxed text-charcoal-soft">{m.message}</p>
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="mt-3 inline-block rounded-full bg-teal px-3 py-1 font-display text-[10px] font-semibold text-ivory hover:bg-teal-deep">Reply by email</a>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
          <div className="scrollbar-thin max-h-[60vh] space-y-1 overflow-y-auto">
            {subscribers.length === 0 ? (
              <p className="py-8 text-center font-display text-sm text-charcoal-soft">No subscribers yet.</p>
            ) : subscribers.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-charcoal/5 py-2 last:border-0">
                <div>
                  <div className="font-serif text-sm font-semibold text-charcoal">{s.email}</div>
                  <div className="font-display text-[10px] text-charcoal-soft">{s.name || "—"} · {s.language}</div>
                </div>
                <div className="font-display text-[10px] text-charcoal-soft">{new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =================== Shared ===================

function KpiCard({ icon: Icon, label, value, sub, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; accent: "teal" | "gold" | "marsala" }) {
  const color = accent === "gold" ? "bg-gold/10 text-gold-deep" : accent === "marsala" ? "bg-marsala/10 text-marsala" : "bg-teal/10 text-teal";
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-4">
      <div className="mb-2 flex items-center justify-between"><span className={`grid h-9 w-9 place-items-center rounded-full ${color}`}><Icon className="h-4 w-4" /></span></div>
      <div className="font-serif text-2xl font-bold text-charcoal">{value}</div>
      <div className="font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{label}</div>
      {sub && <div className="mt-1 font-display text-[10px] text-charcoal-soft">{sub}</div>}
    </div>
  );
}

function ActionBtn({ label, icon: Icon, onClick, color = "teal" }: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; color?: "teal" | "marsala" }) {
  const c = color === "marsala" ? "border-marsala/30 text-marsala hover:bg-marsala hover:text-ivory" : "border-teal/30 text-teal hover:bg-teal hover:text-ivory";
  return <button onClick={onClick} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${c}`} title={label}><Icon className="h-3 w-3" /><span className="hidden sm:inline">{label}</span></button>;
}

function Field({ label, value, onChange, type = "text", textarea }: { label: string; value: any; onChange: (v: string) => void; type?: string; textarea?: boolean }) {
  return (
    <div>
      <Label className="mb-1 block font-display text-[10px] uppercase tracking-wider text-charcoal-soft">{label}</Label>
      {textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-md border border-charcoal/15 bg-ivory-deep/30 px-3 py-2 font-display text-xs text-charcoal" /> : <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-ivory-deep/30" />}
    </div>
  );
}

function LoadingSpinner() {
  return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>;
}
