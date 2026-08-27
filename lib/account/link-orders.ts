import "server-only";
import { prisma } from "@/lib/db/prisma";
import { requireCustomer } from "@/lib/auth/session";

/**
 * Attaches any unlinked guest orders placed under this account's email
 * to this account. Only ever runs for the signed-in user's own id, and
 * only once `user.emailVerified` is true — i.e. only after better-auth
 * has confirmed this person actually controls that inbox (see
 * lib/auth/auth.ts emailVerification). Matching on email alone at
 * sign-up time would let anyone claim another person's order history
 * just by registering with their email address; gating on verification
 * closes that.
 */
export async function linkVerifiedGuestOrders(): Promise<{ linked: number }> {
  const { user } = await requireCustomer();

  const fresh = await prisma.user.findUnique({ where: { id: user.id } });
  if (!fresh?.emailVerified) return { linked: 0 };

  const result = await prisma.order.updateMany({
    where: { email: fresh.email, userId: null },
    data: { userId: fresh.id },
  });

  return { linked: result.count };
}
