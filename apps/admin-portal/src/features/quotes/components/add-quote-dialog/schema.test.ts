import { describe, expect, it } from "vitest";

import { addQuoteSchema } from "./schema";
import { defaultValues } from "./constants";

describe("addQuoteSchema", () => {
  it("has default values with all expected keys", () => {
    expect(defaultValues).toEqual({
      quote: "",
      author: "",
      source: "",
      language: "en",
      context: "",
    });
  });

  it("accepts a fully filled quote", () => {
    const result = addQuoteSchema.safeParse({
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      source: "Stanford Commencement",
      language: "en",
      context: "A famous speech given in 2005.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty quote", () => {
    const result = addQuoteSchema.safeParse(defaultValues);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quote).toContain(
        "Quote is required",
      );
    }
  });

  it("rejects a whitespace-only quote", () => {
    const result = addQuoteSchema.safeParse({ ...defaultValues, quote: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quote).toContain(
        "Quote is required",
      );
    }
  });

  it("rejects an invalid language value", () => {
    const result = addQuoteSchema.safeParse({
      quote: "Valid quote text",
      language: "fr",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.language).toBeDefined();
    }
  });

  it("accepts absent optional fields", () => {
    const result = addQuoteSchema.safeParse({
      quote: "Just do it.",
      language: "en",
    });
    expect(result.success).toBe(true);
  });

  it.each(["en", "th", "my"] as const)("accepts language '%s'", (language) => {
    expect(
      addQuoteSchema.safeParse({ quote: "Test quote.", language }).success,
    ).toBe(true);
  });
});
