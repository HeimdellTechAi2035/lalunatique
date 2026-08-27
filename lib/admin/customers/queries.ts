import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAllCustomersForAdmin() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { totalInPence: true } } },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((c) => ({
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    marketingOptIn: c.marketingOptIn,
    createdAt: c.createdAt,
    orderCount: c.orders.length,
    totalSpentInPence: c.orders.reduce((sum, o) => sum + o.totalInPence, 0),
  }));
}

export async function getCustomerForAdmin(id: string) {
  return prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    include: {
      addresses: true,
      orders: {
        orderBy: { placedAt: "desc" },
        include: { items: true },
      },
    },
  });
}
