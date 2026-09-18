import "server-only";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/adminUtils";

type AdminCheck =
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse };

/**
 * Server-side guard for admin API routes.
 * Usage:
 *   const admin = await requireAdmin();
 *   if (!admin.ok) return admin.response;
 */
export async function requireAdmin(): Promise<AdminCheck> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized", message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;

  if (!email || !isUserAdmin(email)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden - Admin access required",
          message: "Forbidden - Admin access required",
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId, email };
}

/** Returns the admin email or null — for server components / layouts. */
export async function getAdminEmail(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  return email && isUserAdmin(email) ? email : null;
}
