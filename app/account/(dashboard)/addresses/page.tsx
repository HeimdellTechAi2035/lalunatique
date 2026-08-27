import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { getAddressesForUser } from "@/lib/account/addresses";
import { AddressBook } from "@/components/account/AddressBook";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AccountAddressesPage() {
  const session = await getCurrentSession();
  const addresses = session ? await getAddressesForUser(session.user.id) : [];

  return (
    <div>
      <SectionHeading title="Addresses" align="left" />
      <div className="mt-6">
        <AddressBook addresses={addresses} />
      </div>
    </div>
  );
}
