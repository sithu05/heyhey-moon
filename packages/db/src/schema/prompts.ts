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
