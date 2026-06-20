import { DEFAULT_PROMPT } from "./schema";
import type { EditPromptFormValues } from "./types";

export const defaultValues: EditPromptFormValues = {
  prompt: DEFAULT_PROMPT,
  model: "claude-sonnet-4-5",
};
