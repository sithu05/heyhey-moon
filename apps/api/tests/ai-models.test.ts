import { eq } from "drizzle-orm";
import { afterAll, expect, test } from "vitest";

import { aiModels, db } from "@repo/db";

import { app } from "../src/app";

const createdIds: number[] = [];

afterAll(async () => {
  for (const id of createdIds) {
    await db.delete(aiModels).where(eq(aiModels.id, id));
  }
});

test("GET /ai-models lists models with masked api keys", async () => {
  const [model] = await db
    .insert(aiModels)
    .values({
      name: "List Test Model",
      description: "Used for list test",
      provider: "openai",
      apiKey: "sk-list-test-1234",
    })
    .returning();
  createdIds.push(model.id);

  const res = await app.request("/ai-models");
  expect(res.status).toBe(200);

  const body = await res.json();
  const found = body.find((m: { id: number }) => m.id === model.id);
  expect(found).toBeDefined();
  expect(found.apiKeyMasked).toBe("****1234");
  expect(found.apiKey).toBeUndefined();
  expect(found.name).toBe("List Test Model");
  expect(found.provider).toBe("openai");
});

test("GET /ai-models?provider=anthropic filters by provider", async () => {
  const [model] = await db
    .insert(aiModels)
    .values({
      name: "Anthropic Filter Model",
      provider: "anthropic",
      apiKey: "sk-ant-filter-5678",
    })
    .returning();
  createdIds.push(model.id);

  const res = await app.request("/ai-models?provider=anthropic");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  expect(
    body.every((m: { provider: string }) => m.provider === "anthropic"),
  ).toBe(true);
});

test("GET /ai-models?isActive=false filters by isActive", async () => {
  const [model] = await db
    .insert(aiModels)
    .values({
      name: "Inactive Model",
      provider: "huggingface",
      apiKey: "sk-hf-inactive-9999",
      isActive: false,
    })
    .returning();
  createdIds.push(model.id);

  const res = await app.request("/ai-models?isActive=false");
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.some((m: { id: number }) => m.id === model.id)).toBe(true);
  expect(body.every((m: { isActive: boolean }) => m.isActive === false)).toBe(
    true,
  );
});

test("GET /ai-models?provider=invalid returns 400", async () => {
  const res = await app.request("/ai-models?provider=invalid");
  expect(res.status).toBe(400);
});

test("GET /ai-models?isActive=notabool returns 400", async () => {
  const res = await app.request("/ai-models?isActive=notabool");
  expect(res.status).toBe(400);
});

test("GET /ai-models/:id returns the matching model with masked api key", async () => {
  const [model] = await db
    .insert(aiModels)
    .values({
      name: "Get By Id Model",
      provider: "openai",
      apiKey: "sk-getbyid-abcd",
    })
    .returning();
  createdIds.push(model.id);

  const res = await app.request(`/ai-models/${model.id}`);
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(body.id).toBe(model.id);
  expect(body.apiKeyMasked).toBe("****abcd");
  expect(body.apiKey).toBeUndefined();
});

test("GET /ai-models/:id returns 404 for a non-existent id", async () => {
  const res = await app.request("/ai-models/999999999");
  expect(res.status).toBe(404);
});

test("GET /ai-models/:id returns 400 for a non-numeric id", async () => {
  const res = await app.request("/ai-models/not-a-number");
  expect(res.status).toBe(400);
});
