import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { backendClient } from "@/sanity/lib/backendClient";
import {
  DEFAULT_STORE_SETTINGS,
  EDITABLE_SETTINGS_KEYS,
  STORE_SETTINGS_ID,
  getStoreSettings,
} from "@/lib/storeSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const settings = await getStoreSettings({ fresh: true });
  return NextResponse.json({ success: true, settings });
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = (await request.json()) as Record<string, unknown>;
    const update: Record<string, unknown> = {};

    // Only accept known keys with the same primitive type as the default
    for (const key of EDITABLE_SETTINGS_KEYS) {
      if (!(key in body)) continue;
      const value = body[key];
      const expected = typeof DEFAULT_STORE_SETTINGS[key];
      if (typeof value !== expected) {
        return NextResponse.json(
          { success: false, error: `Invalid value for ${key}` },
          { status: 400 }
        );
      }
      update[key] = typeof value === "string" ? value.trim() : value;
    }

    if (
      typeof update.accentColor === "string" &&
      update.accentColor &&
      !/^#([0-9a-fA-F]{3}){1,2}$/.test(update.accentColor)
    ) {
      return NextResponse.json(
        { success: false, error: "Accent color must be a hex value like #063c28" },
        { status: 400 }
      );
    }

    await backendClient.createIfNotExists({
      _id: STORE_SETTINGS_ID,
      _type: "storeSettings",
    });
    await backendClient
      .patch(STORE_SETTINGS_ID)
      .set({
        ...update,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.email,
      })
      .commit();

    revalidateTag("storeSettings", { expire: 0 });

    return NextResponse.json({
      success: true,
      settings: await getStoreSettings({ fresh: true }),
    });
  } catch (error) {
    console.error("Error saving store settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
