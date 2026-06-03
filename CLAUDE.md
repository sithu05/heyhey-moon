# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Development (all apps)
pnpm dev

# Build all packages and apps
pnpm build

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
```

The admin portal runs on **port 3000** (`apps/adminportal`).

## Architecture

This is a **pnpm + Turborepo monorepo** using TypeScript throughout. Task graph: `build` depends on `^build`, `test` depends on `transit` and `@repo/vitest-config#build`.

### Apps
- `apps/adminportal` — Next.js 16 (App Router) admin portal. Runs on port 3000.

### Packages
- `packages/ui` — Shared React component library. Built with `tsc` (components) and Tailwind CLI (styles). Exports via `dist/`; consumers use `transpilePackages`. Components live in `src/components/ui/` and are shadcn-style (Radix UI + CVA + tailwind-merge). Utilities at `src/lib/utils.ts`, hooks at `src/hooks/`.
- `packages/tailwind-config` — Exports `shared-styles.css` (Tailwind v4 `@theme inline` tokens) and `postcss.config.js`. All apps and `packages/ui` import from here.
- `packages/vitest-config` — Exports `base` and `ui` vitest configs plus coverage merge/report scripts. Coverage uses istanbul. The root `vitest.config.ts` uses vitest projects to run `packages/` (Node) and `apps/` (jsdom) separately.
- `packages/math` — Example utility package with per-subpath exports (`./add`, `./subtract`).
- `packages/eslint-config` — Shared ESLint config (Next.js + Prettier).
- `packages/typescript-config` — Shared `tsconfig.json` bases.

### UI component pattern
Components in `packages/ui/src/components/ui/` follow the shadcn pattern: CVA variants, `cn()` from `src/lib/utils.ts`, Radix UI primitives via `radix-ui` or `@base-ui/react`. When adding new components, export them from `packages/ui` and rebuild (`pnpm build` in `packages/ui`).

### Testing
- Root `vitest.config.ts` runs workspace-wide tests as two projects: `packages/` (Node env) and `apps/` (jsdom env).
- Each package/app can also run its own `vitest run` directly.
- Coverage is collected as `coverage.json` per package and merged via `nyc` in `packages/vitest-config`.
