# Edit Prompt Dialog — Design Spec

**Date:** 2026-06-19  
**Scope:** Frontend only — no API calls, no persistence  
**App:** `apps/admin-portal` — `features/quotes`

---

## Overview

The Quotes page has an "Edit prompt" button. Clicking it opens a wide two-column dialog where the user can read and edit the AI tagging prompt and select which model runs the classification. Saving just closes the dialog; no data is persisted in this phase.

---

## New File

```
apps/admin-portal/src/features/quotes/components/ui/edit-prompt-dialog.tsx
```

One `"use client"` component: `EditPromptDialog`. Exported and rendered directly in `quotes/page.tsx` in place of the existing bare `<Button variant="outline">Edit prompt</Button>`.

---

## Component Structure

```
<Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) form.reset(defaultValues); }}>
  <DialogTrigger asChild>
    <Button variant="outline" size="lg">
      <PencilIcon /> Edit prompt
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-4xl ...">
    <DialogHeader>          ← icon + title + description
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-6">
        <PromptPanel />     ← left: textarea (flex-1)
        <RightPanel />      ← right: model picker + dimensions (~320px)
      </div>
      <DialogFooter>        ← Reset to default | Cancel | Save prompt
    </form>
  </DialogContent>
</Dialog>
```

All sub-sections are inline (not split into separate files) — the component is self-contained.

---

## Form

**Library:** `react-hook-form` + `zodResolver` from `@hookform/resolvers/zod`

### Zod Schema

Defined in a dedicated file so it can be imported independently by tests:

```
apps/admin-portal/src/features/quotes/components/ui/edit-prompt-dialog.schema.ts
```

```ts
import { z } from "zod";

export const MODELS = [
  "claude-sonnet-4-5",
  "claude-haiku-4-5",
  "gpt-4o",
  "gemini-2-5-pro",
] as const;

export type ModelId = (typeof MODELS)[number];

export const editPromptSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  model: z.enum(MODELS),
});

export type EditPromptFormValues = z.infer<typeof editPromptSchema>;

export const defaultValues: EditPromptFormValues = {
  prompt: DEFAULT_PROMPT,   // imported from a sibling constants file
  model: "claude-sonnet-4-5",
};
```

`useForm` is wired with `zodResolver(editPromptSchema)`.

**Validation rules:**
- `prompt`: must be non-empty (`min(1)`) — error message: "Prompt cannot be empty"
- `model`: must be one of the four enum values — always satisfied since the default is valid and the UI only presents valid options

**Open state:** Controlled via `const [open, setOpen] = useState(false)` passed as `open` / `onOpenChange={setOpen}` to `<Dialog>`. This enables programmatic close after submit without ref gymnastics.

**Reset on open:** `onOpenChange` calls `form.reset(defaultValues)` when `open === true`. Re-opening always starts from defaults — no stale edits leak across sessions.

**Handlers:**
- `onSubmit` (bound to "Save prompt"): calls `setOpen(false)` — no data emitted.
- "Reset to default" button (`type="button"`): calls `form.reset(defaultValues)`.
- "Cancel" button: `<DialogClose asChild>` wrapping a `<Button variant="outline">` — Radix handles close automatically.

---

## Left Panel — Prompt

- Label: `PROMPT` (uppercase, muted, small) + helper text "Define how the model reads, weighs and tags each quote."
- `<Textarea>` from `@repo/ui`: monospace font, tall (min ~300px, grows with content or fixed tall), full width
- Wired via `{...register("prompt")}`
- Error state: red border + inline error message if submitted empty

---

## Right Panel — Two Sections

### MODEL

- Label: `MODEL` (uppercase, muted, small) + helper "Which model runs the classification."
- `<RadioGroup>` from `@repo/ui`, controlled via `Controller` from `react-hook-form`
- 4 options, each rendered as a clickable card:

| Value | Name | Badge | Provider | Description |
|---|---|---|---|---|
| `claude-sonnet-4-5` | Claude Sonnet 4.5 | RECOMMENDED (green) | Anthropic | Balanced quality and speed for nuanced, multi-dimension tagging. |
| `claude-haiku-4-5` | Claude Haiku 4.5 | FAST (gray) | Anthropic | Fastest and lowest cost — ideal for large import batches. |
| `gpt-4o` | GPT-4o | — | OpenAI | Strong general reasoning across varied phrasing. |
| `gemini-2-5-pro` | Gemini 2.5 Pro | — | Google | Long-context and robust multilingual handling. |

Card selected state: purple border + purple radio dot (matches the screenshot's purple ring).

### EXTRACTION DIMENSIONS

- Label: `EXTRACTION DIMENSIONS` (uppercase, muted, small) + helper "One tag per dimension — Tone allows up to three."
- Read-only display. No form binding.
- Iterates `DIMENSION_ORDER` from `features/quotes/types.ts`
- For each dimension: colored dot + dimension label, then its allowed values as chips using `DIMENSIONS[key].chipClassName` + `DIMENSIONS[key].dotClassName`
- Allowed values per dimension are defined as a constant in the same file (mirrors the screenshot):

```ts
const DIMENSION_VALUES: Record<DimensionKey, string[]> = {
  mindset:    ["Growth", "Fixed"],
  worldview:  ["Stoic", "Optimistic", "Realist"],
  motivation: ["Intrinsic", "Extrinsic"],
  tone:       ["Energizing", "Calming", "Reflective", "Urgent", "Tender", "Resolute", "Empowering"],
  theme:      ["Resilience", "Discipline", "Gratitude", "Courage", "Focus", "Perseverance", "Perspective", "Contentment", "Self-belief", "Agency"],
  timeframe:  ["Present", "Future", "Past"],
  agency:     ["Self", "Collective"],
};
```

---

## Dialog Header

- Left: menu/lines icon (e.g. `AlignLeftIcon` from lucide) + title "AI tagging prompt" + subtitle "Instructions the model follows when classifying every quote."
- Right: `X` close button (already built into `DialogContent` from `@repo/ui`)

---

## Dialog Footer

Three-zone layout (`flex justify-between items-center`):

- **Left:** "Reset to default" — `<Button variant="ghost">` or plain text link, `type="button"`, calls `form.reset(defaultValues)`
- **Right:** `<Button variant="outline">Cancel</Button>` (wrapped in `<DialogClose asChild>`) + `<Button variant="default" type="submit">Save prompt</Button>`

---

## Page Change

`apps/admin-portal/src/app/(app)/quotes/page.tsx`:

Replace:
```tsx
<Button variant="outline" size="lg">
  <PencilIcon className="size-4" />
  Edit prompt
</Button>
```

With:
```tsx
<EditPromptDialog />
```

The page remains a server component (no `"use client"` needed).

---

## Testing

### Schema tests — `edit-prompt-dialog.schema.test.ts`

Unit tests run in Node env (no DOM needed). Import `editPromptSchema` and `defaultValues` directly.

| Test | Input | Expected |
|---|---|---|
| valid default values pass | `defaultValues` | `success: true` |
| valid custom prompt passes | `{ prompt: "Custom text", model: "gpt-4o" }` | `success: true` |
| empty prompt fails | `{ prompt: "", model: "claude-sonnet-4-5" }` | `error` on `prompt`, message "Prompt cannot be empty" |
| whitespace-only prompt fails | `{ prompt: "   ", model: "claude-sonnet-4-5" }` | `error` on `prompt` — use `z.string().trim().min(1, ...)` |
| invalid model fails | `{ prompt: "x", model: "unknown-model" }` | `error` on `model` |
| all four valid model values pass | each of `MODELS` | `success: true` |

> **Note on whitespace:** use `.trim().min(1, ...)` on the prompt field so `"   "` is rejected.

### Component tests — `edit-prompt-dialog.test.tsx`

Integration tests run in jsdom env with React Testing Library. Test behaviour, not implementation.

| Test | Action | Expected |
|---|---|---|
| renders trigger button | render `<EditPromptDialog />` | button with text "Edit prompt" is visible |
| dialog is closed by default | render | dialog content is not in the DOM |
| clicking trigger opens dialog | click "Edit prompt" | dialog title "AI tagging prompt" appears |
| textarea contains default prompt | open dialog | textarea value equals `DEFAULT_PROMPT` |
| model defaults to Claude Sonnet | open dialog | "Claude Sonnet 4.5" radio is checked |
| save with valid data closes dialog | open, click "Save prompt" | dialog content leaves the DOM |
| save with empty prompt shows error | open, clear textarea, click "Save prompt" | error message "Prompt cannot be empty" appears, dialog stays open |
| reset restores defaults after edits | open, change textarea, click "Reset to default" | textarea value equals `DEFAULT_PROMPT` |
| cancel closes dialog | open, click "Cancel" | dialog content leaves the DOM |
| re-opening after edit starts fresh | open, edit prompt, cancel, reopen | textarea value equals `DEFAULT_PROMPT` |

---

## File Locations Summary

| File | Change |
|---|---|
| `features/quotes/components/ui/edit-prompt-dialog.schema.ts` | **New** — Zod schema, `MODELS`, `EditPromptFormValues`, `defaultValues` |
| `features/quotes/components/ui/edit-prompt-dialog.schema.test.ts` | **New** — schema unit tests |
| `features/quotes/components/ui/edit-prompt-dialog.tsx` | **New** — full dialog component |
| `features/quotes/components/ui/edit-prompt-dialog.test.tsx` | **New** — component integration tests |
| `app/(app)/quotes/page.tsx` | **Edit** — swap Button for `<EditPromptDialog />` |

**New packages required** (none are currently in `apps/admin-portal`):
```
pnpm --filter admin-portal add react-hook-form zod @hookform/resolvers
```
