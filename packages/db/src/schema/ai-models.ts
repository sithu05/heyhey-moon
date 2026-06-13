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
