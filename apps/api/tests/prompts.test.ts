import { db, prompts } from "@repo/db";
import { eq } from "drizzle-orm";
import { afterAll, expect, test } from "vitest";

import { app } from "../src/app";

const createdIds: number[] = [];

afterAll(async () => {
  for (const id of createdIds) {
    await db.delete(prompts).where(eq(prompts.id, id));
  }
});

test("POST /prompts creates a prompt", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Daily gratitude",
      content: "What are you grateful for today?",
      category: "journaling",
      type: "journal-prompt",
    }),
  });

  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body).toMatchObject({
    title: "Daily gratitude",
    content: "What are you grateful for today?",
    category: "journaling",
    type: "journal-prompt",
    isActive: true,
  });
  expect(typeof body.id).toBe("number");
  createdIds.push(body.id);
});

test("POST /prompts accepts an optional description and isActive", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Memo summarizer",
      description: "Used to summarize a memo into one sentence",
      content: "Summarize the following memo in one sentence: {{memo}}",
      category: "ai",
      type: "ai-system",
      isActive: false,
    }),
  });

  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body).toMatchObject({
    title: "Memo summarizer",
    description: "Used to summarize a memo into one sentence",
    isActive: false,
  });
  createdIds.push(body.id);
});

test("POST /prompts returns 400 when title or content is missing", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Missing content",
      category: "general",
      type: "journal-prompt",
    }),
  });

  expect(res.status).toBe(400);
});

test("POST /prompts returns 400 for an invalid category", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Bad category",
      content: "content",
      category: "not-a-real-category",
      type: "journal-prompt",
    }),
  });

  expect(res.status).toBe(400);
});

test("POST /prompts returns 400 for an invalid type", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Bad type",
      content: "content",
      category: "general",
      type: "not-a-real-type",
    }),
  });

  expect(res.status).toBe(400);
});

test("POST /prompts returns 400 for an invalid JSON body", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });

  expect(res.status).toBe(400);
});

test("GET /prompts lists prompts ordered by createdAt desc", async () => {
  const [older] = await db
    .insert(prompts)
    .values({
      title: "List Older",
      content: "older content",
      category: "ai",
      type: "ai-system",
      createdAt: new Date(Date.now() - 60_000),
    })
    .returning();
  const [newer] = await db
    .insert(prompts)
    .values({
      title: "List Newer",
      content: "newer content",
      category: "journaling",
      type: "journal-prompt",
      createdAt: new Date(),
    })
    .returning();
  createdIds.push(older.id, newer.id);

  const res = await app.request("/prompts");
  expect(res.status).toBe(200);

  const body = await res.json();
  const ids: number[] = body.map((p: { id: number }) => p.id);
  expect(ids.indexOf(newer.id)).toBeLessThan(ids.indexOf(older.id));
});

test("GET /prompts?category=ai filters by category", async () => {
  const res = await app.request("/prompts?category=ai");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  expect(body.every((p: { category: string }) => p.category === "ai")).toBe(true);
});

test("GET /prompts?type=journal-prompt filters by type", async () => {
  const res = await app.request("/prompts?type=journal-prompt");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  expect(body.every((p: { type: string }) => p.type === "journal-prompt")).toBe(true);
});

test("GET /prompts?isActive=false filters by isActive", async () => {
  const [inactive] = await db
    .insert(prompts)
    .values({
      title: "Inactive General Prompt",
      content: "inactive content",
      category: "general",
      type: "ai-system",
      isActive: false,
    })
    .returning();
  createdIds.push(inactive.id);

  const res = await app.request("/prompts?isActive=false");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.some((p: { id: number }) => p.id === inactive.id)).toBe(true);
  expect(body.every((p: { isActive: boolean }) => p.isActive === false)).toBe(true);
});

test("GET /prompts?category=invalid returns 400", async () => {
  const res = await app.request("/prompts?category=invalid");
  expect(res.status).toBe(400);
});

test("GET /prompts?type=invalid returns 400", async () => {
  const res = await app.request("/prompts?type=invalid");
  expect(res.status).toBe(400);
});

test("GET /prompts?isActive=notabool returns 400", async () => {
  const res = await app.request("/prompts?isActive=notabool");
  expect(res.status).toBe(400);
});

test("GET /prompts/lookup returns the newest active match", async () => {
  const [older] = await db
    .insert(prompts)
    .values({
      title: "Lookup Older AI System",
      content: "older",
      category: "ai",
      type: "ai-system",
      isActive: true,
      createdAt: new Date(Date.now() - 60_000),
    })
    .returning();
  const [newer] = await db
    .insert(prompts)
    .values({
      title: "Lookup Newer AI System",
      content: "newer",
      category: "ai",
      type: "ai-system",
      isActive: true,
      createdAt: new Date(Date.now() + 60_000),
    })
    .returning();
  createdIds.push(older.id, newer.id);

  const res = await app.request("/prompts/lookup?category=ai&type=ai-system");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.id).toBe(newer.id);
});

test("GET /prompts/lookup excludes inactive prompts (404 when only inactive matches exist)", async () => {
  const [inactive] = await db
    .insert(prompts)
    .values({
      title: "Lookup Inactive General Journal",
      content: "inactive",
      category: "general",
      type: "journal-prompt",
      isActive: false,
    })
    .returning();
  createdIds.push(inactive.id);

  const res = await app.request("/prompts/lookup?category=general&type=journal-prompt");
  expect(res.status).toBe(404);
});

test("GET /prompts/lookup returns 400 when category is missing", async () => {
  const res = await app.request("/prompts/lookup?type=ai-system");
  expect(res.status).toBe(400);
});

test("GET /prompts/lookup returns 400 when type is missing", async () => {
  const res = await app.request("/prompts/lookup?category=ai");
  expect(res.status).toBe(400);
});

test("GET /prompts/lookup returns 400 for an invalid category", async () => {
  const res = await app.request("/prompts/lookup?category=invalid&type=ai-system");
  expect(res.status).toBe(400);
});
