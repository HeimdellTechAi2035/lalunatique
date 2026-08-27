import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { linkVerifiedGuestOrders } from "@/lib/account/link-orders";

export const metadata: Metadata = { title: "Email Verified" };

export default async function EmailVerifiedPage() {
  const session = await getCurrentSession();
  const linked = session ? (await linkVerifiedGuestOrders()).linked : 0;

  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
      <h1 className="text-xl font-semibold text-ink">Email verified</h1>
      <p className="mt-2 text-sm text-muted">
        {linked > 0
          ? `Your email is verified — we also found ${linked} past guest order${linked === 1 ? "" : "s"} placed with this email and added ${linked === 1 ? "it" : "them"} to your account.`
          : "Your email is verified."}
      </p>
      <Link href="/account" className="mt-6 inline-block text-sm text-accent hover:underline">
        Go to my account
      </Link>
    </div>
  );
}
