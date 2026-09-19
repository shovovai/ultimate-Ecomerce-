import "server-only";
import { NextResponse } from "next/server";

/**
 * Simple fixed-window rate limiter kept in memory.
 * Each server instance counts separately, which is enough to stop casual abuse
 * (form spam, email bombing). For strict global limits put a shared store
 * (e.g. Upstash Redis) or your host's firewall rules in front.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Returns a 429 response when the caller is over the limit, otherwise null */
export function rateLimit(
  req: Request,
  name: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  identity?: string | null
): NextResponse | null {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }

  const key = `${name}:${identity || clientIp(req)}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
