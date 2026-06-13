import { and, desc, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";

import { aiModelProviderEnum, aiModels, db } from "@repo/db";

export const aiModelsRouter = new Hono();

type AiModelProvider = (typeof aiModelProviderEnum.enumValues)[number];

function isAiModelProvider(value: unknown): value is AiModelProvider {
  return (
    typeof value === "string" &&
    (aiModelProviderEnum.enumValues as readonly string[]).includes(value)
  );
}

function maskApiKey(key: string): string {
  return key.length <= 4 ? "****" : `****${key.slice(-4)}`;
}

function toResponse(model: typeof aiModels.$inferSelect) {
  const { apiKey, ...rest } = model;
  return { ...rest, apiKeyMasked: maskApiKey(apiKey) };
}

aiModelsRouter.get("/", async (c) => {
  const providerParam = c.req.query("provider");
  const isActiveParam = c.req.query("isActive");

  const conditions: SQL[] = [];

  if (providerParam !== undefined) {
    if (!isAiModelProvider(providerParam)) {
      return c.json(
        {
          error: `provider must be one of: ${aiModelProviderEnum.enumValues.join(", ")}`,
        },
        400,
      );
    }
    conditions.push(eq(aiModels.provider, providerParam));
  }

  if (isActiveParam !== undefined) {
    if (isActiveParam !== "true" && isActiveParam !== "false") {
      return c.json({ error: "isActive must be 'true' or 'false'" }, 400);
    }
    conditions.push(eq(aiModels.isActive, isActiveParam === "true"));
  }

  const allModels = await db
    .select()
    .from(aiModels)
    .where(and(...conditions))
    .orderBy(desc(aiModels.createdAt));

  return c.json(allModels.map(toResponse));
});

aiModelsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id)) {
    return c.json({ error: "id must be an integer" }, 400);
  }

  const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));

  if (!model) {
    return c.json({ error: "AI model not found" }, 404);
  }

  return c.json(toResponse(model));
});
