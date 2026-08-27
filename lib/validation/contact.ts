import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  orderNumber: z.string().optional(),
  topic: z.enum(["order", "product", "returns", "other"]),
  message: z.string().min(10, "Please enter at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;
