"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactFormSchema, type ContactFormValues } from "@/lib/validation/contact";
import { HONEYPOT_FIELD } from "@/lib/validation/honeypot";
import { submitContactMessage } from "@/lib/support/actions";

type FormValues = ContactFormValues & { [HONEYPOT_FIELD]?: string };
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";

const topics = [
  { value: "order", label: "An existing order" },
  { value: "product", label: "A product question" },
  { value: "returns", label: "Returns or refunds" },
  { value: "other", label: "Something else" },
] as const;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: { topic: "product" },
  });

  async function onSubmit(values: FormValues) {
    const result = await submitContactMessage(values);
    setStatus(result.ok ? "success" : "error");
    if (result.ok) reset();
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-6 text-success">
        <p className="font-medium">Thanks — we&apos;ve received your message.</p>
        <p className="mt-1 text-sm">Our team will get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name ? <p className="text-xs text-danger">{errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email ? <p className="text-xs text-danger">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-topic">What&apos;s this about?</Label>
          <Controller
            control={control}
            name="topic"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="contact-topic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-order-number">Order number (optional)</Label>
          <Input id="contact-order-number" placeholder="LL-100234" {...register("orderNumber")} />
        </div>
      </div>

      {/* Honeypot — hidden from real users, catches simple bots that fill in every field. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="contact-company-website">Leave this field blank</label>
        <input id="contact-company-website" type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" rows={5} {...register("message")} aria-invalid={!!errors.message} />
        {errors.message ? <p className="text-xs text-danger">{errors.message.message}</p> : null}
      </div>

      {status === "error" ? <p className="text-sm text-danger">Something went wrong — please try again.</p> : null}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
