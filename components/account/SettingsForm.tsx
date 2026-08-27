"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateSettings, changePassword } from "@/lib/account/actions";
import type { AccountSettings } from "@/lib/account/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SettingsForm({ settings }: { settings: AccountSettings }) {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ name: string; marketingOptIn: boolean }>({
    defaultValues: { name: settings.name, marketingOptIn: settings.marketingOptIn },
  });

  async function onSubmit(values: { name: string; marketingOptIn: boolean }) {
    const result = await updateSettings(values);
    setSaved(result.ok);
  }

  return (
    <div className="max-w-md space-y-10">
      <form onSubmit={handleSubmit(onSubmit)} onChange={() => setSaved(false)} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-name">Full name</Label>
          <Input id="settings-name" {...register("name")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-email">Email</Label>
          <Input id="settings-email" type="email" value={settings.email} disabled readOnly />
          <p className="text-xs text-muted">Your sign-in email can&apos;t be changed here yet.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" {...register("marketingOptIn")} />
          Send me offers and product news
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
          {saved ? <span className="text-sm text-success">Saved</span> : null}
        </div>
      </form>

      <ChangePasswordForm />
    </div>
  );
}

function ChangePasswordForm() {
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{ currentPassword: string; newPassword: string }>();

  async function onSubmit(values: { currentPassword: string; newPassword: string }) {
    setStatus(null);
    const result = await changePassword(values);
    if (result.ok) {
      setStatus({ ok: true, message: "Password updated." });
      reset();
    } else {
      setStatus({ ok: false, message: result.errors[0] });
    }
  }

  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-sm font-semibold text-ink">Change password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input id="current-password" type="password" required {...register("currentPassword")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" required minLength={8} {...register("newPassword")} />
        </div>
        {status ? (
          <p className={`text-sm ${status.ok ? "text-success" : "text-danger"}`}>{status.message}</p>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
