import { z } from "zod";

export const addQuoteSchema = z.object({
  quote: z.string().trim().min(1, "Quote is required"),
  author: z.string().trim().optional(),
  source: z.string().trim().optional(),
  language: z.enum(["en", "th", "my"]),
  context: z.string().trim().optional(),
});

export type AddQuoteFormValues = z.infer<typeof addQuoteSchema>;

export const defaultValues: AddQuoteFormValues = {
  quote: "",
  author: "",
  source: "",
  language: "en",
  context: "",
};
