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
