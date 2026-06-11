import { Hono } from "hono";

import { memosRouter } from "./features/memos/memos.routes";
import { promptsRouter } from "./features/prompts/prompts.routes";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/memos", memosRouter);
app.route("/prompts", promptsRouter);
