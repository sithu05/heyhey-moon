import { and, desc, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";

import { idParamSchema } from "@/shared/validation/schemas";
import { zValidator } from "@/shared/validation/zod-validator";
import { aiModels, db } from "@repo/db";

import { listAiModelsQuerySchema } from "./schemas";

export const router = new Hono();

function maskApiKey(key: string): string {
  return key.length <= 4 ? "****" : `****${key.slice(-4)}`;
}

function toResponse(model: typeof aiModels.$inferSelect) {
  const { apiKey, ...rest } = model;
  return { ...rest, apiKeyMasked: maskApiKey(apiKey) };
}

router.get("/", zValidator("query", listAiModelsQuerySchema), async (c) => {
  const { provider, isActive } = c.req.valid("query");

  const conditions: SQL[] = [];

  if (provider !== undefined) {
    conditions.push(eq(aiModels.provider, provider));
  }

  if (isActive !== undefined) {
    conditions.push(eq(aiModels.isActive, isActive));
  }

  const allModels = await db
    .select()
    .from(aiModels)
    .where(and(...conditions))
    .orderBy(desc(aiModels.createdAt));

  return c.json(allModels.map(toResponse));
});

router.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));

  if (!model) {
    return c.json({ error: "AI model not found" }, 404);
  }

  return c.json(toResponse(model));
});
