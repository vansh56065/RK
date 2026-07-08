import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await db.review.findMany({
      where: { approved: true },
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ reviews });
  } catch (e) {
    console.error("[/api/reviews] error:", e);
    return NextResponse.json({ reviews: [], error: "Failed to load reviews" }, { status: 500 });
  }
}
