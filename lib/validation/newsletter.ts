import { z } from "zod";

export const NewsletterFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  consent: z.literal(true, { message: "Please confirm you'd like to receive marketing emails" }),
});

export type NewsletterFormValues = z.infer<typeof NewsletterFormSchema>;
