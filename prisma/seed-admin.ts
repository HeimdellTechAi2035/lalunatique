/**
 * One-off dev setup: creates the first ADMIN user so /admin is reachable
 * at all (there is no other way in — real staff accounts are individual
 * from day one, not a shared code, so at least one has to exist before
 * anyone can sign in). Goes through auth.api.signUpEmail so the password
 * is hashed by better-auth's own hashing, exactly like any other
 * account, then promotes role to ADMIN directly via Prisma — `role` is
 * deliberately not settable through the sign-up body itself (see
 * lib/auth/auth.ts: input: false), so this two-step is required by
 * design, not a shortcut around it.
 *
 * Run with: npx tsx --conditions=react-server prisma/seed-admin.ts
 * (the react-server condition is required so the "server-only" import
 * inside lib/auth/auth.ts resolves to its no-op stub instead of
 * throwing — this script isn't running inside Next's server runtime.)
 */
import { randomBytes } from "node:crypto";
import { auth } from "../lib/auth/auth";
import { prisma } from "../lib/db/prisma";

async function main() {
  const email = process.argv[2] ?? "admin@lalunatique.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`A user already exists for ${email} (role: ${existing.role}). Nothing to do.`);
    return;
  }

  const password = randomBytes(12).toString("base64url");

  await auth.api.signUpEmail({ body: { name: "Admin", email, password } });
  await prisma.user.update({ where: { email }, data: { role: "ADMIN", emailVerified: true } });

  console.log("Admin account created — dev-only credentials, store them yourself, they are not saved anywhere:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
