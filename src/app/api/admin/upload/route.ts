import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload
 * Body: { key: "room.yamuna-suite.image1", label: "Yamuna Suite hero", base64: "data:image/jpeg;base64,..." }
 * Stores image as base64 in SiteContent table with type "image".
 * Returns the stored item.
 */
export async function POST(req: Request) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { key, label, base64, section } = body as {
      key: string; label?: string; base64: string; section?: string;
    };

    if (!key || !base64) return NextResponse.json({ error: "Key and base64 required" }, { status: 400 });
    if (base64.length > 5_000_000) return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400 });

    const item = await db.siteContent.upsert({
      where: { key },
      create: { key, value: base64, section: section || "images", type: "image", label: label || key },
      update: { value: base64, label: label || key },
    });

    await db.auditLog.create({
      data: { adminId: admin.id, action: "IMAGE_UPLOADED", entity: "SiteContent", entityId: item.id, details: `Uploaded image "${key}"` },
    });

    return NextResponse.json({ ok: true, id: item.id, key: item.key });
  } catch (e) {
    console.error("[/api/admin/upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
