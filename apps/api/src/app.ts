import { Hono } from "hono";

import { memosRouter } from "./features/memos/memos.routes.js";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/memos", memosRouter);
