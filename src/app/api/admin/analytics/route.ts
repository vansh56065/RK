import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * Returns visitor + SEO analytics:
 *   - today: { pageViews, uniqueVisitors, sessions }
 *   - last7Days: [{ date, pageViews, uniqueVisitors, sessions }]
 *   - last30Days: [{ date, pageViews, uniqueVisitors, sessions, bookings, revenue }]
 *   - topPages (last 30 days): [{ path, views }]
 *   - topReferrers (last 30 days): [{ source, visits }]
 *   - monthlyTrend (last 6 months): [{ month, pageViews, uniqueVisitors, bookings, revenue }]
 *   - seoKeywords: [{ keyword, position, clicks, impressions, ctr }]
 *   - bookingFunnel: { views, checks, bookings, conversionRate }
 */
export async function GET(req: Request) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Start = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Start = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Today's stats
    const todayViews = await db.pageView.count({
      where: { createdAt: { gte: startOfToday }, isBot: false },
    });
    // Count unique sessions today
    const todayAllViews = await db.pageView.findMany({
      where: { createdAt: { gte: startOfToday }, isBot: false, sessionId: { not: null } },
      select: { sessionId: true },
    });
    const todaySessions = new Set(todayAllViews.map((v) => v.sessionId)).size;

    // Last 7 days breakdown
    const last7Days: Array<{ date: string; label: string; pageViews: number; uniqueVisitors: number; sessions: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const views = await db.pageView.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd }, isBot: false },
      });
      const dayViews = await db.pageView.findMany({
        where: { createdAt: { gte: dayStart, lt: dayEnd }, isBot: false, sessionId: { not: null } },
        select: { sessionId: true },
      });
      const uniqueCount = new Set(dayViews.map((v) => v.sessionId)).size;
      last7Days.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayStart.toLocaleDateString("en-IN", { weekday: "short" }),
        pageViews: views,
        uniqueVisitors: uniqueCount,
        sessions: uniqueCount,
      });
    }

    // Last 30 days — top pages
    const allViews30 = await db.pageView.findMany({
      where: { createdAt: { gte: last30Start }, isBot: false },
      select: { path: true, referrer: true, createdAt: true },
    });
    const pageCounts: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};
    for (const v of allViews30) {
      pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
      if (v.referrer) {
        try {
          const url = new URL(v.referrer);
          const host = url.hostname.replace(/^www\./, "");
          if (host && !host.includes("rkresidency") && !host.includes("localhost") && !host.includes("space-z")) {
            referrerCounts[host] = (referrerCounts[host] || 0) + 1;
          }
        } catch {}
      }
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));
    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, visits]) => ({ source, visits }));

    // Monthly trend (last 6 months)
    const monthlyTrend: Array<{ month: string; label: string; pageViews: number; uniqueVisitors: number; bookings: number; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const views = await db.pageView.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd }, isBot: false },
      });
      const monthViews = await db.pageView.findMany({
        where: { createdAt: { gte: monthStart, lt: monthEnd }, isBot: false, sessionId: { not: null } },
        select: { sessionId: true },
      });
      const uniqueCount = new Set(monthViews.map((v) => v.sessionId)).size;
      const bookings = await db.booking.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd }, status: { not: "CANCELLED" } },
      });
      const revenueAgg = await db.booking.aggregate({
        where: { createdAt: { gte: monthStart, lt: monthEnd }, status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      });
      monthlyTrend.push({
        month: monthStart.toISOString().slice(0, 7),
        label: monthStart.toLocaleDateString("en-IN", { month: "short" }),
        pageViews: views,
        uniqueVisitors: uniqueCount,
        bookings,
        revenue: revenueAgg._sum.totalAmount || 0,
      });
    }

    // Booking funnel (last 30 days)
    const totalViews = allViews30.length;
    // Approximate "checks" — we don't track them separately, so estimate as bookings * 8
    const totalBookings = await db.booking.count({
      where: { createdAt: { gte: last30Start }, status: { not: "CANCELLED" } },
    });
    const estimatedChecks = Math.max(totalBookings * 8, Math.round(totalViews * 0.05));
    const conversionRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(2) : "0";

    // SEO keywords (from database, if seeded)
    const seoKeywords = await db.sEOKeyword.findMany({
      orderBy: [{ clicks: "desc" }],
      take: 15,
    });

    return NextResponse.json({
      today: { pageViews: todayViews, uniqueVisitors: todaySessions, sessions: todaySessions },
      last7Days,
      topPages,
      topReferrers,
      monthlyTrend,
      bookingFunnel: {
        views: totalViews,
        checks: estimatedChecks,
        bookings: totalBookings,
        conversionRate: parseFloat(conversionRate),
      },
      seoKeywords,
    });
  } catch (e) {
    console.error("[/api/admin/analytics] error:", e);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
