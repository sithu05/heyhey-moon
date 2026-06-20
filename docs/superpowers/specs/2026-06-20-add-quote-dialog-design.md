# Add Quote Dialog — Frontend UI Design

**Date:** 2026-06-20
**Scope:** Frontend UI only (dialog shell, form layout, validation, callbacks)
**Feature Domain:** `apps/admin-portal/src/features/quotes/`

---

## 1. Overview

Add a new `AddQuoteDialog` component to the `quotes` feature domain. It is a frontend-only dialog that lets users input a quote, author, source, language, and context, then submit it for later AI classification. The dialog follows the existing `edit-prompt-dialog/` decomposition pattern and reuses `@repo/ui` shadcn-style components.

---

## 2. Component Architecture & File Layout

Inside `apps/admin-portal/src/features/quotes/components/`:

```
add-quote-dialog/
  index.ts              — barrel export: AddQuoteDialog
  dialog.tsx            — shell: open state, Dialog, header, form mount, footer
  form.tsx              — AddQuoteForm: RHF, all fields, banner, footer actions
  schema.ts             — Zod schema + TypeScript types
  dialog.test.tsx       — open/close/submit presence tests
  form.test.tsx         — field rendering, validation, callback firing tests
  schema.test.ts        — valid/invalid value matrix tests
```

This mirrors the existing `edit-prompt-dialog/` decomposition exactly.

---

## 3. UI Layout & Fields

### Dialog Shell (`dialog.tsx`)

- **Self-contained open state** via `useState(false)` inside `dialog.tsx` (same pattern as `EditPromptDialog`).
- `Dialog open={open} onOpenChange={setOpen}`.
- `DialogTrigger asChild` wraps the trigger button (`PlusIcon` + "Add quote").
- `DialogContent size="lg"` — same max-width (`sm:max-w-4xl`) and height constraint (`max-h-[calc(100vh-80px)] overflow-hidden`) as `EditPromptDialog`.
- **Custom header row** inside `DialogHeader`:
  - Rounded square icon container with `bg-primary text-primary-foreground` (`Plus` icon).
  - Title: "Add a quote"
  - Subtitle: "Enter the quote — AI assigns the attributes for you."
- **Conditional form mount**: `{open && <AddQuoteForm onSubmit={handleSubmit} onEditPrompt={handleEditPrompt} />}` so `useForm` resets cleanly on re-open (same pattern as `EditPromptDialog`).
- The form body is wrapped in a scrollable container (`overflow-y-auto` or `ScrollArea`) so the sticky footer never gets pushed off-screen.
- **Internal handlers** (defined in `dialog.tsx`):
  - `handleSubmit(values)`: calls the `onSubmit` prop with the form values, then `setOpen(false)`.
  - `handleEditPrompt()`: calls the optional `onEditPrompt` prop, then `setOpen(false)`.

### Form Fields (`form.tsx`)

Fields stack vertically with `gap-4` spacing:

1. **QUOTE** (`<Textarea>`)
   - Full width, ~4 visible rows.
   - Placeholder: "Paste or type the quote…"

2. **AUTHOR / SOURCE** (2-column grid)
   - `grid-cols-1 sm:grid-cols-2 gap-4`
   - AUTHOR: `<Input>` placeholder "e.g. Marcus Aurelius"
   - SOURCE: `<Input>` placeholder "e.g. Meditations"

3. **LANGUAGE** (`<ToggleGroup type="single">`)
   - Horizontal pill-style buttons: `EN English`, `TH ไทย`, `MY မြန်မာ`.
   - Default selection: `"en"`.
   - Helper text below: "Auto-detected from the text — adjust if needed."
   - If `ToggleGroup` styling is insufficient, fall back to a styled `<RadioGroup>` rendered as pills.

4. **CONTEXT** (`<Textarea>`)
   - Label row with left text "CONTEXT" + small helper "Crawled background that sharpens the AI tags."
   - Right-aligned action: `<Button variant="outline" size="sm">` "Find context" (presentational — no-op for frontend-only scope).
   - Placeholder: "Click 'Find context' to crawl the web, or write your own…"

5. **AI Tagging Banner**
   - Rounded card with `bg-muted/50` or equivalent subtle background.
   - Icon + text: "Tagged automatically with Claude Sonnet 4.5 using your saved prompt."
   - `<Button variant="link" size="sm">` "Edit prompt"
   - Clicking "Edit prompt" calls the `onEditPrompt` callback prop so the parent can open the existing `EditPromptDialog`.
   - If `onEditPrompt` is undefined, the link is hidden.

### Dialog Footer

- Uses `DialogFooter` (already sticky with `-mx-4 -mb-4 rounded-b-xl border-t bg-muted/50 p-4`).
- **Cancel**: `DialogClose asChild` wrapping `<Button variant="outline">`.
- **Classify with AI**: Primary `<Button type="submit">` inside the form.

---

## 4. Data Flow, Validation & Callbacks

### Schema (`schema.ts`)

```ts
export const addQuoteSchema = z.object({
  quote: z.string().trim().min(1, "Quote is required"),
  author: z.string().trim().optional(),
  source: z.string().trim().optional(),
  language: z.enum(["en", "th", "my"]),
  context: z.string().trim().optional(),
});

export type AddQuoteFormValues = z.infer<typeof addQuoteSchema>;
```

### Form Setup

- `useForm<AddQuoteFormValues>` with `resolver: zodResolver(addQuoteSchema)`.
- `defaultValues`:
  ```ts
  {
    quote: "",
    author: "",
    source: "",
    language: "en",
    context: "",
  }
  ```

### Callback Props

| Prop           | Type                                                    | Required | Description                                                                             |
| -------------- | ------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `onSubmit`     | `(values: AddQuoteFormValues) => void \| Promise<void>` | Yes      | Called with validated values when "Classify with AI" is pressed.                        |
| `onEditPrompt` | `() => void`                                            | No       | Called when "Edit prompt" link is clicked. Parent uses this to open `EditPromptDialog`. |

---

## 5. Page Integration

Replace the existing "Add quote" `<Button>` in `app/(app)/quotes/page.tsx` with `<AddQuoteDialog />`.

Make `EditPromptDialog` optionally controlled so the page can open it programmatically from `AddQuoteDialog`:

- Add optional `open?: boolean` and `onOpenChange?: (open: boolean) => void` props to `EditPromptDialog`.
- If absent, fall back to internal `useState(false)` (backward compatible).

Updated page snippet:

```tsx
const [editOpen, setEditOpen] = useState(false);

return (
  <div className="flex items-center gap-3.5">
    <EditPromptDialog open={editOpen} onOpenChange={setEditOpen} />
    <AddQuoteDialog
      onSubmit={handleAddQuote}
      onEditPrompt={() => setEditOpen(true)}
    />
  </div>
);
```

- `handleAddQuote(values)` receives the validated form values. Frontend-only: currently a no-op or `console.log`.
- `AddQuoteDialog` internally calls `setOpen(false)` after both `onSubmit` and `onEditPrompt`, so it closes itself.

---

## 6. Error Handling & Edge Cases

- **Inline validation**: RHF + Zod show errors under each field using `text-xs text-destructive` (existing pattern).
- **Required field**: Only `quote` is required. All other fields are optional.
- **Dialog close (Esc / overlay / X)**: Closes the dialog. Re-opening resets the form because of conditional mounting.
- **Missing `onEditPrompt`**: If the prop is omitted, the "Edit prompt" link is not rendered. Keeps the dialog usable in isolation.
- **Responsiveness**: AUTHOR/SOURCE grid collapses to single column on mobile. LANGUAGE pills wrap if needed.
- **Scroll safety**: The form body inside `DialogContent size="lg"` is scrollable so the sticky footer remains accessible regardless of content length.

---

## 7. Testing Strategy

Following the existing test conventions (`edit-prompt-dialog/*.test.*`):

### `dialog.test.tsx`

- Render with trigger button.
- Click trigger → dialog appears (assert title "Add a quote").
- Click close/X → dialog disappears.
- Assert "Classify with AI" submit button is present.

### `form.test.tsx`

- Render `AddQuoteForm` with mock `onSubmit` and `onEditPrompt`.
- Assert all inputs, textareas, and language toggle/radio items are in the document.
- Submit empty form → assert "Quote is required" error appears.
- Fill valid data → submit → assert `onSubmit` called with expected object shape.
- Click "Edit prompt" → assert `onEditPrompt` called.

### `schema.test.ts`

- Valid object with all fields passes.
- Missing `quote` fails.
- Whitespace-only `quote` fails (after trim).
- Invalid `language` value fails.
- Optional fields (`author`, `source`, `context`) absent passes.

---

## 8. Reuse & Dependencies

- **Reuses**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogTrigger`, `DialogClose`, `DialogFooter`, `Button`, `Input`, `Textarea`, `ToggleGroup` (or `RadioGroup`), `Badge`-style pills, `ScrollArea` — all from `@repo/ui`.
- **Depends on**: Existing `EditPromptDialog` for the "Edit prompt" callback integration.
- **No new backend dependencies** — this is strictly a frontend shell.

---

## 9. Out of Scope (Frontend-Only Boundary)

- No API calls from the dialog itself.
- No database schema changes.
- No actual AI classification logic.
- "Find context" button is presentational only.
- Language auto-detection is not implemented; the default remains `"en"` until a backend or browser API fills it.
