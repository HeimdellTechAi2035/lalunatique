import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { releaseExpiredReservations } from "@/lib/payments/reservation-cleanup";

/**
 * Safety-net sweep for reservations whose checkout attempt never got a
 * terminal webhook (see lib/payments/reservation-cleanup.ts for why
 * this exists alongside the checkout.session.expired handler). Meant to
 * be hit by a scheduler, not a browser — protected by a bearer secret
 * rather than an admin session because a headless cron can't log in.
 *
 * Production setup: set CRON_SECRET, then point a scheduler (Vercel
 * Cron, a system cron, GitHub Actions schedule, etc.) at this route
 * every few minutes with `Authorization: Bearer <CRON_SECRET>`. Until
 * CRON_SECRET is set, this endpoint refuses every request — there is no
 * "trust it because it's only used internally" fallback.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured — this endpoint is disabled." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await releaseExpiredReservations();
  return NextResponse.json(result);
}
