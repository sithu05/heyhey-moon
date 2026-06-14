import { z } from "zod";

import { booleanQueryParam } from "@/shared/validation/schemas";
import { aiModelProviderEnum } from "@repo/db";

export const listAiModelsQuerySchema = z.object({
  provider: z.enum(aiModelProviderEnum.enumValues).optional(),
  isActive: booleanQueryParam.optional(),
});
