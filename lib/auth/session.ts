import "server-only";
import { headers } from "next/headers";
import { auth } from "./auth";

export type CurrentSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * The authoritative session check — always reads from the database via
 * better-auth (see lib/auth/auth.ts: cookieCache is deliberately
 * disabled), never trusts a cookie's mere presence. middleware.ts does a
 * fast-path presence check only; every Node-runtime page/layout/server
 * action that needs to know *who* is signed in, or needs to enforce a
 * role, must call this (or requireCustomer/requireAdmin below) itself —
 * the middleware gate is not sufficient on its own.
 */
export async function getCurrentSession(): Promise<CurrentSession> {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Throws if there is no signed-in user. Use in server actions that
 * mutate account-scoped data (addresses, settings) so authorization is
 * verified independently of whatever page rendered the form.
 */
export async function requireCustomer() {
  const session = await getCurrentSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

/**
 * Throws unless the signed-in user has the ADMIN role. Every admin
 * server action must call this itself — never rely solely on the admin
 * layout's redirect, since a layout gate does not run for direct server
 * action invocations.
 */
export async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "ADMIN") throw new Error("Not authorized");
  return session;
}
