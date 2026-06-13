import { desc } from "drizzle-orm";
import { Hono } from "hono";

import { db, memos } from "@repo/db";

export const memosRouter = new Hono();

memosRouter.get("/", async (c) => {
  const allMemos = await db.select().from(memos).orderBy(desc(memos.createdAt));

  return c.json(allMemos);
});

memosRouter.post("/", async (c) => {
  let body: { title?: unknown; content?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (typeof body.title !== "string" || typeof body.content !== "string") {
    return c.json({ error: "title and content are required" }, 400);
  }

  const [memo] = await db
    .insert(memos)
    .values({ title: body.title, content: body.content })
    .returning();

  return c.json(memo, 201);
});
