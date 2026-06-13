# AI Models Table & Encryption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `ai_models` table (provider configs with encrypted API keys), a required `prompts.model_id` foreign key to it, a reusable `@repo/shared/crypto` AES-256-GCM encryption primitive, a transparent `encryptedText` Drizzle column type, and a read-only `/ai-models` API resource.

**Architecture:** A new `packages/shared` package exports `encrypt`/`decrypt` (AES-256-GCM via Node's `crypto`, key from `ENCRYPTION_KEY` env var). `packages/db` adds a custom Drizzle column type (`encryptedText`) built on those functions, a new `ai_models` schema table using it for `api_key`, and a required `model_id` FK on `prompts`. `apps/api` gets a new read-only `/ai-models` resource (masked API keys) and its existing `/prompts` resource is updated to require `modelId`.

**Tech Stack:** TypeScript, Drizzle ORM (Postgres), Node built-in `crypto`, Hono, Vitest.

---

## Reference: full spec

See `docs/superpowers/specs/2026-06-14-ai-models-table-design.md` for the full design rationale. This plan implements that spec.

---

### Task 1: `@repo/shared` package — AES-256-GCM encryption primitives

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/eslint.config.js`
- Create: `packages/shared/vitest.config.ts`
- Create: `packages/shared/src/crypto.ts`
- Test: `packages/shared/tests/crypto.test.ts`

- [ ] **Step 1: Create the package scaffold files**

`packages/shared/package.json`:

```json
{
  "name": "@repo/shared",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    "./crypto": {
      "types": "./src/crypto.ts",
      "default": "./dist/crypto.js"
    }
  },
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "lint": "eslint --max-warnings 0",
    "test": "vitest run"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@repo/vitest-config": "workspace:*",
    "@types/node": "^22.15.30",
    "@vitest/coverage-istanbul": "^4.1.8",
    "eslint": "^9.39.1",
    "typescript": "5.9.2",
    "vitest": "^4.1.8"
  }
}
```

`packages/shared/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "strictNullChecks": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

`packages/shared/eslint.config.js`:

```js
import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default config;
```

`packages/shared/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest-config";

// Tests need a valid 32-byte key but don't need a real secret.
process.env.ENCRYPTION_KEY ??= Buffer.from(
  "test-encryption-key-32-bytes-ok!",
).toString("base64");

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
  },
});
```

- [ ] **Step 2: Declare `ENCRYPTION_KEY` in Turbo's global env list**

`crypto.ts` (written in Step 6) reads `process.env.ENCRYPTION_KEY`, and
`eslint-plugin-turbo`'s `no-undeclared-env-vars` rule (run with
`--max-warnings 0` in Step 8) checks `process.env.*` usage against
`turbo.json`'s `globalEnv`. Declare it now so linting doesn't fail later.

`turbo.json` — current `globalEnv`:

```json
  "globalEnv": [
    "DATABASE_URL"
  ],
```

New:

```json
  "globalEnv": [
    "DATABASE_URL",
    "ENCRYPTION_KEY"
  ],
```

- [ ] **Step 3: Install dependencies so the new workspace package is linked**

Run: `pnpm install`
Expected: completes successfully; `node_modules/@repo/shared` is symlinked to `packages/shared`.

- [ ] **Step 4: Write the failing test**

`packages/shared/tests/crypto.test.ts`:

```ts
import { expect, test } from "vitest";

import { decrypt, encrypt } from "../src/crypto";

test("round-trips a plaintext value", () => {
  const plaintext = "sk-test-1234567890";
  const ciphertext = encrypt(plaintext);
  expect(decrypt(ciphertext)).toBe(plaintext);
});

test("encrypts the same plaintext differently each time", () => {
  const plaintext = "sk-test-1234567890";
  const first = encrypt(plaintext);
  const second = encrypt(plaintext);
  expect(first).not.toBe(second);
});

test("fails to decrypt tampered ciphertext", () => {
  const ciphertext = encrypt("sk-test-1234567890");
  const bytes = Buffer.from(ciphertext, "base64");
  bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 0xff;
  const tampered = bytes.toString("base64");

  expect(() => decrypt(tampered)).toThrow();
});

test("throws when ENCRYPTION_KEY is not set", () => {
  const original = process.env.ENCRYPTION_KEY;
  delete process.env.ENCRYPTION_KEY;

  expect(() => encrypt("value")).toThrow(/ENCRYPTION_KEY/);

  process.env.ENCRYPTION_KEY = original;
});

test("throws when ENCRYPTION_KEY does not decode to 32 bytes", () => {
  const original = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = Buffer.from("too-short").toString("base64");

  expect(() => encrypt("value")).toThrow(/32 bytes/);

  process.env.ENCRYPTION_KEY = original;
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `pnpm --filter @repo/shared test`
Expected: FAIL — cannot find module `../src/crypto` (file doesn't exist yet).

- [ ] **Step 6: Implement `encrypt`/`decrypt`**

`packages/shared/src/crypto.ts`:

```ts
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  const decoded = Buffer.from(key, "base64");
  if (decoded.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes (got ${decoded.length})`,
    );
  }

  return decoded;
}

/**
 * Encrypts a UTF-8 string with AES-256-GCM, returning
 * base64(iv || authTag || ciphertext) as a single string.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/**
 * Reverses `encrypt`. Throws if ENCRYPTION_KEY doesn't match or the
 * ciphertext has been tampered with (GCM auth tag check).
 */
export function decrypt(encoded: string): string {
  const key = getKey();
  const data = Buffer.from(encoded, "base64");

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm --filter @repo/shared test`
Expected: PASS (5 tests).

- [ ] **Step 8: Lint and type-check**

Run: `pnpm --filter @repo/shared check-types && pnpm --filter @repo/shared lint`
Expected: both succeed with no errors.

- [ ] **Step 9: Commit**

```bash
git add packages/shared turbo.json
git commit -m "feat(shared): add AES-256-GCM encrypt/decrypt primitives"
```

---

### Task 2: `encryptedText` Drizzle column type in `@repo/db`

**Files:**
- Modify: `packages/db/package.json`
- Create: `packages/db/src/columns/encrypted-text.ts`

- [ ] **Step 1: Add `@repo/shared` as a dependency of `@repo/db`**

In `packages/db/package.json`, add to `"dependencies"` (keep existing entries):

```json
  "dependencies": {
    "@repo/shared": "workspace:*",
    "drizzle-orm": "^0.45.2",
    "postgres": "^3.4.9"
  },
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`
Expected: completes successfully.

- [ ] **Step 3: Implement the custom column type**

`packages/db/src/columns/encrypted-text.ts`:

```ts
import { customType } from "drizzle-orm/pg-core";

import { decrypt, encrypt } from "@repo/shared/crypto";

/**
 * A `text` column that is transparently encrypted with AES-256-GCM on
 * write and decrypted on read via @repo/shared/crypto. Reuse this for
 * any column holding a secret (API keys now, PII fields later).
 */
export const encryptedText = customType<{ data: string; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value: string): string {
    return encrypt(value);
  },
  fromDriver(value: string): string {
    return decrypt(value);
  },
});
```

- [ ] **Step 4: Type-check**

Run: `pnpm --filter @repo/db check-types`
Expected: succeeds (the file isn't used anywhere yet, but must compile cleanly).

- [ ] **Step 5: Commit**

```bash
git add packages/db/package.json packages/db/src/columns/encrypted-text.ts pnpm-lock.yaml
git commit -m "feat(db): add encryptedText custom Drizzle column type"
```

---

### Task 3: `ai_models` schema table

**Files:**
- Create: `packages/db/src/schema/ai-models.ts`
- Modify: `packages/db/src/schema/index.ts`

- [ ] **Step 1: Define the `ai_models` table and provider enum**

`packages/db/src/schema/ai-models.ts`:

```ts
import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { encryptedText } from "../columns/encrypted-text";

export const aiModelProviderEnum = pgEnum("ai_model_provider", [
  "openai",
  "huggingface",
  "anthropic",
]);

export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  provider: aiModelProviderEnum("provider").notNull(),
  apiKey: encryptedText("api_key").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

- [ ] **Step 2: Export it from the schema index**

`packages/db/src/schema/index.ts` — current content:

```ts
export * from "./memos";
export * from "./prompts";
```

New content:

```ts
export * from "./ai-models";
export * from "./memos";
export * from "./prompts";
```

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @repo/db check-types`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/schema/ai-models.ts packages/db/src/schema/index.ts
git commit -m "feat(db): add ai_models table"
```

---

### Task 4: `prompts.model_id` foreign key

**Files:**
- Modify: `packages/db/src/schema/prompts.ts`

- [ ] **Step 1: Add the `modelId` column**

`packages/db/src/schema/prompts.ts` — current content:

```ts
import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const promptCategoryEnum = pgEnum("prompt_category", [
  "general",
  "journaling",
  "ai",
]);
export const promptTypeEnum = pgEnum("prompt_type", [
  "journal-prompt",
  "ai-system",
]);

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

New content:

```ts
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { aiModels } from "./ai-models";

export const promptCategoryEnum = pgEnum("prompt_category", [
  "general",
  "journaling",
  "ai",
]);
export const promptTypeEnum = pgEnum("prompt_type", [
  "journal-prompt",
  "ai-system",
]);

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: promptCategoryEnum("category").notNull(),
  type: promptTypeEnum("type").notNull(),
  modelId: integer("model_id")
    .notNull()
    .references(() => aiModels.id, { onDelete: "restrict" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @repo/db check-types`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/prompts.ts
git commit -m "feat(db): require prompts.model_id to reference ai_models"
```

---

### Task 5: Env vars and applying the schema

**Files:**
- Modify: `packages/db/.env.example`
- Modify: `apps/api/.env.example`

- [ ] **Step 1: Document `ENCRYPTION_KEY` in both `.env.example` files**

`packages/db/.env.example` — current content:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/heyhey_memo
```

New content:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/heyhey_memo

# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=
```

`apps/api/.env.example` — current content:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/heyhey_memo
```

New content:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/heyhey_memo

# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=
```

- [ ] **Step 2: Start local Postgres**

Run: `docker compose up -d`
Expected: `postgres` container starts (or is already running).

- [ ] **Step 3: Clear out the `prompts` table before adding the required FK column**

The new `model_id` column is `NOT NULL` with no default. If any rows exist in
`prompts` from earlier manual testing, `drizzle-kit push` will prompt
interactively for how to handle them. Since there's no data to preserve
(per the design spec), clear the table first so the push is non-interactive:

Run: `docker compose exec -T postgres psql -U postgres -d heyhey_memo -c "TRUNCATE TABLE prompts;"`
Expected: `TRUNCATE TABLE` (or an error if the table doesn't exist yet, which is also fine).

- [ ] **Step 4: Push the schema**

Run: `pnpm --filter @repo/db db:push`
Expected: drizzle-kit reports it created the `ai_model_provider` enum, the
`ai_models` table, and added `model_id` to `prompts` with its foreign key —
and applies them without further prompts (table is empty).

- [ ] **Step 5: Commit**

```bash
git add packages/db/.env.example apps/api/.env.example
git commit -m "chore: add ENCRYPTION_KEY env var for encrypted columns"
```

---

### Task 6: Update `/prompts` API and tests for required `modelId`

**Files:**
- Modify: `apps/api/vitest.config.ts`
- Modify: `apps/api/src/features/prompts/prompts.routes.ts`
- Modify: `apps/api/tests/prompts.test.ts`

- [ ] **Step 1: Give `apps/api` tests a deterministic `ENCRYPTION_KEY`**

`apps/api/vitest.config.ts` — current content:

```ts
import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest-config";

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    // Package-specific overrides if needed
  },
});
```

New content:

```ts
import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest-config";

// Tests need a valid 32-byte key but don't need a real secret.
process.env.ENCRYPTION_KEY ??= Buffer.from(
  "test-encryption-key-32-bytes-ok!",
).toString("base64");

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    // Package-specific overrides if needed
  },
});
```

- [ ] **Step 2: Require `modelId` on `POST /prompts` and allow it on `PATCH /prompts/:id`**

In `apps/api/src/features/prompts/prompts.routes.ts`, make five edits:

**Edit 2a** — PATCH body type (around line 140), add `modelId?: unknown;`:

```ts
  let body: {
    title?: unknown;
    content?: unknown;
    description?: unknown;
    category?: unknown;
    type?: unknown;
    modelId?: unknown;
    isActive?: unknown;
  };
```

**Edit 2b** — PATCH handler, add a `modelId` validation block. Insert it
right after the existing `type` validation block (after the closing `}` of
the `if (body.type !== undefined) { ... }` block) and before the `isActive`
validation block:

```ts
  if (body.modelId !== undefined) {
    if (typeof body.modelId !== "number" || !Number.isInteger(body.modelId)) {
      return c.json({ error: "modelId must be an integer" }, 400);
    }
    updates.modelId = body.modelId;
  }
```

**Edit 2c** — POST body type (around line 246), add `modelId?: unknown;`:

```ts
  let body: {
    title?: unknown;
    content?: unknown;
    description?: unknown;
    category?: unknown;
    type?: unknown;
    modelId?: unknown;
    isActive?: unknown;
  };
```

**Edit 2d** — POST handler, require `modelId`. Insert this check immediately
after the existing title/content check:

```ts
  if (typeof body.title !== "string" || typeof body.content !== "string") {
    return c.json({ error: "title and content are required" }, 400);
  }

  if (typeof body.modelId !== "number" || !Number.isInteger(body.modelId)) {
    return c.json(
      { error: "modelId is required and must be an integer" },
      400,
    );
  }
```

**Edit 2e** — POST handler, include `modelId` in the inserted values. The
`values` object currently is:

```ts
  const values: typeof prompts.$inferInsert = {
    title: body.title,
    content: body.content,
    category: body.category,
    type: body.type,
  };
```

New:

```ts
  const values: typeof prompts.$inferInsert = {
    title: body.title,
    content: body.content,
    category: body.category,
    type: body.type,
    modelId: body.modelId,
  };
```

- [ ] **Step 3: Update the prompts tests to seed and use an `ai_models` row**

Replace the full contents of `apps/api/tests/prompts.test.ts` with:

```ts
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
```

- [ ] **Step 4: Run the prompts tests**

Run: `pnpm --filter api test -- prompts`
Expected: PASS (all tests, including the two new `modelId` validation tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/vitest.config.ts apps/api/src/features/prompts/prompts.routes.ts apps/api/tests/prompts.test.ts
git commit -m "feat(api): require modelId on prompts"
```

---

### Task 7: Read-only `/ai-models` API routes

**Files:**
- Create: `apps/api/src/features/ai-models/ai-models.routes.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Implement the routes**

`apps/api/src/features/ai-models/ai-models.routes.ts`:

```ts
import { and, desc, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";

import { aiModelProviderEnum, aiModels, db } from "@repo/db";

export const aiModelsRouter = new Hono();

type AiModelProvider = (typeof aiModelProviderEnum.enumValues)[number];

function isAiModelProvider(value: unknown): value is AiModelProvider {
  return (
    typeof value === "string" &&
    (aiModelProviderEnum.enumValues as readonly string[]).includes(value)
  );
}

function maskApiKey(key: string): string {
  return key.length <= 4 ? "****" : `****${key.slice(-4)}`;
}

function toResponse(model: typeof aiModels.$inferSelect) {
  const { apiKey, ...rest } = model;
  return { ...rest, apiKeyMasked: maskApiKey(apiKey) };
}

aiModelsRouter.get("/", async (c) => {
  const providerParam = c.req.query("provider");
  const isActiveParam = c.req.query("isActive");

  const conditions: SQL[] = [];

  if (providerParam !== undefined) {
    if (!isAiModelProvider(providerParam)) {
      return c.json(
        {
          error: `provider must be one of: ${aiModelProviderEnum.enumValues.join(", ")}`,
        },
        400,
      );
    }
    conditions.push(eq(aiModels.provider, providerParam));
  }

  if (isActiveParam !== undefined) {
    if (isActiveParam !== "true" && isActiveParam !== "false") {
      return c.json({ error: "isActive must be 'true' or 'false'" }, 400);
    }
    conditions.push(eq(aiModels.isActive, isActiveParam === "true"));
  }

  const allModels = await db
    .select()
    .from(aiModels)
    .where(and(...conditions))
    .orderBy(desc(aiModels.createdAt));

  return c.json(allModels.map(toResponse));
});

aiModelsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id)) {
    return c.json({ error: "id must be an integer" }, 400);
  }

  const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));

  if (!model) {
    return c.json({ error: "AI model not found" }, 404);
  }

  return c.json(toResponse(model));
});
```

- [ ] **Step 2: Mount the router**

`apps/api/src/app.ts` — current content:

```ts
import { Hono } from "hono";

import { memosRouter } from "./features/memos/memos.routes";
import { promptsRouter } from "./features/prompts/prompts.routes";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/memos", memosRouter);
app.route("/prompts", promptsRouter);
```

New content:

```ts
import { Hono } from "hono";

import { aiModelsRouter } from "./features/ai-models/ai-models.routes";
import { memosRouter } from "./features/memos/memos.routes";
import { promptsRouter } from "./features/prompts/prompts.routes";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/ai-models", aiModelsRouter);
app.route("/memos", memosRouter);
app.route("/prompts", promptsRouter);
```

- [ ] **Step 3: Type-check**

Run: `pnpm --filter api check-types`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/features/ai-models apps/api/src/app.ts
git commit -m "feat(api): add read-only /ai-models resource"
```

---

### Task 8: `/ai-models` API tests

**Files:**
- Test: `apps/api/tests/ai-models.test.ts`

- [ ] **Step 1: Write the tests**

`apps/api/tests/ai-models.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the new tests**

Run: `pnpm --filter api test -- ai-models`
Expected: PASS (8 tests).

- [ ] **Step 3: Commit**

```bash
git add apps/api/tests/ai-models.test.ts
git commit -m "test(api): cover /ai-models routes"
```

---

### Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full workspace test suite**

Run: `pnpm test`
Expected: all packages/apps pass, including `@repo/shared`, `@repo/db`, and `api`.

- [ ] **Step 2: Lint and type-check everything**

Run: `pnpm lint && pnpm check-types`
Expected: no errors.

- [ ] **Step 3: Build everything**

Run: `pnpm build`
Expected: `@repo/shared`, `@repo/db`, `apps/api` (and others) build successfully —
confirms `@repo/shared` is resolvable as a built dependency of `@repo/db`.

- [ ] **Step 4: Fix anything that fails**

If any step above fails, fix the root cause in the relevant task's files
before proceeding — do not skip or weaken assertions.
