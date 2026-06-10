import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/heyhey_memo";

const queryClient = postgres(connectionString);

export const db = drizzle({ client: queryClient, schema });
