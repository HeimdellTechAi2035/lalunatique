import "server-only";
import { prisma } from "@/lib/db/prisma";

export type AccountSettings = {
  userId: string;
  name: string;
  email: string;
  marketingOptIn: boolean;
};

export async function getSettingsForUser(userId: string): Promise<AccountSettings | undefined> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return undefined;
  return { userId: user.id, name: user.name, email: user.email, marketingOptIn: user.marketingOptIn };
}
