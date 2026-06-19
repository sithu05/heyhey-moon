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
<Dialog onOpenChange={(open) => open && form.reset(defaultValues)}>
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

**Library:** `react-hook-form` (`useForm<EditPromptFormValues>`)

```ts
type EditPromptFormValues = {
  prompt: string;
  model: "claude-sonnet-4-5" | "claude-haiku-4-5" | "gpt-4o" | "gemini-2-5-pro";
};

const defaultValues: EditPromptFormValues = {
  prompt: DEFAULT_PROMPT,   // hardcoded constant in the same file
  model: "claude-sonnet-4-5",
};
```

**Validation:** `prompt` must be non-empty (required rule). No validation on `model` (always has a default).

**Reset on open:** `onOpenChange` on `<Dialog>` calls `form.reset(defaultValues)` when `open === true`. This means re-opening the dialog always starts from defaults — no stale edits leak across sessions.

**Handlers:**
- `onSubmit` (bound to "Save prompt"): calls `dialogClose()` — no data emitted. Uses a `ref` on `DialogClose`/`DialogPrimitive.Close` or a controlled close pattern to close the dialog programmatically after submit.
- "Reset to default" button (`type="button"`): calls `form.reset(defaultValues)`.
- "Cancel" button: `<DialogClose asChild>` wrapping a `<Button variant="outline">`.

> **Closing after submit:** Since the dialog is uncontrolled, programmatic close on submit is handled by rendering a hidden `<DialogClose>` ref, or by switching to a minimal controlled pattern (`open` + `onOpenChange` props on `<Dialog>`). Implementation detail: prefer the controlled pattern to avoid ref gymnastics — add `const [open, setOpen] = useState(false)` and pass `open`/`onOpenChange={setOpen}` to `<Dialog>`. `onSubmit` sets `open` to false.

---

## Left Panel — Prompt

- Label: `PROMPT` (uppercase, muted, small) + helper text "Define how the model reads, weighs and tags each quote."
- `<Textarea>` from `@repo/ui`: monospace font, tall (min ~300px, grows with content or fixed tall), full width
- Wired via `{...register("prompt", { required: true })}`
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

## File Locations Summary

| File | Change |
|---|---|
| `features/quotes/components/ui/edit-prompt-dialog.tsx` | **New** — full dialog component |
| `app/(app)/quotes/page.tsx` | **Edit** — swap Button for `<EditPromptDialog />` |

**New package required:** `react-hook-form` is not yet installed in `apps/admin-portal`. Add it before implementation:
```
pnpm --filter admin-portal add react-hook-form
```
