import { and, desc, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";

import { idParamSchema } from "@/shared/validation/schemas";
import { zValidator } from "@/shared/validation/zod-validator";
import { aiModels, db, prompts } from "@repo/db";

import {
  createPromptSchema,
  listPromptsQuerySchema,
  lookupPromptQuerySchema,
  updatePromptSchema,
} from "./schemas";

export const router = new Hono();

router.get("/", zValidator("query", listPromptsQuerySchema), async (c) => {
  const { category, type, isActive } = c.req.valid("query");

  const conditions: SQL[] = [];

  if (category !== undefined) {
    conditions.push(eq(prompts.category, category));
  }

  if (type !== undefined) {
    conditions.push(eq(prompts.type, type));
  }

  if (isActive !== undefined) {
    conditions.push(eq(prompts.isActive, isActive));
  }

  const allPrompts = await db
    .select()
    .from(prompts)
    .where(and(...conditions))
    .orderBy(desc(prompts.createdAt));

  return c.json(allPrompts);
});

router.get(
  "/lookup",
  zValidator("query", lookupPromptQuerySchema),
  async (c) => {
    const { category, type } = c.req.valid("query");

    const [prompt] = await db
      .select()
      .from(prompts)
      .where(
        and(
          eq(prompts.category, category),
          eq(prompts.type, type),
          eq(prompts.isActive, true),
        ),
      )
      .orderBy(desc(prompts.createdAt))
      .limit(1);

    if (!prompt) {
      return c.json(
        { error: "No active prompt found for the given category and type" },
        404,
      );
    }

    return c.json(prompt);
  },
);

router.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  return c.json(prompt);
});

router.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updatePromptSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const updates = c.req.valid("json");

    if (Object.keys(updates).length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    if (updates.modelId !== undefined) {
      const [model] = await db
        .select({ id: aiModels.id })
        .from(aiModels)
        .where(eq(aiModels.id, updates.modelId));

      if (!model) {
        return c.json(
          { error: "modelId does not reference an existing AI model" },
          400,
        );
      }
    }

    const [updated] = await db
      .update(prompts)
      .set(updates)
      .where(eq(prompts.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Prompt not found" }, 404);
    }

    return c.json(updated);
  },
);

router.delete("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const [deleted] = await db
    .delete(prompts)
    .where(eq(prompts.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  return c.body(null, 204);
});

router.post("/", zValidator("json", createPromptSchema), async (c) => {
  const body = c.req.valid("json");

  const [model] = await db
    .select({ id: aiModels.id })
    .from(aiModels)
    .where(eq(aiModels.id, body.modelId));

  if (!model) {
    return c.json(
      { error: "modelId does not reference an existing AI model" },
      400,
    );
  }

  const [prompt] = await db.insert(prompts).values(body).returning();

  return c.json(prompt, 201);
});
