import { zValidator as zv } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { z } from "zod";

export const zValidator = <
  Target extends keyof ValidationTargets,
  Schema extends z.ZodType,
>(
  target: Target,
  schema: Schema,
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: z.prettifyError(result.error) }, 400);
    }
  });
