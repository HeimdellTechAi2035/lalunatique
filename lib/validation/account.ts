import { z } from "zod";

export const AddressFormSchema = z.object({
  label: z.string().min(1, "Give this address a label, e.g. Home"),
  name: z.string().min(1, "Full name is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Town or city is required"),
  postcode: z.string().min(1, "Postcode is required"),
});
export type AddressFormValues = z.infer<typeof AddressFormSchema>;
