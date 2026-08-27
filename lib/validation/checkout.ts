import { z } from "zod";

export const CheckoutAddressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Town or city is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.literal("United Kingdom"),
});

export type CheckoutAddressValues = z.infer<typeof CheckoutAddressSchema>;
