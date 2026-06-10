import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = 8787;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});
