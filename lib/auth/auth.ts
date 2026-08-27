import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/notifications/email";

/**
 * Real authentication for both customers and admins — every person is a
 * User row distinguished by `role` (see prisma/schema.prisma). Sessions
 * are database-backed (not JWT/cookie-cache-only) specifically so
 * sign-out invalidates a session immediately server-side rather than
 * waiting out a token's lifetime — see `session.cookieCache` below.
 *
 * `role` has `input: false`: it can only ever be set by trusted
 * server-side code (prisma.user.update / the seed script), never by a
 * value submitted through sign-up or update-user. Without this, anyone
 * could self-promote to ADMIN by adding `role: "ADMIN"` to a request body.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      const url = `${process.env.BETTER_AUTH_URL}/account/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=/account/email-verified`;
      await sendVerificationEmail(user.email, url);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
    // Deliberately not enabling cookieCache: every session read hits the
    // database, so `signOut` invalidates a session immediately instead of
    // leaving a stale signed cookie valid for up to the cache's maxAge.
  },

  rateLimit: {
    // Off only for the automated test suite (Stage E), which exercises
    // auth endpoints many times in quick succession by design — brute
    // force protection itself is covered by a dedicated unit test rather
    // than by hammering a live rate-limited server.
    enabled: process.env.NODE_ENV !== "test",
    window: 60,
    max: 20,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },

  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      marketingOptIn: { type: "boolean", required: false, defaultValue: false },
      role: { type: "string", required: false, defaultValue: "CUSTOMER", input: false },
    },
  },

  plugins: [nextCookies()],
});
