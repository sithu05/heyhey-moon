import { desc } from "drizzle-orm";
import { Hono } from "hono";

import { zValidator } from "@/shared/validation/zod-validator";
import { db, memos } from "@repo/db";

import { createMemoSchema } from "./schemas";

export const router = new Hono();

router.get("/", async (c) => {
  const allMemos = await db.select().from(memos).orderBy(desc(memos.createdAt));

  return c.json(allMemos);
});

router.post("/", zValidator("json", createMemoSchema), async (c) => {
  const { title, content } = c.req.valid("json");

  const [memo] = await db.insert(memos).values({ title, content }).returning();

  return c.json(memo, 201);
});
