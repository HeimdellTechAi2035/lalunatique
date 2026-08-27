"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { APIError } from "better-auth/api";

export type AdminLoginResult = { ok: true } | { ok: false; error: string };

/**
 * Same underlying auth system as customer login (better-auth email +
 * password) — admins are just User rows with role "ADMIN". The error
 * message is deliberately generic ("Incorrect email or password") for
 * both a wrong password and a non-admin account, so this endpoint
 * cannot be used to enumerate which emails have admin access.
 */
export async function adminLogin(_prevState: AdminLoginResult | null, formData: FormData): Promise<AdminLoginResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Enter your email and password." };

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    if (result.user.role !== "ADMIN") {
      await auth.api.signOut({ headers: await headers() });
      return { ok: false, error: "Incorrect email or password." };
    }
  } catch (e) {
    if (e instanceof APIError) return { ok: false, error: "Incorrect email or password." };
    throw e;
  }

  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
