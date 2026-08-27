"use client";

import { useActionState } from "react";
import Link from "next/link";
import { customerRegister, type FormResult } from "@/lib/auth/customer-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: FormResult | null = null;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(customerRegister, initialState);

  return (
    <>
      <form action={formAction} className="mt-6 space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-name">Full name</Label>
          <Input id="register-name" name="name" required autoComplete="name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email">Email</Label>
          <Input id="register-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="marketingOptIn" />
          Send me offers and product news
        </label>
        {state && !state.ok ? <p className="text-sm text-danger">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/account/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
