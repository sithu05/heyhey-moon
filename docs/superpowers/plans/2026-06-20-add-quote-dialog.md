# Add Quote Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend UI for an "Add Quote" dialog in the quotes feature domain, following the existing `edit-prompt-dialog` architecture.

**Architecture:** Self-contained dialog component with internal open state, decomposed into dialog shell (state + trigger + header) and form component (React Hook Form + Zod + fields). Reuses `@repo/ui` shadcn components. Optionally controls the existing `EditPromptDialog` from an "Edit prompt" link inside the form.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui (`@repo/ui`), React Hook Form, Zod, Vitest + React Testing Library, pnpm + Turborepo.

## Global Constraints

- This is a **frontend-only** task. No API calls, no database changes.
- Follow the existing `edit-prompt-dialog/` file structure and patterns exactly.
- Use `@repo/ui` components only; no raw Radix UI imports outside of `@repo/ui`.
- Pre-PR checklist: `pnpm run lint`, `pnpm check-types`, `pnpm test` — all must pass.
- No `Co-Authored-By` in git commits.

---

## File Structure

| Path                                                                                | Responsbility                                                                                                    |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/dialog.tsx`    | Refactor to add optional `open`/`onOpenChange` props (backward compatible)                                       |
| `apps/admin-portal/src/features/quotes/components/add-quote-dialog/schema.ts`       | Zod schema, default values, exported type                                                                        |
| `apps/admin-portal/src/features/quotes/components/add-quote-dialog/schema.test.ts`  | Zod schema validation matrix (7 tests)                                                                           |
| `apps/admin-portal/src/features/quotes/components/add-quote-dialog/form.tsx`        | AddQuoteForm: RHF, all fields, banner, footer actions                                                            |
| `apps/admin-portal/src/features/quotes/components/add-quote-dialog/form.test.tsx`   | Field rendering, language selection, validation errors, submit callback, edit-prompt callback (11 tests)         |
| `apps/admin-portal/src/features/quotes/components/add-quote-dialog/dialog.tsx`      | AddQuoteDialog: self-contained state, trigger, header, conditional form mount                                    |
| `apps/admin-portal/src/features/quotes/components/add-quote-dialog/index.ts`        | Barrel export: `AddQuoteDialog`                                                                                  |
| `apps/admin-portal/src/features/quotes/components/add-quote-dialog/dialog.test.tsx` | Trigger, open/close, submit closure, re-open reset (6 tests)                                                     |
| `apps/admin-portal/src/app/(app)/quotes/page.tsx`                                   | Make client component, replace "Add quote" button with `<AddQuoteDialog>`; control `EditPromptDialog` open state |

---

### Task 1: Make EditPromptDialog optionally controlled

**Files:**

- Modify: `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/dialog.tsx`

**Interfaces:**

- Consumes: existing `Dialog`, `useState` from React.
- Produces: `EditPromptDialog` now accepts optional `open?: boolean` and `onOpenChange?: (open: boolean) => void` props. When absent, falls back to internal `useState(false)` (backward compatible).

- [ ] **Step 1: Modify `dialog.tsx`**

Current file content (replace in full):

```tsx
"use client";

import { AlignLeftIcon, PencilIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";

import { EditPromptForm } from "./form";

type EditPromptDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditPromptDialog({
  open: controlledOpen,
  onOpenChange,
}: EditPromptDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;

  function setIsOpen(value: boolean) {
    onOpenChange?.(value);
    setOpen(value);
  }

  function handleSubmit() {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PencilIcon className="size-4" />
          Edit prompt
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <AlignLeftIcon className="size-4" />
          </div>
          <div>
            <DialogTitle>AI tagging prompt</DialogTitle>
            <DialogDescription>
              Instructions the model follows when classifying every quote.
            </DialogDescription>
          </div>
        </DialogHeader>
        {isOpen && <EditPromptForm onSubmit={handleSubmit} />}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Run existing EditPromptDialog tests to confirm backward compatibility**

```bash
cd apps/admin-portal && npx vitest run src/features/quotes/components/edit-prompt-dialog/dialog.test.tsx
```

Expected: `6 passed`.

- [ ] **Step 3: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/dialog.tsx
git commit -m "refactor(edit-prompt-dialog): add optional controlled open state"
```

---

### Task 2: Create add-quote-schema and tests

**Files:**

- Create: `apps/admin-portal/src/features/quotes/components/add-quote-dialog/schema.ts`
- Create: `apps/admin-portal/src/features/quotes/components/add-quote-dialog/schema.test.ts`

**Interfaces:**

- Consumes: `z` from `zod`.
- Produces: `addQuoteSchema`, `AddQuoteFormValues`, `defaultValues`.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/add-quote-dialog/schema.test.ts`:

```tsx
import { describe, expect, it } from "vitest";

import { addQuoteSchema, defaultValues } from "./schema";

describe("addQuoteSchema", () => {
  it("accepts the default values", () => {
    expect(addQuoteSchema.safeParse(defaultValues).success).toBe(true);
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
    const result = addQuoteSchema.safeParse({ ...defaultValues, quote: "" });
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
      ...defaultValues,
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/admin-portal && npx vitest run src/features/quotes/components/add-quote-dialog/schema.test.ts
```

Expected: FAIL — import/module errors because `schema.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `apps/admin-portal/src/features/quotes/components/add-quote-dialog/schema.ts`:

```tsx
import { z } from "zod";

export const addQuoteSchema = z.object({
  quote: z.string().trim().min(1, "Quote is required"),
  author: z.string().trim().optional(),
  source: z.string().trim().optional(),
  language: z.enum(["en", "th", "my"]),
  context: z.string().trim().optional(),
});

export type AddQuoteFormValues = z.infer<typeof addQuoteSchema>;

export const defaultValues: AddQuoteFormValues = {
  quote: "",
  author: "",
  source: "",
  language: "en",
  context: "",
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/admin-portal && npx vitest run src/features/quotes/components/add-quote-dialog/schema.test.ts
```

Expected: `8 passed`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/add-quote-dialog/
git commit -m "feat(add-quote-dialog): add Zod schema with tests"
```

---

### Task 3: Create AddQuoteForm component and tests

**Files:**

- Create: `apps/admin-portal/src/features/quotes/components/add-quote-dialog/form.tsx`
- Create: `apps/admin-portal/src/features/quotes/components/add-quote-dialog/form.test.tsx`

**Interfaces:**

- Consumes: `addQuoteSchema`, `defaultValues`, `AddQuoteFormValues` from `./schema`.
- Consumes: `@repo/ui` components — `Button`, `DialogClose`, `DialogFooter`, `Input`, `Textarea`.
- Consumes: `SparklesIcon` from `lucide-react`.
- Produces: `AddQuoteForm` component with props:
  - `onSubmit: (values: AddQuoteFormValues) => void`
  - `onEditPrompt?: () => void`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/add-quote-dialog/form.test.tsx`:

```tsx
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "@repo/ui/components/ui/dialog";

import { AddQuoteForm } from "./form";
import { defaultValues, type AddQuoteFormValues } from "./schema";

afterEach(cleanup);

function FormWrapper({
  onSubmit = vi.fn(),
  onEditPrompt,
}: {
  onSubmit?: (values: AddQuoteFormValues) => void;
  onEditPrompt?: () => void;
}) {
  return (
    <Dialog open>
      <AddQuoteForm onSubmit={onSubmit} onEditPrompt={onEditPrompt} />
    </Dialog>
  );
}

describe("AddQuoteForm", () => {
  it("renders the quote textarea", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("textbox", { name: /quote/i })).toBeInTheDocument();
  });

  it("renders author and source inputs", () => {
    render(<FormWrapper />);
    expect(
      screen.getByRole("textbox", { name: /author/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /source/i }),
    ).toBeInTheDocument();
  });

  it("renders language buttons", () => {
    render(<FormWrapper />);
    expect(
      screen.getByRole("button", { name: /en english/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /th/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /my/i })).toBeInTheDocument();
  });

  it("renders context textarea and find context button", () => {
    render(<FormWrapper />);
    expect(
      screen.getByRole("textbox", { name: /context/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /find context/i }),
    ).toBeInTheDocument();
  });

  it("shows editing prompt banner when onEditPrompt is provided", () => {
    render(<FormWrapper onEditPrompt={vi.fn()} />);
    expect(
      screen.getByText(/tagged automatically with claude sonnet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit prompt/i }),
    ).toBeInTheDocument();
  });

  it("hides editing prompt banner when onEditPrompt is absent", () => {
    render(<FormWrapper />);
    expect(screen.queryByText(/tagged automatically/i)).not.toBeInTheDocument();
  });

  it("defaults language to English", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "Quote text.",
    );
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ language: "en" }),
    );
  });

  it("submits with the selected language", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "A great quote.",
    );
    await user.click(screen.getByRole("button", { name: /th/i }));
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ language: "th" }),
    );
  });

  it("calls onSubmit with valid data", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "A great quote.",
    );
    await user.type(
      screen.getByRole("textbox", { name: /author/i }),
      "Test Author",
    );
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        quote: "A great quote.",
        author: "Test Author",
        language: "en",
      }),
    );
  });

  it("shows error and does not call onSubmit when quote is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.clear(screen.getByRole("textbox", { name: /quote/i }));
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => {
      expect(screen.getByText("Quote is required")).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("calls onEditPrompt when edit prompt button is clicked", async () => {
    const user = userEvent.setup();
    const handleEditPrompt = vi.fn();
    render(<FormWrapper onEditPrompt={handleEditPrompt} />);

    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    expect(handleEditPrompt).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/admin-portal && npx vitest run src/features/quotes/components/add-quote-dialog/form.test.tsx
```

Expected: FAIL — `AddQuoteForm is not defined` / import errors.

- [ ] **Step 3: Write minimal implementation**

Create `apps/admin-portal/src/features/quotes/components/add-quote-dialog/form.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SparklesIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@repo/ui/components/ui/button";
import { DialogClose, DialogFooter } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";

import {
  addQuoteSchema,
  defaultValues,
  type AddQuoteFormValues,
} from "./schema";

const LANGUAGES = [
  { value: "en" as const, code: "EN", name: "English" },
  { value: "th" as const, code: "TH", name: "ไทย" },
  { value: "my" as const, code: "MY", name: "မြန်မာ" },
];

type AddQuoteFormProps = {
  onSubmit: (values: AddQuoteFormValues) => void;
  onEditPrompt?: () => void;
};

export function AddQuoteForm({ onSubmit, onEditPrompt }: AddQuoteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddQuoteFormValues>({
    resolver: zodResolver(addQuoteSchema),
    defaultValues,
  });

  const selectedLanguage = watch("language");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {/* QUOTE */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quote
          </p>
          <Textarea
            {...register("quote")}
            aria-label="Quote"
            placeholder="Paste or type the quote…"
            className="min-h-[100px] resize-none"
          />
          {errors.quote && (
            <p className="text-xs text-destructive">{errors.quote.message}</p>
          )}
        </div>

        {/* AUTHOR / SOURCE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Author
            </p>
            <Input
              {...register("author")}
              aria-label="Author"
              placeholder="e.g. Marcus Aurelius"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Source
            </p>
            <Input
              {...register("source")}
              aria-label="Source"
              placeholder="e.g. Meditations"
            />
          </div>
        </div>

        {/* LANGUAGE */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Language
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.value;
              return (
                <Button
                  key={lang.value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() =>
                    setValue("language", lang.value, { shouldValidate: true })
                  }
                >
                  <span className="font-bold">{lang.code}</span> {lang.name}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-detected from the text — adjust if needed.
          </p>
        </div>

        {/* CONTEXT */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Context
              </p>
              <p className="text-xs text-muted-foreground">
                Crawled background that sharpens the AI tags.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Find context
            </Button>
          </div>
          <Textarea
            {...register("context")}
            aria-label="Context"
            placeholder="Click 'Find context' to crawl the web, or write your own…"
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* AI Tagging Banner */}
        {onEditPrompt && (
          <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-3">
            <SparklesIcon className="size-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">
              Tagged automatically with Claude Sonnet 4.5 using your saved
              prompt.
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0"
              onClick={onEditPrompt}
            >
              Edit prompt
            </Button>
          </div>
        )}
      </div>

      <DialogFooter className="flex-row justify-between items-center">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Classify with AI</Button>
      </DialogFooter>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/admin-portal && npx vitest run src/features/quotes/components/add-quote-dialog/form.test.tsx
```

Expected: `11 passed`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/add-quote-dialog/
git commit -m "feat(add-quote-dialog): add AddQuoteForm with fields and tests"
```

---

### Task 4: Create AddQuoteDialog shell and tests

**Files:**

- Create: `apps/admin-portal/src/features/quotes/components/add-quote-dialog/dialog.tsx`
- Create: `apps/admin-portal/src/features/quotes/components/add-quote-dialog/index.ts`
- Create: `apps/admin-portal/src/features/quotes/components/add-quote-dialog/dialog.test.tsx`

**Interfaces:**

- Consumes: `AddQuoteForm` from `./form`, `AddQuoteFormValues` from `./schema`.
- Consumes: `@repo/ui` components — `Button`, `Dialog`, `DialogContent`, `DialogDescription`, `DialogHeader`, `DialogTitle`, `DialogTrigger`.
- Consumes: `PlusIcon` from `lucide-react`.
- Produces: `AddQuoteDialog` component with props:
  - `onSubmit: (values: AddQuoteFormValues) => void`
  - `onEditPrompt?: () => void`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/add-quote-dialog/dialog.test.tsx`:

```tsx
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddQuoteDialog } from "./dialog";
import { defaultValues } from "./schema";

afterEach(cleanup);

describe("AddQuoteDialog", () => {
  it("renders the trigger button", () => {
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /add quote/i }),
    ).toBeInTheDocument();
  });

  it("dialog is closed by default", () => {
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clicking the trigger opens the dialog", async () => {
    const user = userEvent.setup();
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /add quote/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add a quote")).toBeInTheDocument();
  });

  it("cancel closes the dialog", async () => {
    const user = userEvent.setup();
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /add quote/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("submitting closes the dialog", async () => {
    const user = userEvent.setup();
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /add quote/i }));
    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "Test quote",
    );
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("re-opening the dialog resets the form to defaults", async () => {
    const user = userEvent.setup();
    render(<AddQuoteDialog onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add quote/i }));
    const quoteTextarea = screen.getByRole("textbox", { name: /quote/i });
    await user.clear(quoteTextarea);
    await user.type(quoteTextarea, "custom quote text");

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /add quote/i }));
    expect(screen.getByRole("textbox", { name: /quote/i })).toHaveValue(
      defaultValues.quote,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/admin-portal && npx vitest run src/features/quotes/components/add-quote-dialog/dialog.test.tsx
```

Expected: FAIL — `AddQuoteDialog is not defined` / import errors.

- [ ] **Step 3: Write minimal implementation**

Create `apps/admin-portal/src/features/quotes/components/add-quote-dialog/dialog.tsx`:

```tsx
"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";

import { AddQuoteForm } from "./form";
import { type AddQuoteFormValues } from "./schema";

type AddQuoteDialogProps = {
  onSubmit: (values: AddQuoteFormValues) => void;
  onEditPrompt?: () => void;
};

export function AddQuoteDialog({
  onSubmit,
  onEditPrompt,
}: AddQuoteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: AddQuoteFormValues) => {
    onSubmit(values);
    setOpen(false);
  };

  const handleEditPrompt = () => {
    onEditPrompt?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusIcon className="size-4" />
          Add quote
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PlusIcon className="size-4" />
          </div>
          <div>
            <DialogTitle>Add a quote</DialogTitle>
            <DialogDescription>
              Enter the quote — AI assigns the attributes for you.
            </DialogDescription>
          </div>
        </DialogHeader>
        {open && (
          <AddQuoteForm
            onSubmit={handleSubmit}
            onEditPrompt={onEditPrompt ? handleEditPrompt : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Create barrel export**

Create `apps/admin-portal/src/features/quotes/components/add-quote-dialog/index.ts`:

```tsx
export { AddQuoteDialog } from "./dialog";
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd apps/admin-portal && npx vitest run src/features/quotes/components/add-quote-dialog/dialog.test.tsx
```

Expected: `6 passed`.

- [ ] **Step 6: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/add-quote-dialog/
git commit -m "feat(add-quote-dialog): add dialog shell with tests and barrel export"
```

---

### Task 5: Wire into quotes page

**Files:**

- Modify: `apps/admin-portal/src/app/(app)/quotes/page.tsx`

**Interfaces:**

- Consumes: `AddQuoteDialog` from `@/features/quotes/components/add-quote-dialog`.
- Consumes: `EditPromptDialog` (now optionally controlled) from `@/features/quotes/components/edit-prompt-dialog`.
- Produces: quotes page renders both dialogs with coordinated open state.

- [ ] **Step 1: Make page a client component and wire dialogs**

Current file content (replace in full):

```tsx
"use client";

import { useState } from "react";

import { AddQuoteDialog } from "@/features/quotes/components/add-quote-dialog";
import { EditPromptDialog } from "@/features/quotes/components/edit-prompt-dialog";
import { DimensionChips } from "@/features/quotes/components/ui/dimension-chips";
import type { QuoteAttributes } from "@/features/quotes/types";

const SAMPLE_ATTRIBUTES: QuoteAttributes = {
  mindset: "Growth",
  worldview: "Stoic",
  motivation: "Intrinsic",
  tone: ["Energizing", "Resolute"],
  theme: "Resilience",
  timeframe: "Present",
  agency: "Self",
};

export default function Page() {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="">
      <div className="mb-8 flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Quotes</h1>
          <p className="text-sm text-gray-500 max-w-lg">
            Every quote is auto-classified by AI across seven psychological
            dimensions. Review the tags, refine them, or regenerate.
          </p>
        </div>

        <div className="flex items-center gap-3.5">
          <EditPromptDialog open={editOpen} onOpenChange={setEditOpen} />
          <AddQuoteDialog
            onSubmit={(_values) => {
              // no-op: frontend-only
            }}
            onEditPrompt={() => setEditOpen(true)}
          />
        </div>
      </div>

      <DimensionChips attributes={SAMPLE_ATTRIBUTES} />
    </div>
  );
}
```

- [ ] **Step 2: Run all admin-portal tests**

```bash
cd apps/admin-portal && npx vitest run
```

Expected: All existing tests pass; new add-quote-dialog tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/admin-portal/src/app/(app)/quotes/page.tsx
git commit -m "feat(quotes): wire AddQuoteDialog into quotes page"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run linter**

```bash
pnpm run lint
```

Expected: `0` warnings and `0` errors.

- [ ] **Step 2: Run type checker**

```bash
pnpm check-types
```

Expected: No type errors across all apps and packages.

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit any fixes**

If any fixes were needed after lint/type/test:

```bash
git add -A
git commit -m "chore: fix lint/type issues for add-quote-dialog"
```

---

## Self-Review Checklist

**1. Spec coverage:**

- Frontend-only dialog shell with self-contained state → Task 4 ✅
- Quote, Author, Source, Language, Context fields → Task 3 ✅
- Language pill buttons (EN/TH/MY) → Task 3 ✅
- "Find context" presentational button → Task 3 ✅
- AI tagging banner with "Edit prompt" link → Task 3 ✅
- Dialog header with icon, title, subtitle → Task 4 ✅
- Sticky footer with Cancel + Classify with AI → Task 3 ✅
- RHF + Zod validation, only quote required → Tasks 2 + 3 ✅
- Conditional form mount for reset on re-open → Task 4 ✅
- onSubmit callback prop → Tasks 3 + 4 ✅
- onEditPrompt callback linking to EditPromptDialog → Tasks 1 + 3 + 4 + 5 ✅
- EditPromptDialog backward-compatible refactor → Task 1 ✅
- Page integration replacing existing "Add quote" button → Task 5 ✅
- Tests for schema, form, dialog → Tasks 2 + 3 + 4 ✅
- Pre-PR lint/check-types/test → Task 6 ✅

**2. Placeholder scan:** No TBD/TODO/"implement later"/"fill in details". All steps contain complete code and exact commands. ✅

**3. Type consistency:**

- `AddQuoteFormValues` used consistently across schema, form, and dialog. ✅
- `onSubmit` signature matches in form props (`(values: AddQuoteFormValues) => void`) and dialog props. ✅
- `onEditPrompt` optional in form and dialog. ✅
- `defaultValues` exported from schema and consumed by form. ✅
- `EditPromptDialog` optional props match standard controlled/uncontrolled pattern. ✅

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-20-add-quote-dialog.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

**Which approach do you prefer?**
