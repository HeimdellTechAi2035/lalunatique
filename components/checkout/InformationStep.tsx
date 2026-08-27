"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutAddressSchema, type CheckoutAddressValues } from "@/lib/validation/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function InformationStep({
  defaultValues,
  onNext,
}: {
  defaultValues: Partial<CheckoutAddressValues>;
  onNext: (values: CheckoutAddressValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutAddressValues>({
    resolver: zodResolver(CheckoutAddressSchema),
    defaultValues: { country: "United Kingdom", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-ink">Contact</h2>
        <div className="mt-3 flex flex-col gap-1.5">
          <Label htmlFor="checkout-email">Email</Label>
          <Input id="checkout-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email ? <p className="text-xs text-danger">{errors.email.message}</p> : null}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-ink">Delivery address</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="checkout-name">Full name</Label>
            <Input id="checkout-name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name ? <p className="text-xs text-danger">{errors.name.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="checkout-line1">Address line 1</Label>
            <Input id="checkout-line1" {...register("line1")} aria-invalid={!!errors.line1} />
            {errors.line1 ? <p className="text-xs text-danger">{errors.line1.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="checkout-line2">Address line 2 (optional)</Label>
            <Input id="checkout-line2" {...register("line2")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkout-city">Town / City</Label>
            <Input id="checkout-city" {...register("city")} aria-invalid={!!errors.city} />
            {errors.city ? <p className="text-xs text-danger">{errors.city.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkout-postcode">Postcode</Label>
            <Input id="checkout-postcode" {...register("postcode")} aria-invalid={!!errors.postcode} />
            {errors.postcode ? <p className="text-xs text-danger">{errors.postcode.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkout-country">Country</Label>
            <Input id="checkout-country" value="United Kingdom" disabled />
          </div>
        </div>
      </div>

      <Button type="submit" size="lg">
        Continue to shipping
      </Button>
    </form>
  );
}
