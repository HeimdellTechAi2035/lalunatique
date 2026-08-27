"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { refundOrder, type RefundResult } from "@/lib/payments/refunds";

const RefundInputSchema = z.object({
  orderId: z.string().min(1),
  amountInPence: z.number().int().positive().optional(),
});

/**
 * Independently re-verifies admin authorisation itself (requireAdmin
 * throws for anyone else) rather than relying on the admin dashboard
 * layout — same pattern as every other admin action in this codebase.
 */
export async function issueRefundAction(input: unknown): Promise<RefundResult> {
  await requireAdmin();

  const parsed = RefundInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" ") };

  const result = await refundOrder(parsed.data.orderId, parsed.data.amountInPence);
  if (result.ok) revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return result;
}
