import { db, promptCategoryEnum, promptTypeEnum, prompts } from "@repo/db";
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
    typeof value === "string" && (promptTypeEnum.enumValues as readonly string[]).includes(value)
  );
}

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
      { error: `category must be one of: ${promptCategoryEnum.enumValues.join(", ")}` },
      400,
    );
  }

  if (!isPromptType(body.type)) {
    return c.json({ error: `type must be one of: ${promptTypeEnum.enumValues.join(", ")}` }, 400);
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
