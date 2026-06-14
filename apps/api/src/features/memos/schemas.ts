import { z } from "zod";

export const createMemoSchema = z.object({
  title: z.string(),
  content: z.string(),
});
