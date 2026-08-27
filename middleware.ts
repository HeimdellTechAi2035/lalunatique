import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Fast-path only: a valid-looking session cookie is present. This runs
 * on the Edge Runtime and cannot query the database, so it cannot check
 * *who* the session belongs to or whether it's actually still valid —
 * both /account and /admin re-verify authoritatively in Node runtime
 * (see lib/auth/session.ts: getCurrentSession / requireAdmin, called
 * from the dashboard layouts and independently from every server
 * action). A missing cookie is always redirected here; a present cookie
 * is never trusted beyond "go check properly".
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (pathname.startsWith("/admin")) {
    if (!hasSessionCookie) return NextResponse.redirect(new URL("/admin/login", request.url));
    return NextResponse.next();
  }

  if (!hasSessionCookie) return NextResponse.redirect(new URL("/account/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/account", "/account/((?!login|register|reset-password|forgot-password).*)", "/admin/((?!login).*)"],
};
