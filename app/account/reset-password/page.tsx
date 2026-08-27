import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";

export const metadata: Metadata = { title: "Set New Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-xl font-semibold text-ink">Set a new password</h1>
      {!token ? (
        <p className="mt-4 text-sm text-danger">
          This reset link is missing its token. Request a new one from the reset password page.
        </p>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </div>
  );
}
