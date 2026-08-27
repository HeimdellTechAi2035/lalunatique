"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressFormSchema, type AddressFormValues } from "@/lib/validation/account";
import { addAddress } from "@/lib/account/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AddressForm({ onDone }: { onDone?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddressFormValues>({ resolver: zodResolver(AddressFormSchema) });

  async function onSubmit(values: AddressFormValues) {
    setError(null);
    const result = await addAddress(values);
    if (result.ok) {
      reset();
      onDone?.();
    } else {
      setError(result.errors[0]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-label">Label</Label>
        <Input id="addr-label" placeholder="Home" {...register("label")} />
        {errors.label ? <p className="text-xs text-danger">{errors.label.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-name">Full name</Label>
        <Input id="addr-name" {...register("name")} />
        {errors.name ? <p className="text-xs text-danger">{errors.name.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="addr-line1">Address line 1</Label>
        <Input id="addr-line1" {...register("line1")} />
        {errors.line1 ? <p className="text-xs text-danger">{errors.line1.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="addr-line2">Address line 2 (optional)</Label>
        <Input id="addr-line2" {...register("line2")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-city">Town / City</Label>
        <Input id="addr-city" {...register("city")} />
        {errors.city ? <p className="text-xs text-danger">{errors.city.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-postcode">Postcode</Label>
        <Input id="addr-postcode" {...register("postcode")} />
        {errors.postcode ? <p className="text-xs text-danger">{errors.postcode.message}</p> : null}
      </div>
      {error ? <p className="text-sm text-danger sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save address"}
        </Button>
      </div>
    </form>
  );
}
