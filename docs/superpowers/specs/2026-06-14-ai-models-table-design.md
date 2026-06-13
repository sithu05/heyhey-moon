# AI Models Table & Encryption — Design

## Overview

A new `ai_models` table representing configured connections to LLM providers (name,
description, provider, API key). `prompts` gains a required `model_id` foreign key
to `ai_models`, so each prompt is tied to the model it's designed for.

Since `api_key` is a secret, this spec also introduces a reusable application-level
encryption primitive (`@repo/shared/crypto`) and a transparent Drizzle column type
(`encryptedText`) used for `ai_models.api_key`. The same primitive is intended to be
reused for future PII columns on other tables (separate spec).

A new read-only `/ai-models` API resource is added, mirroring the read side of
`/prompts`.

## Domain Terms

- **AI model (`ai_models`)**: a configured connection to an LLM provider — a
  name/label, optional description, which `provider` it talks to, and the credential
  (`api_key`) used to call it. Conceptually closer to a "provider account/config"
  than a specific model version/checkpoint, but `ai_models` is the agreed table name.
- **provider**: enum identifying the upstream service. Starts with `openai`,
  `huggingface`, `anthropic` (lowercase, matching the existing `prompts` enum
  convention of lowercase values).
- **isActive**: same soft on/off pattern as `prompts.isActive` — disables a model
  config without deleting it (and without breaking the `prompts.model_id` FK or
  requiring cascading deletes).
- **encryptedText**: a custom Drizzle column type that transparently encrypts on
  write and decrypts on read, backed by `@repo/shared/crypto`. Used for `api_key` now
  and intended for future PII columns.

## Database Schema

### New file `packages/db/src/schema/ai-models.ts`

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

Exported from `packages/db/src/schema/index.ts` alongside `memos` and `prompts`.

### Modified file `packages/db/src/schema/prompts.ts`

Add a required FK column referencing `ai_models`:

```ts
import { integer } from "drizzle-orm/pg-core";
import { aiModels } from "./ai-models";

// ...inside the prompts table definition:
modelId: integer("model_id")
  .notNull()
  .references(() => aiModels.id, { onDelete: "restrict" }),
```

- `onDelete: "restrict"` — deleting an `ai_models` row that's still referenced by any
  `prompts` row is rejected at the DB level; the referencing prompts must be
  reassigned or deleted first.
- There is no production/dev data to preserve, so this is added directly as
  `NOT NULL` (no backfill step). Applied via `pnpm --filter @repo/db db:push`,
  consistent with the current `prompts`/`memos` workflow (no versioned migration
  files needed yet).

## Encryption

### New package `packages/shared`

Follows the per-subpath-export pattern used by `packages/math`:

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
  }
}
```

Built with `tsc` (matching `packages/math`), with `@repo/typescript-config` and
`@repo/vitest-config` as dev dependencies.

### `packages/shared/src/crypto.ts`

AES-256-GCM encryption using Node's built-in `crypto` module:

```ts
export function encrypt(plaintext: string): string;
export function decrypt(ciphertext: string): string;
```

- **Key**: read from `ENCRYPTION_KEY` env var, expected to be a base64-encoded
  32-byte (256-bit) value. A `getKey()` helper decodes and validates the length,
  throwing a clear error if `ENCRYPTION_KEY` is unset or not exactly 32 bytes after
  decoding. **No fallback/default key** — unlike `DATABASE_URL`, an encryption key
  must never have a value that's safe to commit.
- **Encrypt**: generate a random 12-byte IV, encrypt with AES-256-GCM, and return
  `base64(iv (12 bytes) || authTag (16 bytes) || ciphertext)` as a single string.
- **Decrypt**: reverse the above; `decipher.setAuthTag(...)` before `final()` so
  tampered/corrupted ciphertext throws (GCM authentication failure) rather than
  returning garbage.
- Random IV per call means encrypting the same plaintext twice produces different
  ciphertexts — encrypted columns cannot be used in equality filters or indexes. This
  is acceptable for `api_key` (never queried by value) and is expected to be
  acceptable for future PII columns (queried by the row's other keys, not by the PII
  value itself).
- `ENCRYPTION_KEY` is read only inside `encrypt`/`decrypt` at call time (not at
  module load), so importing the module has no side effects.

### New file `packages/db/src/columns/encrypted-text.ts`

A custom Drizzle column type wrapping `@repo/shared/crypto`:

```ts
import { customType } from "drizzle-orm/pg-core";
import { decrypt, encrypt } from "@repo/shared/crypto";

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

- Column is stored as Postgres `text`; the stored value is always the encrypted
  base64 blob.
- `db.insert(aiModels).values({ apiKey: "sk-..." })` encrypts automatically before
  the value reaches Postgres.
- `db.select().from(aiModels)` decrypts automatically — callers see plaintext
  `apiKey` in the returned row, same as any other text column.
- `packages/db` adds `@repo/shared` as a workspace dependency.
- `drizzle-kit` (`db:push`/`db:generate`/`db:studio`) never calls `toDriver`/
  `fromDriver` (it only uses `dataType()` for DDL), so `ENCRYPTION_KEY` is not
  required for schema commands — only for actual reads/writes through `db`.

### Env setup

Add to `packages/db/.env.example` and `apps/api/.env.example`:

```
# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=
```

## API Endpoints

### New file `apps/api/src/features/ai-models/ai-models.routes.ts`

Mounted at `/ai-models` in `app.ts`, alongside `/memos` and `/prompts`. Read-only.

| Method | Path | Description |
|---|---|---|
| `GET` | `/ai-models` | List models. Optional `?provider=` and `?isActive=` query params (validated against the enum / `"true"`/`"false"`, `400` on invalid), ANDed. Ordered by `createdAt desc`. |
| `GET` | `/ai-models/:id` | Fetch a single model by id. `404` if not found. |

### Response shape

`apiKey` is **never** returned raw. Each row's decrypted key (via `encryptedText`)
is masked before serialization and replaced with `apiKeyMasked`:

```ts
function maskApiKey(key: string): string {
  return key.length <= 4 ? "****" : `****${key.slice(-4)}`;
}
```

Example response item:

```json
{
  "id": 1,
  "name": "Production GPT-4o",
  "description": "Primary OpenAI model for journaling prompts",
  "provider": "openai",
  "apiKeyMasked": "****ab12",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Out of scope for this resource (this spec)

- `POST`/`PATCH`/`DELETE` — write access (creating models, rotating keys) is managed
  directly via DB for now (`db:studio` or direct SQL/seed scripts). A follow-up spec
  can add write endpoints, reusing `encryptedText` (encryption happens automatically
  on insert/update).

## Testing

- `apps/api/vitest.config.ts` sets a fixed test-only `ENCRYPTION_KEY` (a base64
  32-byte value) at the top of the config file via
  `process.env.ENCRYPTION_KEY ??= "..."`, so tests run without a real `.env` —
  mirroring how `DATABASE_URL` already has a working default for local Postgres.
- New `apps/api/tests/ai-models.test.ts`, following the `prompts.test.ts` pattern:
  - Seed an `ai_models` row directly via `db.insert(aiModels)` (no POST endpoint
    exists), and a `prompts` row referencing it where needed.
  - `GET /ai-models` — no filters, and with `provider`/`isActive` filters; assert
    `apiKeyMasked` is present and correct, and raw `apiKey` is absent from the JSON.
  - `GET /ai-models/:id` — found and `404`.
  - Clean up via `afterAll` (delete seeded rows), consistent with `prompts.test.ts`.
- New `packages/shared` package gets `src/crypto.test.ts`:
  - Round-trip: `decrypt(encrypt(plaintext)) === plaintext`.
  - Same plaintext encrypted twice produces different ciphertexts (random IV).
  - Tampered ciphertext (flipped byte) fails decryption (GCM auth tag check).
  - Missing or invalid-length `ENCRYPTION_KEY` throws on `encrypt`/`decrypt`.

## Out of Scope

- Write endpoints (`POST`/`PATCH`/`DELETE`) for `ai_models`.
- Key rotation / versioned/multiple encryption keys (current design assumes a single
  static `ENCRYPTION_KEY`).
- Applying `encryptedText` to PII columns on other tables (e.g. a future `users`
  table) — this spec establishes the reusable primitive; applying it elsewhere is a
  separate spec.
- Admin UI for managing `ai_models`.
- Pagination on `GET /ai-models` (small dataset expected).
