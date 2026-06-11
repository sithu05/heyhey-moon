# Prompts Resource API — Design

## Overview

A new `prompts` resource, modeled after the existing `memos` resource. Prompts are
reusable pieces of text content with metadata, used either as user-facing journaling
prompts or as AI/LLM system prompt templates. There is no admin UI for managing
prompts (none planned at this time) — management happens directly via the API
(curl/Postman/scripts). Consumers (the mobile/web app, or internal services) primarily
read prompts by filtering on `category` and/or `type`.

## Domain Terms

- **Prompt**: a reusable piece of text content with metadata.
- **category**: the *topic/theme* of the prompt. Enum, e.g. `general`, `journaling`, `ai`.
- **type**: the *format/kind* of the prompt. Enum, e.g. `journal-prompt`, `ai-system`.
- **isActive**: soft on/off switch — inactive prompts are excluded from the `lookup`
  endpoint but still visible via `list`/`get-by-id` (so they can be re-activated or
  inspected without a UI).
- **consumer**: any client of the API (mobile/web app, internal job/service) reading
  prompts, primarily by `category`/`type`.

Both enums start with a small placeholder set and are expected to grow via migration
as real categories/types are identified.

## Database Schema

New file `packages/db/src/schema/prompts.ts`, following the existing `memos.ts` pattern:

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

Notes:
- `title`, `content`: required. `description`: optional notes about the prompt's
  purpose/usage.
- `category`/`type`: required Postgres enums (`pgEnum`), validated at the DB level.
- `isActive`: defaults to `true`.
- `updatedAt` uses Drizzle's `$onUpdate` to auto-bump on any `update()` call (a small,
  related improvement not currently present on `memos`, but the correct approach for
  a resource with a write API).
- Exported from `packages/db/src/schema/index.ts` alongside `memos`.
- Schema applied via `pnpm --filter @repo/db db:push` (dev workflow, no migration
  files needed yet, consistent with current `memos` setup).

## API Endpoints

New file `apps/api/src/features/prompts/prompts.routes.ts`, mounted at `/prompts` in
`app.ts` alongside `/memos`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/prompts` | List prompts. Optional query params: `?category=`, `?type=`, `?isActive=` (combinable, ANDed). Defaults to all prompts (active + inactive), ordered by `createdAt desc`. |
| `GET` | `/prompts/lookup?category=&type=` | Returns a **single** prompt object: the newest (`createdAt desc`) prompt matching the given `category`/`type` where `isActive=true`. 404 if none found. Must be defined before `/:id` in the router to avoid Hono path collision. |
| `GET` | `/prompts/:id` | Fetch a single prompt by id. 404 if not found. |
| `POST` | `/prompts` | Create a prompt. Body: `title`, `content` (required); `description`, `category`, `type`, `isActive` (optional, with defaults). |
| `PATCH` | `/prompts/:id` | Partial update of any field. 404 if not found. |
| `DELETE` | `/prompts/:id` | Delete a prompt. 404 if not found, 204 on success. |

### Validation

Manual type-checking in handlers, matching the existing `memos.routes.ts` style (no
zod currently in use in this app). `category`/`type` values are validated against the
enum's allowed values, returning `400` on invalid input. Invalid JSON bodies also
return `400`.

### Query parameter handling

- `?category=` and `?type=` on `GET /prompts`: optional, validated against the enum
  allowed values; `400` on an unrecognized value.
- `?category=` and `?type=` on `GET /prompts/lookup`: **both required**; `400` if
  either is missing or not a recognized enum value.
- `?isActive=` on `GET /prompts`: accepts `"true"`/`"false"`; any other value is a
  `400`.

## Testing

- New `apps/api/tests/prompts.test.ts`, following the existing `app.test.ts` pattern
  (`app.request(...)` against the Hono app).
- Covers each endpoint:
  - `GET /prompts` — no filters, and with `category`/`type`/`isActive` filters.
  - `GET /prompts/lookup` — match found, and 404 when no active match.
  - `GET /prompts/:id` — found and 404.
  - `POST /prompts` — valid body (201), invalid body / bad enum value (400).
  - `PATCH /prompts/:id` — partial update, 404 on missing id.
  - `DELETE /prompts/:id` — 204 on success, 404 on missing id.
- Tests run against the real local Postgres (via `docker compose up -d`), consistent
  with the existing setup — no test DB or mocking layer introduced.
- Each test creates its own row(s) (via `POST` or direct insert) and cleans up after
  itself (`DELETE`) to avoid cross-test pollution, since there's no test-DB reset
  mechanism currently.

## Out of Scope

- Admin UI for managing prompts.
- Pagination on `GET /prompts` (small dataset expected for now).
- Versioned migrations (`db:generate`/`db:migrate`) — using `db:push` for now,
  consistent with current workflow.
