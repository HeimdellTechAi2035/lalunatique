"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewsletterFormSchema, type NewsletterFormValues } from "@/lib/validation/newsletter";
import { HONEYPOT_FIELD } from "@/lib/validation/honeypot";
import { subscribeToNewsletter } from "@/lib/marketing/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type FormValues = NewsletterFormValues & { [HONEYPOT_FIELD]?: string };

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  // This form renders more than once on the same page (homepage section
  // + footer), so ids must be per-instance, not hardcoded — duplicate
  // ids are invalid HTML and were the actual cause of the client/server
  // hydration mismatch previously seen here.
  const instanceId = useId();
  const emailId = `${instanceId}-newsletter-email`;
  const honeypotId = `${instanceId}-newsletter-company-website`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(NewsletterFormSchema),
    defaultValues: { consent: undefined as unknown as true },
  });

  async function onSubmit(values: FormValues) {
    const result = await subscribeToNewsletter(values);
    if (result.ok) {
      setStatus("success");
      reset();
    }
  }

  if (status === "success") {
    return (
      <p className={cn("text-sm", variant === "dark" ? "text-on-dark" : "text-ink")}>
        Thanks — you&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <Input
          id={emailId}
          type="email"
          placeholder="you@example.com"
          className={variant === "dark" ? "bg-surface-dark-raised text-on-dark border-on-dark/20 placeholder:text-on-dark/40" : undefined}
          {...register("email")}
        />
        <Button type="submit" variant={variant === "dark" ? "accent" : "primary"} disabled={isSubmitting}>
          {isSubmitting ? "Joining…" : "Join"}
        </Button>
      </div>
      <label className={cn("flex items-start gap-2 text-xs", variant === "dark" ? "text-on-dark/60" : "text-muted")}>
        <input type="checkbox" className="mt-0.5" {...register("consent")} />
        I&apos;d like to receive marketing emails from La Lunatique. Unsubscribe anytime.
      </label>
      {errors.email ? <p className="text-xs text-danger">{errors.email.message}</p> : null}
      {errors.consent ? <p className="text-xs text-danger">{errors.consent.message}</p> : null}
      {/* Honeypot — hidden from real users, catches simple bots that fill in every field. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor={honeypotId}>Leave this field blank</label>
        <input id={honeypotId} type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
      </div>
    </form>
  );
}
