import "server-only";
import { prisma } from "@/lib/db/prisma";

export type Address = {
  id: string;
  userId: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
};

export async function getAddressesForUser(userId: string): Promise<Address[]> {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    label: r.label ?? "Address",
    name: r.name,
    line1: r.line1,
    line2: r.line2 ?? undefined,
    city: r.city,
    postcode: r.postcode,
    country: r.country,
    isDefault: r.isDefault,
  }));
}
