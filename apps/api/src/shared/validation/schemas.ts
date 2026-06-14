import { z } from "zod";

export const booleanQueryParam = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const idParamSchema = z.object({
  id: z.coerce.number().int(),
});
