"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { trackOrder } from "@/lib/orders/track-actions";
import type { Order } from "@/lib/orders/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OrderDetail } from "@/components/account/OrderDetail";

export function TrackOrderForm() {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ orderNumber: string; postcode: string }>();

  async function onSubmit(values: { orderNumber: string; postcode: string }) {
    setError(null);
    const result = await trackOrder(values);
    if (result.ok) {
      setOrder(result.order);
    } else {
      setOrder(null);
      setError(result.error);
    }
  }

  if (order) {
    return (
      <div className="space-y-6">
        <OrderDetail order={order} />
        <Button variant="outline" onClick={() => setOrder(null)}>
          Track another order
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="track-order-number">Order number</Label>
        <Input id="track-order-number" placeholder="LL-100234" {...register("orderNumber", { required: true })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="track-postcode">Delivery postcode</Label>
        <Input id="track-postcode" placeholder="M1 2AB" {...register("postcode", { required: true })} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Looking up…" : "Track order"}
      </Button>
    </form>
  );
}
