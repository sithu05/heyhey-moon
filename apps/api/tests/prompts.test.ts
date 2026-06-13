import { eq } from "drizzle-orm";
import { afterAll, beforeAll, expect, test } from "vitest";

import { aiModels, db, prompts } from "@repo/db";

import { app } from "../src/app";

const createdIds: number[] = [];
let testModelId: number;

beforeAll(async () => {
  const [model] = await db
    .insert(aiModels)
    .values({
      name: "Test Model for Prompts",
      provider: "openai",
      apiKey: "sk-test-prompts-model",
    })
    .returning();
  testModelId = model.id;
});

afterAll(async () => {
  for (const id of createdIds) {
    await db.delete(prompts).where(eq(prompts.id, id));
  }
  await db.delete(aiModels).where(eq(aiModels.id, testModelId));
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
      modelId: testModelId,
    }),
  });

  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body).toMatchObject({
    title: "Daily gratitude",
    content: "What are you grateful for today?",
    category: "journaling",
    type: "journal-prompt",
    modelId: testModelId,
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
      modelId: testModelId,
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
      modelId: testModelId,
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
      modelId: testModelId,
    }),
  });

  expect(res.status).toBe(400);
});

test("POST /prompts returns 400 when modelId is missing or not an integer", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Missing modelId",
      content: "content",
      category: "general",
      type: "journal-prompt",
    }),
  });

  expect(res.status).toBe(400);
});

test("POST /prompts returns 400 when modelId does not reference an existing AI model", async () => {
  const res = await app.request("/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Nonexistent model",
      content: "content",
      category: "general",
      type: "journal-prompt",
      modelId: 999999999,
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
      modelId: testModelId,
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
      modelId: testModelId,
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
  expect(body.every((p: { category: string }) => p.category === "ai")).toBe(
    true,
  );
});

test("GET /prompts?type=journal-prompt filters by type", async () => {
  const res = await app.request("/prompts?type=journal-prompt");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  expect(body.every((p: { type: string }) => p.type === "journal-prompt")).toBe(
    true,
  );
});

test("GET /prompts?isActive=false filters by isActive", async () => {
  const [inactive] = await db
    .insert(prompts)
    .values({
      title: "Inactive General Prompt",
      content: "inactive content",
      category: "general",
      type: "ai-system",
      modelId: testModelId,
      isActive: false,
    })
    .returning();
  createdIds.push(inactive.id);

  const res = await app.request("/prompts?isActive=false");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.some((p: { id: number }) => p.id === inactive.id)).toBe(true);
  expect(body.every((p: { isActive: boolean }) => p.isActive === false)).toBe(
    true,
  );
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
      modelId: testModelId,
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
      modelId: testModelId,
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
      modelId: testModelId,
      isActive: false,
    })
    .returning();
  createdIds.push(inactive.id);

  const res = await app.request(
    "/prompts/lookup?category=general&type=journal-prompt",
  );
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
  const res = await app.request(
    "/prompts/lookup?category=invalid&type=ai-system",
  );
  expect(res.status).toBe(400);
});

test("GET /prompts/:id returns the matching prompt", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Get By Id Prompt",
      content: "content",
      category: "journaling",
      type: "ai-system",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id);

  const res = await app.request(`/prompts/${seed.id}`);
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.id).toBe(seed.id);
  expect(body.title).toBe("Get By Id Prompt");
});

test("GET /prompts/:id returns 404 for a non-existent id", async () => {
  const res = await app.request("/prompts/999999999");
  expect(res.status).toBe(404);
});

test("GET /prompts/:id returns 400 for a non-numeric id", async () => {
  const res = await app.request("/prompts/not-a-number");
  expect(res.status).toBe(400);
});

test("PATCH /prompts/:id updates provided fields and bumps updatedAt", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Target",
      content: "original content",
      category: "ai",
      type: "journal-prompt",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id);

  const res = await app.request(`/prompts/${seed.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Patched Title", isActive: false }),
  });

  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.title).toBe("Patched Title");
  expect(body.isActive).toBe(false);
  expect(body.content).toBe("original content");
  expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(
    new Date(seed.updatedAt).getTime(),
  );
});

test("PATCH /prompts/:id returns 404 for a non-existent id", async () => {
  const res = await app.request("/prompts/999999999", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Doesn't matter" }),
  });

  expect(res.status).toBe(404);
});

test("PATCH /prompts/:id returns 400 for an invalid category", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Invalid Category",
      content: "content",
      category: "general",
      type: "journal-prompt",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id);

  const res = await app.request(`/prompts/${seed.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "not-a-real-category" }),
  });

  expect(res.status).toBe(400);
});

test("PATCH /prompts/:id returns 400 when modelId is not an integer", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Invalid ModelId",
      content: "content",
      category: "general",
      type: "journal-prompt",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id);

  const res = await app.request(`/prompts/${seed.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId: "not-a-number" }),
  });

  expect(res.status).toBe(400);
});

test("PATCH /prompts/:id returns 400 when modelId does not reference an existing AI model", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Nonexistent ModelId",
      content: "content",
      category: "general",
      type: "journal-prompt",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id);

  const res = await app.request(`/prompts/${seed.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId: 999999999 }),
  });

  expect(res.status).toBe(400);
});

test("PATCH /prompts/:id returns 400 for an invalid JSON body", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Invalid JSON",
      content: "content",
      category: "general",
      type: "journal-prompt",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id);

  const res = await app.request(`/prompts/${seed.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });

  expect(res.status).toBe(400);
});

test("PATCH /prompts/:id returns 400 for an empty update body", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Empty Body",
      content: "content",
      category: "general",
      type: "journal-prompt",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id);

  const res = await app.request(`/prompts/${seed.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  expect(res.status).toBe(400);
});

test("DELETE /prompts/:id deletes the prompt", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Delete Target",
      content: "content",
      category: "general",
      type: "journal-prompt",
      modelId: testModelId,
    })
    .returning();
  createdIds.push(seed.id); // defensive: afterAll delete is a no-op if already deleted below

  const res = await app.request(`/prompts/${seed.id}`, { method: "DELETE" });
  expect(res.status).toBe(204);

  const getRes = await app.request(`/prompts/${seed.id}`);
  expect(getRes.status).toBe(404);
});

test("DELETE /prompts/:id returns 404 for a non-existent id", async () => {
  const res = await app.request("/prompts/999999999", { method: "DELETE" });
  expect(res.status).toBe(404);
});

test("DELETE /prompts/:id returns 400 for a non-numeric id", async () => {
  const res = await app.request("/prompts/not-a-number", { method: "DELETE" });
  expect(res.status).toBe(400);
});
