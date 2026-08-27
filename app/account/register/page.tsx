import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function AccountRegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-xl font-semibold text-ink">Create an account</h1>
      <p className="mt-1 text-sm text-muted">
        You can also check out as a guest — an account just lets you save addresses and see your order history.
      </p>
      <RegisterForm />
    </div>
  );
}
