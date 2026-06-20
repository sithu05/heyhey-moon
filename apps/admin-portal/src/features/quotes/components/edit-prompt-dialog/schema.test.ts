import { describe, expect, it } from "vitest";

import { MODELS, defaultValues, editPromptSchema } from "./schema";

describe("editPromptSchema", () => {
  it("accepts the default values", () => {
    expect(editPromptSchema.safeParse(defaultValues).success).toBe(true);
  });

  it("accepts a custom prompt with any valid model", () => {
    expect(
      editPromptSchema.safeParse({ prompt: "Custom instructions.", model: "gpt-4o" }).success,
    ).toBe(true);
  });

  it("rejects an empty prompt", () => {
    const result = editPromptSchema.safeParse({ prompt: "", model: "claude-sonnet-4-5" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.prompt).toContain("Prompt cannot be empty");
    }
  });

  it("rejects a whitespace-only prompt", () => {
    const result = editPromptSchema.safeParse({ prompt: "   ", model: "claude-sonnet-4-5" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.prompt).toContain("Prompt cannot be empty");
    }
  });

  it("rejects an unknown model value", () => {
    const result = editPromptSchema.safeParse({ prompt: "x", model: "unknown-model" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.model).toBeDefined();
    }
  });

  it.each(MODELS)("accepts model '%s'", (model) => {
    expect(editPromptSchema.safeParse({ prompt: "x", model }).success).toBe(true);
  });
});
