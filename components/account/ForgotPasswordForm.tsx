"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type FormResult } from "@/lib/auth/customer-actions";
import { GENERIC_RESET_MESSAGE } from "@/lib/utils/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: FormResult | null = null;

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state?.ok) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm text-ink">{GENERIC_RESET_MESSAGE}</p>
        <Link href="/account/login" className="text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input id="forgot-email" name="email" type="email" required autoComplete="email" />
      </div>
      {state && !state.ok ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
