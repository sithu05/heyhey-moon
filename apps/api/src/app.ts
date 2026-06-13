import { Hono } from "hono";

import { aiModelsRouter } from "./features/ai-models/ai-models.routes";
import { memosRouter } from "./features/memos/memos.routes";
import { promptsRouter } from "./features/prompts/prompts.routes";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/ai-models", aiModelsRouter);
app.route("/memos", memosRouter);
app.route("/prompts", promptsRouter);
