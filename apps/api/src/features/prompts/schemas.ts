import { z } from "zod";

import { booleanQueryParam } from "@/shared/validation/schemas";
import { promptCategoryEnum, promptTypeEnum } from "@repo/db";

export const listPromptsQuerySchema = z.object({
  category: z.enum(promptCategoryEnum.enumValues).optional(),
  type: z.enum(promptTypeEnum.enumValues).optional(),
  isActive: booleanQueryParam.optional(),
});

export const lookupPromptQuerySchema = z.object({
  category: z.enum(promptCategoryEnum.enumValues),
  type: z.enum(promptTypeEnum.enumValues),
});

export const createPromptSchema = z.object({
  title: z.string(),
  content: z.string(),
  description: z.string().optional(),
  category: z.enum(promptCategoryEnum.enumValues),
  type: z.enum(promptTypeEnum.enumValues),
  modelId: z.number().int(),
  isActive: z.boolean().optional(),
});

export const updatePromptSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  description: z.string().nullable().optional(),
  category: z.enum(promptCategoryEnum.enumValues).optional(),
  type: z.enum(promptTypeEnum.enumValues).optional(),
  modelId: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
