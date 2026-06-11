import { db, promptCategoryEnum, promptTypeEnum, prompts } from "@repo/db";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";

export const promptsRouter = new Hono();

type PromptCategory = (typeof promptCategoryEnum.enumValues)[number];
type PromptType = (typeof promptTypeEnum.enumValues)[number];

function isPromptCategory(value: unknown): value is PromptCategory {
  return (
    typeof value === "string" &&
    (promptCategoryEnum.enumValues as readonly string[]).includes(value)
  );
}

function isPromptType(value: unknown): value is PromptType {
  return (
    typeof value === "string" &&
    (promptTypeEnum.enumValues as readonly string[]).includes(value)
  );
}

promptsRouter.get("/", async (c) => {
  const categoryParam = c.req.query("category");
  const typeParam = c.req.query("type");
  const isActiveParam = c.req.query("isActive");

  const conditions: SQL[] = [];

  if (categoryParam !== undefined) {
    if (!isPromptCategory(categoryParam)) {
      return c.json(
        {
          error: `category must be one of: ${promptCategoryEnum.enumValues.join(", ")}`,
        },
        400,
      );
    }
    conditions.push(eq(prompts.category, categoryParam));
  }

  if (typeParam !== undefined) {
    if (!isPromptType(typeParam)) {
      return c.json(
        {
          error: `type must be one of: ${promptTypeEnum.enumValues.join(", ")}`,
        },
        400,
      );
    }
    conditions.push(eq(prompts.type, typeParam));
  }

  if (isActiveParam !== undefined) {
    if (isActiveParam !== "true" && isActiveParam !== "false") {
      return c.json({ error: "isActive must be 'true' or 'false'" }, 400);
    }
    conditions.push(eq(prompts.isActive, isActiveParam === "true"));
  }

  const allPrompts = await db
    .select()
    .from(prompts)
    .where(and(...conditions))
    .orderBy(desc(prompts.createdAt));

  return c.json(allPrompts);
});

promptsRouter.get("/lookup", async (c) => {
  const categoryParam = c.req.query("category");
  const typeParam = c.req.query("type");

  if (!isPromptCategory(categoryParam)) {
    return c.json(
      {
        error: `category is required and must be one of: ${promptCategoryEnum.enumValues.join(", ")}`,
      },
      400,
    );
  }

  if (!isPromptType(typeParam)) {
    return c.json(
      {
        error: `type is required and must be one of: ${promptTypeEnum.enumValues.join(", ")}`,
      },
      400,
    );
  }

  const [prompt] = await db
    .select()
    .from(prompts)
    .where(
      and(
        eq(prompts.category, categoryParam),
        eq(prompts.type, typeParam),
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
});

promptsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id)) {
    return c.json({ error: "id must be an integer" }, 400);
  }

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  return c.json(prompt);
});

promptsRouter.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id)) {
    return c.json({ error: "id must be an integer" }, 400);
  }

  let body: {
    title?: unknown;
    content?: unknown;
    description?: unknown;
    category?: unknown;
    type?: unknown;
    isActive?: unknown;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const updates: Partial<typeof prompts.$inferInsert> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string") {
      return c.json({ error: "title must be a string" }, 400);
    }
    updates.title = body.title;
  }

  if (body.content !== undefined) {
    if (typeof body.content !== "string") {
      return c.json({ error: "content must be a string" }, 400);
    }
    updates.content = body.content;
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return c.json({ error: "description must be a string or null" }, 400);
    }
    updates.description = body.description;
  }

  if (body.category !== undefined) {
    if (!isPromptCategory(body.category)) {
      return c.json(
        {
          error: `category must be one of: ${promptCategoryEnum.enumValues.join(", ")}`,
        },
        400,
      );
    }
    updates.category = body.category;
  }

  if (body.type !== undefined) {
    if (!isPromptType(body.type)) {
      return c.json(
        {
          error: `type must be one of: ${promptTypeEnum.enumValues.join(", ")}`,
        },
        400,
      );
    }
    updates.type = body.type;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return c.json({ error: "isActive must be a boolean" }, 400);
    }
    updates.isActive = body.isActive;
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
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
});

promptsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id)) {
    return c.json({ error: "id must be an integer" }, 400);
  }

  const [deleted] = await db
    .delete(prompts)
    .where(eq(prompts.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  return c.body(null, 204);
});

promptsRouter.post("/", async (c) => {
  let body: {
    title?: unknown;
    content?: unknown;
    description?: unknown;
    category?: unknown;
    type?: unknown;
    isActive?: unknown;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (typeof body.title !== "string" || typeof body.content !== "string") {
    return c.json({ error: "title and content are required" }, 400);
  }

  if (!isPromptCategory(body.category)) {
    return c.json(
      {
        error: `category must be one of: ${promptCategoryEnum.enumValues.join(", ")}`,
      },
      400,
    );
  }

  if (!isPromptType(body.type)) {
    return c.json(
      { error: `type must be one of: ${promptTypeEnum.enumValues.join(", ")}` },
      400,
    );
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    return c.json({ error: "description must be a string" }, 400);
  }

  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return c.json({ error: "isActive must be a boolean" }, 400);
  }

  const values: typeof prompts.$inferInsert = {
    title: body.title,
    content: body.content,
    category: body.category,
    type: body.type,
  };

  if (body.description !== undefined) {
    values.description = body.description;
  }

  if (body.isActive !== undefined) {
    values.isActive = body.isActive;
  }

  const [prompt] = await db.insert(prompts).values(values).returning();

  return c.json(prompt, 201);
});
