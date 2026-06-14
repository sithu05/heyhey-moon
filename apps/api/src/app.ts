import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { router as aiModelsRouter } from "@/features/ai-models/router";
import { router as memosRouter } from "@/features/memos/router";
import { router as promptsRouter } from "@/features/prompts/router";

export const app = new Hono();

// Postgres SQLSTATE codes for constraint violations that indicate a client-side
// conflict (e.g. a referenced row no longer exists) rather than a server fault.
// Both currently map to the same generic message. 23505 (unique_violation) has
// no live trigger yet (no unique constraints besides primary keys) - if one is
// added, split this into per-code messages so "value already exists" isn't
// confused with "referenced row doesn't exist".
const POSTGRES_CONFLICT_CODES = new Set([
  "23503", // foreign_key_violation
  "23505", // unique_violation
]);

function getPostgresErrorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    const { code } = err as { code: unknown };
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  const pgCode = getPostgresErrorCode(err);
  if (pgCode && POSTGRES_CONFLICT_CODES.has(pgCode)) {
    console.error(`Database conflict (${pgCode}): ${err.message}`);
    return c.json({ error: "Conflicts with existing data" }, 409);
  }

  console.error(err.message);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/ai-models", aiModelsRouter);
app.route("/memos", memosRouter);
app.route("/prompts", promptsRouter);
