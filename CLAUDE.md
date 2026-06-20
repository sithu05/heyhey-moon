# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Pre-PR checklist

Always run these before opening a pull request:

```bash
pnpm run lint       # enforces --max-warnings 0; any warning fails
pnpm check-types    # full tsc across all apps and packages
pnpm test           # full test suite via Turbo
```

Fix all failures before pushing.

## Commands

```bash
# Install dependencies
pnpm install

# Development (all apps) — ALWAYS run from the repo root, not inside an app.
# Apps depend on internal workspace packages that Turborepo must build/wire first,
# so use `pnpm run dev` here (not `next dev` inside apps/admin-portal).
pnpm run dev

# Build all packages and apps — ALWAYS run from the repo root, not inside an app,
# for the same internal-package reason. Use `pnpm run build` (not `next build`).
pnpm run build

# Lint all
pnpm lint

# Type check all
pnpm check-types

# Format with Prettier
pnpm format

# Run all tests (via Turbo, outputs coverage.json per package)
pnpm test

# Run tests across workspace projects (watches packages/ and apps/)
pnpm test:projects
pnpm test:projects:watch

# Run tests for a single package
cd packages/math && pnpm test

# View merged coverage report
pnpm view-report

# Start local Postgres for development (postgres/postgres/heyhey_memo on localhost:5432)
docker compose up -d

# Push the Drizzle schema to the database / run migrations
pnpm --filter @repo/db db:push
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate

# Drizzle Studio also launches automatically as part of `pnpm run dev`,
# but can be run on its own with:
pnpm --filter @repo/db db:studio
```

The admin portal runs on **port 3000** (`apps/admin-portal`). The API runs on **port 8787** (`apps/api`).

## Architecture

This is a **pnpm + Turborepo monorepo** using TypeScript throughout. Task graph: `build` depends on `^build`, `dev` depends on `^build` (so workspace package dependencies like `@repo/db` are built once before persistent dev servers start), `test` depends on `transit` and `@repo/vitest-config#build`.

### Apps

- `apps/admin-portal` — Next.js 16 (App Router) admin portal. Runs on port 3000. Currently has `src/shared/components/ui/` (app shell/header/sidebar) but no `features/` yet — see folder structure below for where new domain code should go.
- `apps/api` — Hono API server (`@hono/node-server`). Runs on port 8787. Uses `@repo/db` for database access; loads `.env` via `dotenv/config` at the entrypoint (`src/index.ts`). Built with `tsdown` (bundles `src/` into a single `dist/index.js`, leaving `node_modules` deps external). Has a `@/*` -> `src/*` path alias (`tsconfig.json`, mirrored in `vitest.config.ts`). See "API feature conventions" below for its internal structure.

### App folder structure (slice pattern) — admin-portal

Next.js apps follow a **feature-slice / domain-oriented** layout. Inside `apps/admin-portal/`:

```
src/
  app/                  # Next.js App Router (routes only — thin shells)
  features/
    auth/               # Auth domain: components, hooks, utils, types, api
    dashboard/
    <domain>/
  shared/
    components/         # Cross-cutting reusable UI wrappers
    hooks/              # Shared hooks
    utils/              # Shared utilities
    types/              # Shared TypeScript types
```

Rules:

- Route files (`page.tsx`, `layout.tsx`) are thin shells — they import from `features/` or `shared/`.
- Each `features/<domain>/` is self-contained: colocate components, hooks, utils, and types for that domain.
- `shared/` is only for code used by **two or more** features.
- Do not place business logic directly in `app/` route files.

### API feature conventions (apps/api)

Each domain lives in `src/features/<domain>/`:

- `router.ts` exports a single `router` (a `Hono` instance), mounted in `src/app.ts` via `app.route("/<domain>", router)`.
- `schemas.ts` holds that feature's Zod schemas for request bodies/queries/params.

Shared request validation lives in `src/shared/validation/`:

- `zod-validator.ts` exports `zValidator`, a wrapper around `@hono/zod-validator` — use this (not the raw `@hono/zod-validator` export) so validation failures consistently return `{ error: z.prettifyError(result.error) }` with status 400.
- `schemas.ts` exports reusable pieces: `idParamSchema` (`:id` route param, coerced to int) and `booleanQueryParam` (`"true"`/`"false"` query string -> boolean).

Error handling is centralized in `app.onError` (`src/app.ts`), so route handlers should throw/return rather than format error JSON themselves:

- `HTTPException` -> `{ error: err.message }` with its status.
- Postgres FK/unique violations (codes `23503`/`23505`) -> `{ error: "Conflicts with existing data" }`, status 409.
- Anything else -> `{ error: "Internal Server Error" }`, status 500 (and logged via `console.error`).

All responses that error use the same `{ error: string }` envelope — match this when adding new routes.

### Packages

- `packages/db` — Drizzle ORM client for Postgres (`postgres-js` driver). Schema tables in `src/schema/`, client (`db`) in `src/client.ts`, both re-exported from `src/index.ts`. Reads `DATABASE_URL` (falls back to a local default matching `docker-compose.yml`). `drizzle-kit` config in `drizzle.config.ts`, migrations output to `drizzle/`. Built with `tsdown` (entries: `src/index.ts`, `src/schema/index.ts`); `pnpm dev` here runs `tsdown --watch` alongside `drizzle-kit studio` (via `concurrently`). `src/columns/` holds custom Drizzle column types — currently `encrypted-text.ts` (`encryptedText`), a transparent-encrypt/decrypt `text` column backed by `@repo/shared/crypto`; reuse it for any new secret/PII column. Table relations: `prompts.modelId` is a required FK to `aiModels.id` with `onDelete: "restrict"`.
- `packages/shared` — Cross-cutting Node utilities with per-subpath exports (same pattern as `packages/math`). Currently exports `./crypto` (AES-256-GCM `encrypt`/`decrypt`, requires a base64-encoded 32-byte `ENCRYPTION_KEY` — no fallback, unlike `DATABASE_URL`). Built with `tsc`. `packages/db` depends on it for `encryptedText`.
- `packages/ui` — Shared React component library. Built with `tsc` (components) and Tailwind CLI (styles). Exports via `dist/`; consumers use `transpilePackages`. Components live in `src/components/ui/` and are shadcn-style (Radix UI + CVA + tailwind-merge). Utilities at `src/lib/utils.ts`, hooks at `src/hooks/`.
- `packages/tailwind-config` — Exports `shared-styles.css` (Tailwind v4 `@theme inline` tokens) and `postcss.config.js`. All apps and `packages/ui` import from here.
- `packages/vitest-config` — Exports `base` and `ui` vitest configs plus coverage merge/report scripts. Coverage uses istanbul. The root `vitest.config.ts` uses vitest projects to run `packages/` (Node) and `apps/` (jsdom) separately.
- `packages/math` — Example utility package with per-subpath exports (`./add`, `./subtract`).
- `packages/eslint-config` — Shared ESLint config (Next.js + Prettier).
- `packages/typescript-config` — Shared `tsconfig.json` bases: `base.json` (Node ESM, `moduleResolution: NodeNext` — relative imports require `.js` extensions), `nextjs.json` (Next.js apps), `bundler.json` (extends `base.json` with `module: ESNext` / `moduleResolution: Bundler` — relative imports have **no extension**, for packages built with a bundler). `apps/api` and `packages/db` extend `bundler.json`.

### Tailwind v4

This repo uses **Tailwind v4** (CSS-first configuration). Do **not** use v3 patterns:

- No `tailwind.config.ts` / `tailwind.config.js` — configuration lives in `packages/tailwind-config/shared-styles.css` as `@theme inline` tokens.
- No `@apply` with Tailwind utility names from a config file — use CSS custom properties from the theme instead.
- Utility classes are generated from the CSS theme; consumers import `shared-styles.css` via `@repo/tailwind-config`.

### UI component pattern

Components in `packages/ui/src/components/ui/` follow the shadcn pattern: CVA variants, `cn()` from `src/lib/utils.ts`, Radix UI primitives via `radix-ui` or `@base-ui/react`. When adding new components, export them from `packages/ui` and rebuild (`pnpm build` in `packages/ui`).

### Database

- Postgres runs locally via `docker compose up -d` (see `docker-compose.yml`).
- Both `packages/db` and `apps/api` need a `.env` (copy from their `.env.example`) with `DATABASE_URL` and `ENCRYPTION_KEY`.
- Define new tables in `packages/db/src/schema/`, then run `pnpm --filter @repo/db db:push` (dev) or `db:generate`/`db:migrate` (versioned migrations).
- `ENCRYPTION_KEY` must be a base64-encoded 32-byte value (`openssl rand -base64 32`) and has **no fallback** — any read/write of an `encryptedText` column (e.g. `ai_models.api_key`) throws if it's unset. It's read lazily inside `encrypt`/`decrypt`, so schema-only commands (`db:push`/`db:generate`) don't need it, but `db:studio` will fail to display encrypted columns without it.

### Testing

- Root `vitest.config.ts` runs workspace-wide tests as two projects: `packages/` (Node env) and `apps/` (jsdom env).
- Each package/app can also run its own `vitest run` directly.
- Coverage is collected as `coverage.json` per package and merged via `nyc` in `packages/vitest-config`.

## Git conventions

- Do **not** add a `Co-Authored-By` trailer to git commit messages.
