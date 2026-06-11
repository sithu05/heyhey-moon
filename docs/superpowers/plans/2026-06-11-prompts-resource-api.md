# Prompts Resource API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `prompts` resource (DB table + Hono CRUD API + lookup endpoint) so consumers can manage and query reusable prompt content by `category` and `type`.

**Architecture:** New Drizzle table `prompts` with `prompt_category` and `prompt_type` Postgres enums in `packages/db`. New Hono router `apps/api/src/features/prompts/prompts.routes.ts` mounted at `/prompts`, following the existing `memos` router pattern (manual validation, no zod). Tests run against the real local Postgres via `apps/api/tests/prompts.test.ts`, using `@repo/db`'s `db`/`prompts` directly for test data setup/teardown.

**Tech Stack:** Drizzle ORM (postgres-js), Hono, Vitest, pnpm/Turborepo monorepo.

**Reference spec:** `docs/superpowers/specs/2026-06-11-prompts-resource-api-design.md`

---

## Task 1: Add `prompts` schema to `@repo/db` and prepare local DB

**Files:**
- Create: `packages/db/src/schema/prompts.ts`
- Modify: `packages/db/src/schema/index.ts`
- Create: `packages/db/.env` (copy of `.env.example`)
- Create: `apps/api/.env` (copy of `.env.example`)

- [ ] **Step 1: Start local Postgres**

Run: `docker compose up -d`
Expected: Output shows the `postgres` service created/started (e.g. `Container heyhey-memo-postgres-1  Started`).

Verify it's accepting connections:
Run: `docker compose exec postgres pg_isready -U postgres`
Expected: `... - accepting connections`

- [ ] **Step 2: Create `.env` files**

```bash
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
```

Both files should contain (already the content of `.env.example`):
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/heyhey_memo
```

- [ ] **Step 3: Create the `prompts` schema file**

Create `packages/db/src/schema/prompts.ts`:

```ts
import { boolean, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const promptCategoryEnum = pgEnum("prompt_category", ["general", "journaling", "ai"]);
export const promptTypeEnum = pgEnum("prompt_type", ["journal-prompt", "ai-system"]);

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: promptCategoryEnum("category").notNull(),
  type: promptTypeEnum("type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

- [ ] **Step 4: Export the new schema**

Modify `packages/db/src/schema/index.ts` to:

```ts
export * from "./memos";
export * from "./prompts";
```

- [ ] **Step 5: Type-check and build `@repo/db`**

Run: `pnpm --filter @repo/db check-types`
Expected: exits with no errors.

Run: `pnpm --filter @repo/db build`
Expected: tsdown build completes successfully (no errors), `dist/schema/index.js` regenerated.

- [ ] **Step 6: Push the new schema to the local database**

Run: `pnpm --filter @repo/db db:push`

This is additive (new enums + new table), so drizzle-kit should apply it without an
interactive confirmation prompt. If it does present an interactive "Yes/No" prompt
(e.g. via arrow-key selection), re-run with the non-interactive force flag instead:
`pnpm --filter @repo/db exec drizzle-kit push --force`

Expected: output indicates the `prompt_category` enum, `prompt_type` enum, and
`prompts` table were created.

- [ ] **Step 7: Verify the table exists**

Run: `docker compose exec postgres psql -U postgres -d heyhey_memo -c '\d prompts'`
Expected: shows columns `id, title, description, content, category, type, is_active,
created_at, updated_at`.

- [ ] **Step 8: Commit**

```bash
git add packages/db/src/schema/prompts.ts packages/db/src/schema/index.ts
git commit -m "feat(db): add prompts table with category/type enums"
```

(`.env` files are gitignored — do not add them.)

---

## Task 2: `POST /prompts` — create a prompt (router skeleton + mount)

**Files:**
- Create: `apps/api/src/features/prompts/prompts.routes.ts`
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/tests/prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/api/tests/prompts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: FAIL — `/prompts` doesn't exist yet, so `app.request("/prompts", { method: "POST", ... })`
returns a 404 (Hono's default not-found response), failing the `expect(res.status).toBe(201)`
assertions.

- [ ] **Step 3: Create the prompts router**

Create `apps/api/src/features/prompts/prompts.routes.ts`:

```ts
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
```

- [ ] **Step 4: Mount the router**

Modify `apps/api/src/app.ts`:

```ts
import { Hono } from "hono";

import { memosRouter } from "./features/memos/memos.routes";
import { promptsRouter } from "./features/prompts/prompts.routes";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/memos", memosRouter);
app.route("/prompts", promptsRouter);
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: PASS (all 6 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/features/prompts/prompts.routes.ts apps/api/src/app.ts apps/api/tests/prompts.test.ts
git commit -m "feat(api): add POST /prompts endpoint"
```

---

## Task 3: `GET /prompts` — list with `category`/`type`/`isActive` filters

**Files:**
- Modify: `apps/api/src/features/prompts/prompts.routes.ts`
- Modify: `apps/api/tests/prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `apps/api/tests/prompts.test.ts` (append at the end of the file):

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: FAIL — `GET /prompts` doesn't exist yet, returns 404 instead of 200/400.

- [ ] **Step 3: Implement the list endpoint**

Modify `apps/api/src/features/prompts/prompts.routes.ts`. Update the import line to
include `and, desc, eq` from `drizzle-orm`, and add the new route. The top of the file
becomes:

```ts
import { db, promptCategoryEnum, promptTypeEnum, prompts } from "@repo/db";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";
```

Add this route (place it above the `promptsRouter.post("/", ...)` handler, or below —
order between `GET /` and `POST /` doesn't matter):

```ts
promptsRouter.get("/", async (c) => {
  const categoryParam = c.req.query("category");
  const typeParam = c.req.query("type");
  const isActiveParam = c.req.query("isActive");

  const conditions: SQL[] = [];

  if (categoryParam !== undefined) {
    if (!isPromptCategory(categoryParam)) {
      return c.json(
        { error: `category must be one of: ${promptCategoryEnum.enumValues.join(", ")}` },
        400,
      );
    }
    conditions.push(eq(prompts.category, categoryParam));
  }

  if (typeParam !== undefined) {
    if (!isPromptType(typeParam)) {
      return c.json(
        { error: `type must be one of: ${promptTypeEnum.enumValues.join(", ")}` },
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: PASS (all 13 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/features/prompts/prompts.routes.ts apps/api/tests/prompts.test.ts
git commit -m "feat(api): add GET /prompts list endpoint with filters"
```

---

## Task 4: `GET /prompts/lookup` — single newest active match by category+type

**Files:**
- Modify: `apps/api/src/features/prompts/prompts.routes.ts`
- Modify: `apps/api/tests/prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `apps/api/tests/prompts.test.ts` (append at the end of the file):

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: FAIL — `/prompts/lookup` doesn't exist yet, returns 404 for the first test
(expects 200) and the missing/invalid-param tests get a generic 404 instead of 400.

- [ ] **Step 3: Implement the lookup endpoint**

Modify `apps/api/src/features/prompts/prompts.routes.ts`. Add this route **above**
`promptsRouter.post("/", ...)` is fine, but it MUST be added before any `/:id` route is
introduced in Task 5 (static paths like `/lookup` must be registered before `/:id` to
avoid Hono treating `"lookup"` as an `:id` value):

```ts
promptsRouter.get("/lookup", async (c) => {
  const categoryParam = c.req.query("category");
  const typeParam = c.req.query("type");

  if (!isPromptCategory(categoryParam)) {
    return c.json(
      { error: `category is required and must be one of: ${promptCategoryEnum.enumValues.join(", ")}` },
      400,
    );
  }

  if (!isPromptType(typeParam)) {
    return c.json(
      { error: `type is required and must be one of: ${promptTypeEnum.enumValues.join(", ")}` },
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
    return c.json({ error: "No active prompt found for the given category and type" }, 404);
  }

  return c.json(prompt);
});
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: PASS (all 18 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/features/prompts/prompts.routes.ts apps/api/tests/prompts.test.ts
git commit -m "feat(api): add GET /prompts/lookup endpoint"
```

---

## Task 5: `GET /prompts/:id` — fetch a single prompt

**Files:**
- Modify: `apps/api/src/features/prompts/prompts.routes.ts`
- Modify: `apps/api/tests/prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `apps/api/tests/prompts.test.ts` (append at the end of the file):

```ts
test("GET /prompts/:id returns the matching prompt", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Get By Id Prompt",
      content: "content",
      category: "journaling",
      type: "ai-system",
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: FAIL — `GET /prompts/:id` doesn't exist yet. Note: `/prompts/999999999` and
`/prompts/not-a-number` will currently be matched by... nothing (404 from Hono's
default handler), so the 404 test may coincidentally pass already, but the 200 and 400
tests will fail.

- [ ] **Step 3: Implement the get-by-id endpoint**

Modify `apps/api/src/features/prompts/prompts.routes.ts`. Add this route **after** the
`/lookup` route (so `/lookup` is matched first as a static segment):

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: PASS (all 21 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/features/prompts/prompts.routes.ts apps/api/tests/prompts.test.ts
git commit -m "feat(api): add GET /prompts/:id endpoint"
```

---

## Task 6: `PATCH /prompts/:id` — partial update

**Files:**
- Modify: `apps/api/src/features/prompts/prompts.routes.ts`
- Modify: `apps/api/tests/prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `apps/api/tests/prompts.test.ts` (append at the end of the file):

```ts
test("PATCH /prompts/:id updates provided fields and bumps updatedAt", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Target",
      content: "original content",
      category: "ai",
      type: "journal-prompt",
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

test("PATCH /prompts/:id returns 400 for an invalid JSON body", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Patch Invalid JSON",
      content: "content",
      category: "general",
      type: "journal-prompt",
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: FAIL — `PATCH /prompts/:id` doesn't exist yet, returns 404/405 instead of
200/400.

- [ ] **Step 3: Implement the update endpoint**

Modify `apps/api/src/features/prompts/prompts.routes.ts`. Add this route after the
`GET /:id` route:

```ts
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
        { error: `category must be one of: ${promptCategoryEnum.enumValues.join(", ")}` },
        400,
      );
    }
    updates.category = body.category;
  }

  if (body.type !== undefined) {
    if (!isPromptType(body.type)) {
      return c.json(
        { error: `type must be one of: ${promptTypeEnum.enumValues.join(", ")}` },
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

  const [updated] = await db.update(prompts).set(updates).where(eq(prompts.id, id)).returning();

  if (!updated) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  return c.json(updated);
});
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: PASS (all 25 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/features/prompts/prompts.routes.ts apps/api/tests/prompts.test.ts
git commit -m "feat(api): add PATCH /prompts/:id endpoint"
```

---

## Task 7: `DELETE /prompts/:id` — delete a prompt

**Files:**
- Modify: `apps/api/src/features/prompts/prompts.routes.ts`
- Modify: `apps/api/tests/prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `apps/api/tests/prompts.test.ts` (append at the end of the file):

```ts
test("DELETE /prompts/:id deletes the prompt", async () => {
  const [seed] = await db
    .insert(prompts)
    .values({
      title: "Delete Target",
      content: "content",
      category: "general",
      type: "journal-prompt",
    })
    .returning();

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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: FAIL — `DELETE /prompts/:id` doesn't exist yet, returns 404/405 instead of
204/400.

- [ ] **Step 3: Implement the delete endpoint**

Modify `apps/api/src/features/prompts/prompts.routes.ts`. Add this route after the
`PATCH /:id` route:

```ts
promptsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id)) {
    return c.json({ error: "id must be an integer" }, 400);
  }

  const [deleted] = await db.delete(prompts).where(eq(prompts.id, id)).returning();

  if (!deleted) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  return c.body(null, 204);
});
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/prompts.test.ts`
Expected: PASS (all 28 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/features/prompts/prompts.routes.ts apps/api/tests/prompts.test.ts
git commit -m "feat(api): add DELETE /prompts/:id endpoint"
```

---

## Task 8: Final verification — lint, type-check, full test suite

**Files:** none (verification only; fix any issues found in the files above)

- [ ] **Step 1: Run lint across the workspace**

Run (from repo root): `pnpm lint`
Expected: no errors. If `prompts.routes.ts` has unused imports or formatting issues,
fix them and re-run.

- [ ] **Step 2: Run type-checking across the workspace**

Run (from repo root): `pnpm check-types`
Expected: no errors.

- [ ] **Step 3: Run the full test suite**

Run (from repo root): `pnpm test`
Expected: all tests pass, including `apps/api/tests/app.test.ts` and
`apps/api/tests/prompts.test.ts`.

- [ ] **Step 4: Run formatter**

Run (from repo root): `pnpm format`
Expected: no diffs reported on files touched in this plan (or auto-fixes applied
cleanly).

- [ ] **Step 5: Commit any fixes**

If steps 1–4 produced any code changes:

```bash
git add -A
git commit -m "chore(api): fix lint/type/format issues for prompts resource"
```

If no changes were needed, skip this commit.

---

## Post-Plan: Code Review

After Task 8 passes, run the `code-review` skill against the diff (all commits from
this plan) at `medium` effort to check for correctness bugs and simplification
opportunities before considering this resource complete.
