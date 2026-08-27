export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type OrderLine = {
  slug: string;
  name: string;
  qty: number;
  unitPriceInPence: number;
  lineTotalInPence: number;
  image: { src: string; alt: string; isPlaceholder: boolean };
};

export type TrackingEvent = {
  status: OrderStatus;
  label: string;
  dateIso: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  email: string;
  placedAtIso: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotalInPence: number;
  discountInPence: number;
  shippingInPence: number;
  totalInPence: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  trackingNumber: string | null;
  trackingEvents: TrackingEvent[];
};
