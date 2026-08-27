"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { requireCustomer } from "@/lib/auth/session";
import { APIError } from "better-auth/api";

const AddressInputSchema = z.object({
  label: z.string().min(1, "Give this address a label, e.g. Home"),
  name: z.string().min(1, "Full name is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Town or city is required"),
  postcode: z.string().min(1, "Postcode is required"),
});

export type AddAddressResult = { ok: true } | { ok: false; errors: string[] };

export async function addAddress(input: unknown): Promise<AddAddressResult> {
  const parsed = AddressInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  const { user } = await requireCustomer();

  await prisma.address.create({
    data: { userId: user.id, country: "United Kingdom", isDefault: false, ...parsed.data },
  });

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function removeAddress(id: string): Promise<void> {
  const { user } = await requireCustomer();
  // The userId condition here is the actual authorization check — it
  // ensures this delete can only ever touch a row owned by the caller,
  // regardless of what id a request supplies.
  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/addresses");
}

const SettingsInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  marketingOptIn: z.boolean(),
});

export type UpdateSettingsResult = { ok: true } | { ok: false; errors: string[] };

/**
 * Email is deliberately not editable here — better-auth's change-email
 * flow (re-verification of the new address) isn't wired up in this
 * build stage, and silently allowing an email change without
 * re-verification would undermine the verified-email-gated guest-order
 * linking in lib/account/link-orders.ts.
 */
export async function updateSettings(input: unknown): Promise<UpdateSettingsResult> {
  const parsed = SettingsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  const { user } = await requireCustomer();
  await prisma.user.update({ where: { id: user.id }, data: parsed.data });

  revalidatePath("/account/settings");
  return { ok: true };
}

const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type ChangePasswordResult = { ok: true } | { ok: false; errors: string[] };

export async function changePassword(input: unknown): Promise<ChangePasswordResult> {
  const parsed = ChangePasswordInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  await requireCustomer();

  try {
    await auth.api.changePassword({
      body: { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword },
      headers: await headers(),
    });
  } catch (e) {
    if (e instanceof APIError) return { ok: false, errors: ["Current password is incorrect."] };
    throw e;
  }

  return { ok: true };
}
