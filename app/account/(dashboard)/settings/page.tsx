import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { getSettingsForUser } from "@/lib/account/settings";
import { SettingsForm } from "@/components/account/SettingsForm";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata: Metadata = { title: "Account Settings" };

export default async function AccountSettingsPage() {
  const session = await getCurrentSession();
  const settings = session ? await getSettingsForUser(session.user.id) : undefined;

  return (
    <div>
      <SectionHeading title="Settings" align="left" />
      <div className="mt-6">
        {settings ? <SettingsForm settings={settings} /> : null}
      </div>
    </div>
  );
}
