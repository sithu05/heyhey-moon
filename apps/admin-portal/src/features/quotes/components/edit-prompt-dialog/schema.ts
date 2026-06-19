import { z } from "zod";

export const DEFAULT_PROMPT = `You are Zello's quote classifier. Read the quote together with its author and source, then assign tags across the seven psychological dimensions defined below.

GENERAL RULES
- Choose only from each dimension's allowed values; never invent new tags.
- Assign exactly one value per dimension, except Tone, which may take one to three.
- Favour the dominant reading of the quote; be decisive rather than hedging.
- Treat the author and source as supporting context, not as tags themselves.
- When two values seem equally valid, pick the one a first-time reader would feel most strongly.

DIMENSION GUIDANCE
- Mindset – Does the quote frame ability and outcomes as changeable (Growth) or fixed (Fixed)?
- Worldview – The underlying philosophy: Stoic acceptance, Optimistic hope, or grounded Realist.
- Motivation – Is the drive internal and self-directed (Intrinsic) or reward/recognition-based (Extrinsic)?
- Tone – The emotional texture of the language. Capture every tone that is clearly present.
- Theme – The single most central life concept the quote speaks to.
- Time – Where the quote anchors attention: the Present moment, the Future, or the Past.
- Agency – Whether responsibility sits with the individual (Self) or the group (Collective).

OUTPUT
Return one tag set per quote, ordered by the dimensions above. Keep tags terse and human-readable.`;

export const MODELS = [
  "claude-sonnet-4-5",
  "claude-haiku-4-5",
  "gpt-4o",
  "gemini-2-5-pro",
] as const;

export type ModelId = (typeof MODELS)[number];

export const editPromptSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt cannot be empty"),
  model: z.enum(MODELS),
});

export type EditPromptFormValues = z.infer<typeof editPromptSchema>;

export const defaultValues: EditPromptFormValues = {
  prompt: DEFAULT_PROMPT,
  model: "claude-sonnet-4-5",
};
