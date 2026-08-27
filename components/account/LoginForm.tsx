"use client";

import { useActionState } from "react";
import Link from "next/link";
import { customerLogin, type FormResult } from "@/lib/auth/customer-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: FormResult | null = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(customerLogin, initialState);

  return (
    <>
      <form action={formAction} className="mt-6 space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input id="login-password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {state && !state.ok ? <p className="text-sm text-danger">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link href="/account/forgot-password" className="text-accent hover:underline">
          Forgot password?
        </Link>
        <Link href="/account/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </div>
    </>
  );
}
