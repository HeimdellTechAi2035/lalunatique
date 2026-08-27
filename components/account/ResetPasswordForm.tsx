"use client";

import { useActionState } from "react";
import { submitPasswordReset, type FormResult } from "@/lib/auth/customer-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: FormResult | null = null;

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(submitPasswordReset, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input id="new-password" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state && !state.ok ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending || !token}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
