"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginResult } from "@/lib/admin/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const initialState: AdminLoginResult | null = null;

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-paper p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Lock className="h-6 w-6 text-accent" aria-hidden />
          <h1 className="text-lg font-semibold text-ink">Admin sign in</h1>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" name="email" type="email" required autoFocus autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state && !state.ok ? <p className="text-sm text-danger">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
