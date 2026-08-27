import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * Creates a real user via the real sign-up endpoint (real password
 * hashing, real DB-backed session) and returns the session cookie
 * header value — obtained via `asResponse: true`, the same mechanism
 * better-auth itself uses to set cookies, just read directly here since
 * there's no Next.js request to attach it to. Tests that exercise
 * `getCurrentSession`/`requireAdmin` (lib/auth/session.ts) mock
 * `next/headers`' `headers()` to return `new Headers({ cookie })`.
 */
export async function createUserWithSession(
  opts: { email?: string; password?: string; role?: "CUSTOMER" | "ADMIN" } = {},
) {
  const email = opts.email ?? `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const password = opts.password ?? "correcthorsebatterystaple";

  const response = await auth.api.signUpEmail({
    body: { name: "Test User", email, password },
    asResponse: true,
  });
  const cookie = (response.headers.get("set-cookie") ?? "").split(";")[0];
  if (!cookie) throw new Error("signUpEmail did not return a session cookie");

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  if (opts.role === "ADMIN") {
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  }

  return { email, password, userId: user.id, cookie };
}
