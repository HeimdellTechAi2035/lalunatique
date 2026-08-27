import "server-only";
import { requireAdmin as requireAdminSession, getCurrentSession } from "@/lib/auth/session";

/**
 * Real per-user admin authorization (see lib/auth/auth.ts / prisma
 * schema: User.role). Replaces the old single-shared-access-code gate.
 * `isAdminAuthenticated` is kept as the entry point every admin server
 * action already calls via `requireAdmin()` below, so authorization is
 * verified independently in each action — never solely by the
 * app/admin/(dashboard)/layout.tsx redirect, which does not run for a
 * direct server action invocation.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return Boolean(session && session.user.role === "ADMIN");
}

export async function requireAdmin(): Promise<void> {
  await requireAdminSession();
}
