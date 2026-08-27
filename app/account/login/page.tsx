import type { Metadata } from "next";
import { LoginForm } from "@/components/account/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-xl font-semibold text-ink">Sign in</h1>

      {reset === "success" ? (
        <p className="mt-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
          Password updated — sign in with your new password.
        </p>
      ) : null}

      <LoginForm />
    </div>
  );
}
