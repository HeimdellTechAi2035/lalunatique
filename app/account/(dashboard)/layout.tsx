import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { linkVerifiedGuestOrders } from "@/lib/account/link-orders";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default async function AccountDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/account/login");

  // Cheap and idempotent (a no-op update when there's nothing unlinked
  // for this email) — runs on every dashboard visit as a fallback for
  // when the verification email link itself is opened signed-out.
  await linkVerifiedGuestOrders();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
