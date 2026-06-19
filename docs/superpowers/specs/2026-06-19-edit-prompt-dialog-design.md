# Edit Prompt Dialog — Design Spec

**Date:** 2026-06-19  
**Scope:** Frontend only — no API calls, no persistence  
**App:** `apps/admin-portal` — `features/quotes`

---

## Overview

The Quotes page has an "Edit prompt" button. Clicking it opens a wide two-column dialog where the user can read and edit the AI tagging prompt and select which model runs the classification. Saving just closes the dialog; no data is persisted in this phase.

---

## Folder Structure

All files live in a slice folder:

```
features/quotes/components/ui/edit-prompt-dialog/
  schema.ts         — Zod schema, MODELS const, types, defaultValues
  schema.test.ts    — schema unit tests (Node env, no DOM)
  form.tsx          — EditPromptForm component (pure form, no dialog)
  form.test.tsx     — form component tests (jsdom, no dialog wrapping)
  dialog.tsx        — EditPromptDialog (Dialog shell + trigger, wraps EditPromptForm)
  dialog.test.tsx   — dialog open/close integration tests (jsdom)
  index.ts          — re-exports EditPromptDialog
```

`quotes/page.tsx` imports from the index: `import { EditPromptDialog } from "@/features/quotes/components/ui/edit-prompt-dialog"`.

---

## Component Split: Form vs Dialog

### `form.tsx` — `EditPromptForm`

The pure form component. Receives the `react-hook-form` instance as a prop — it owns no state itself.

```tsx
type EditPromptFormProps = {
  form: UseFormReturn<EditPromptFormValues>;
  onSubmit: (values: EditPromptFormValues) => void;
  onReset: () => void;
};
```

Renders:
- `<form onSubmit={handleSubmit(onSubmit)}>`
- Two-column layout: left prompt panel + right panel (model picker + dimensions)
- Footer zone: "Reset to default" button (calls `onReset`) + "Cancel" (DialogClose) + "Save prompt" (submit)

The form is fully testable without opening any dialog — tests just render `<EditPromptForm form={...} onSubmit={...} onReset={...} />` directly.

### `dialog.tsx` — `EditPromptDialog`

The thin dialog shell. Owns `open` state and the `useForm` instance, delegates everything else to `EditPromptForm`.

```tsx
export function EditPromptDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<EditPromptFormValues>({
    resolver: zodResolver(editPromptSchema),
    defaultValues,
  });

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (o) form.reset(defaultValues);
  }

  function handleSubmit(values: EditPromptFormValues) {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <PencilIcon className="size-4" /> Edit prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>...</DialogHeader>
        <EditPromptForm
          form={form}
          onSubmit={handleSubmit}
          onReset={() => form.reset(defaultValues)}
        />
      </DialogContent>
    </Dialog>
  );
}
```

Dialog tests focus only on: trigger renders, dialog opens/closes, form resets on reopen.

---

## Schema (`schema.ts`)

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
  prompt: z.string().trim().min(1, "Prompt cannot be empty"),
  model: z.enum(MODELS),
});

export type EditPromptFormValues = z.infer<typeof editPromptSchema>;

export const defaultValues: EditPromptFormValues = {
  prompt: DEFAULT_PROMPT,   // hardcoded constant exported from the same file
  model: "claude-sonnet-4-5",
};
```

`.trim().min(1, ...)` on prompt rejects whitespace-only input.

---

## Left Panel — Prompt

Rendered inside `EditPromptForm`:

- Label: `PROMPT` (uppercase, muted, small) + helper "Define how the model reads, weighs and tags each quote."
- `<Textarea>` from `@repo/ui`: monospace font, tall (min ~300px), full width
- Wired via `{...register("prompt")}`
- Shows inline error below the textarea when `formState.errors.prompt` is set

---

## Right Panel — Two Sections

Rendered inside `EditPromptForm`:

### MODEL

- Label: `MODEL` (uppercase, muted, small) + helper "Which model runs the classification."
- `<RadioGroup>` from `@repo/ui`, controlled via `Controller` from `react-hook-form`
- 4 options rendered as clickable cards:

| Value | Name | Badge | Provider | Description |
|---|---|---|---|---|
| `claude-sonnet-4-5` | Claude Sonnet 4.5 | RECOMMENDED (green) | Anthropic | Balanced quality and speed for nuanced, multi-dimension tagging. |
| `claude-haiku-4-5` | Claude Haiku 4.5 | FAST (gray) | Anthropic | Fastest and lowest cost — ideal for large import batches. |
| `gpt-4o` | GPT-4o | — | OpenAI | Strong general reasoning across varied phrasing. |
| `gemini-2-5-pro` | Gemini 2.5 Pro | — | Google | Long-context and robust multilingual handling. |

Card selected state: purple border + purple radio dot.

### EXTRACTION DIMENSIONS

- Label: `EXTRACTION DIMENSIONS` (uppercase, muted, small) + helper "One tag per dimension — Tone allows up to three."
- Read-only display, no form binding.
- Iterates `DIMENSION_ORDER` from `features/quotes/types.ts`
- Each dimension: colored dot + label + allowed values as chips (`DIMENSIONS[key].chipClassName`)
- Allowed values constant (defined in `form.tsx`):

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

- Left: `AlignLeftIcon` (lucide) + title "AI tagging prompt" + subtitle "Instructions the model follows when classifying every quote."
- Right: `X` close button (built into `DialogContent` from `@repo/ui`)

---

## Dialog Footer

Rendered inside `EditPromptForm` so the submit button is inside `<form>`:

Three-zone layout (`flex justify-between items-center`):

- **Left:** "Reset to default" — `<Button variant="ghost" type="button">`, calls `onReset`
- **Right:** `<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>` + `<Button type="submit">Save prompt</Button>`

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

The page remains a server component — `EditPromptDialog` carries its own `"use client"` boundary.

---

## Testing

### `schema.test.ts` — Zod schema unit tests (Node env)

Import `editPromptSchema`, `MODELS`, and `defaultValues` directly. No DOM.

| Test | Input | Expected |
|---|---|---|
| default values pass | `defaultValues` | `success: true` |
| valid custom prompt passes | `{ prompt: "Custom text", model: "gpt-4o" }` | `success: true` |
| empty prompt fails | `{ prompt: "", model: "claude-sonnet-4-5" }` | error on `prompt`: "Prompt cannot be empty" |
| whitespace-only prompt fails | `{ prompt: "   ", model: "claude-sonnet-4-5" }` | error on `prompt` |
| invalid model fails | `{ prompt: "x", model: "unknown-model" }` | error on `model` |
| each of the four MODELS passes | iterate `MODELS` | `success: true` for all |

### `form.test.tsx` — Form component tests (jsdom + RTL)

Render `<EditPromptForm>` directly with a real `useForm` instance from a wrapper. Dialog not involved.

| Test | Action | Expected |
|---|---|---|
| renders prompt textarea | render | textarea is present |
| textarea shows default prompt | render with `defaultValues` | textarea value equals `DEFAULT_PROMPT` |
| model radio defaults to Claude Sonnet | render | Claude Sonnet 4.5 radio is checked |
| changing textarea updates form value | type in textarea | new value reflected |
| selecting a model updates form value | click a radio card | that model becomes checked |
| submit with empty prompt shows error | clear textarea, submit | "Prompt cannot be empty" appears |
| submit with valid data calls onSubmit | fill prompt, submit | `onSubmit` called with correct values |
| reset button calls onReset | click "Reset to default" | `onReset` callback is called |
| all 7 dimensions are displayed | render | each dimension label is visible |

### `dialog.test.tsx` — Dialog integration tests (jsdom + RTL)

Render `<EditPromptDialog />`. Focus on open/close and form reset — not re-testing form validation.

| Test | Action | Expected |
|---|---|---|
| renders trigger button | render | "Edit prompt" button is visible |
| dialog closed by default | render | dialog content not in DOM |
| trigger opens dialog | click "Edit prompt" | "AI tagging prompt" heading appears |
| cancel closes dialog | open, click "Cancel" | dialog content leaves DOM |
| save closes dialog | open, click "Save prompt" | dialog content leaves DOM |
| re-open resets form | open, edit prompt, cancel, reopen | textarea shows `DEFAULT_PROMPT` |

---

## File Locations Summary

| File | Change |
|---|---|
| `features/quotes/components/ui/edit-prompt-dialog/schema.ts` | **New** — Zod schema, `MODELS`, types, `defaultValues` |
| `features/quotes/components/ui/edit-prompt-dialog/schema.test.ts` | **New** — schema unit tests |
| `features/quotes/components/ui/edit-prompt-dialog/form.tsx` | **New** — `EditPromptForm` (pure form, no dialog) |
| `features/quotes/components/ui/edit-prompt-dialog/form.test.tsx` | **New** — form component tests |
| `features/quotes/components/ui/edit-prompt-dialog/dialog.tsx` | **New** — `EditPromptDialog` (dialog shell + trigger) |
| `features/quotes/components/ui/edit-prompt-dialog/dialog.test.tsx` | **New** — dialog open/close tests |
| `features/quotes/components/ui/edit-prompt-dialog/index.ts` | **New** — re-exports `EditPromptDialog` |
| `app/(app)/quotes/page.tsx` | **Edit** — swap Button for `<EditPromptDialog />` |

**New packages required** (none currently in `apps/admin-portal`):
```
pnpm --filter admin-portal add react-hook-form zod @hookform/resolvers
```
