"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "./auth";
import { APIError } from "better-auth/api";

export type FormResult = { ok: true } | { ok: false; error: string };

export async function customerRegister(_prevState: FormResult | null, formData: FormData): Promise<FormResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const marketingOptIn = formData.get("marketingOptIn") === "on";

  if (!name || !email || !password) return { ok: false, error: "Please fill in every field." };

  try {
    await auth.api.signUpEmail({
      body: { name, email, password, marketingOptIn },
      headers: await headers(),
    });
  } catch (e) {
    if (e instanceof APIError) {
      return { ok: false, error: "Could not create an account with these details. Try signing in instead." };
    }
    throw e;
  }

  redirect("/account");
}

/**
 * The error message is intentionally the same whether the email doesn't
 * exist or the password is wrong — telling those apart would let an
 * attacker enumerate which emails have accounts here.
 */
export async function customerLogin(_prevState: FormResult | null, formData: FormData): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Enter your email and password." };

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (e) {
    if (e instanceof APIError) return { ok: false, error: "Incorrect email or password." };
    throw e;
  }

  redirect("/account");
}

/**
 * Always returns the same message regardless of whether the email is
 * registered — same enumeration-safety reasoning as customerLogin.
 */
export async function requestPasswordReset(_prevState: FormResult | null, formData: FormData): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Enter your email address." };

  try {
    await auth.api.requestPasswordReset({ body: { email } });
  } catch (e) {
    if (!(e instanceof APIError)) throw e;
  }

  return { ok: true };
}

export async function submitPasswordReset(_prevState: FormResult | null, formData: FormData): Promise<FormResult> {
  const token = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!token) return { ok: false, error: "This reset link is invalid or has expired." };
  if (newPassword.length < 8) return { ok: false, error: "New password must be at least 8 characters." };

  try {
    await auth.api.resetPassword({ body: { newPassword, token } });
  } catch (e) {
    if (e instanceof APIError) return { ok: false, error: "This reset link is invalid or has expired." };
    throw e;
  }

  redirect("/account/login?reset=success");
}
