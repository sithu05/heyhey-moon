# Edit Prompt Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Edit Prompt dialog on the Quotes page — a wide two-column modal where users edit the AI tagging prompt and select a classification model, using react-hook-form + Zod, with full test coverage.

**Architecture:** A slice folder `features/quotes/components/edit-prompt-dialog/` holds the schema, a pure form component (`form.tsx`), and a thin dialog shell (`dialog.tsx`). The dialog owns `open` state and the `useForm` instance; the form receives them as props, making it independently testable without any dialog context. Shared dimension allowed-values live in a new `features/quotes/constants.ts`.

**Tech Stack:** Next.js 16 App Router, react-hook-form v7, Zod v4, @hookform/resolvers, @repo/ui (Dialog, RadioGroup, Textarea, Button, Badge), Tailwind v4, Vitest + @testing-library/react + @testing-library/user-event + @testing-library/jest-dom

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/admin-portal/src/test-setup.ts` | **Create** | Import jest-dom matchers globally for all tests |
| `apps/admin-portal/vitest.config.ts` | **Edit** | Add `setupFiles` pointing to test-setup.ts |
| `apps/admin-portal/src/features/quotes/constants.ts` | **Create** | `DIMENSION_VALUES` — allowed tag values per dimension |
| `features/quotes/components/edit-prompt-dialog/schema.ts` | **Create** | Zod schema, `MODELS`, `EditPromptFormValues`, `DEFAULT_PROMPT`, `defaultValues` |
| `features/quotes/components/edit-prompt-dialog/schema.test.ts` | **Create** | 6 schema unit tests |
| `features/quotes/components/edit-prompt-dialog/form.tsx` | **Create** | `EditPromptForm` — two-column form UI, no dialog dependency |
| `features/quotes/components/edit-prompt-dialog/form.test.tsx` | **Create** | 8 form component tests |
| `features/quotes/components/edit-prompt-dialog/dialog.tsx` | **Create** | `EditPromptDialog` — dialog shell + `DialogTrigger` |
| `features/quotes/components/edit-prompt-dialog/dialog.test.tsx` | **Create** | 6 dialog open/close tests |
| `features/quotes/components/edit-prompt-dialog/index.ts` | **Create** | Re-export `EditPromptDialog` |
| `apps/admin-portal/src/app/(app)/quotes/page.tsx` | **Edit** | Swap bare Button for `<EditPromptDialog />` |

All paths below are relative to `apps/admin-portal/src/` unless noted as `apps/admin-portal/`.

---

## Task 1: Install packages and configure test setup

**Files:**
- Create: `apps/admin-portal/src/test-setup.ts`
- Edit: `apps/admin-portal/vitest.config.ts`

- [ ] **Step 1: Install runtime packages**

```bash
pnpm --filter admin-portal add react-hook-form zod @hookform/resolvers
```

Expected output: packages added to `apps/admin-portal/package.json` dependencies.

- [ ] **Step 2: Install test-only packages**

```bash
pnpm --filter admin-portal add -D @testing-library/user-event @testing-library/jest-dom
```

Expected output: packages added to `apps/admin-portal/package.json` devDependencies.

- [ ] **Step 3: Create the test setup file**

Create `apps/admin-portal/src/test-setup.ts`:

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Wire the setup file into the vitest config**

Edit `apps/admin-portal/vitest.config.ts` (currently `export default uiConfig`):

```ts
import { mergeConfig } from "vitest/config";
import { uiConfig } from "@repo/vitest-config/ui";

export default mergeConfig(uiConfig, {
  test: {
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

- [ ] **Step 5: Verify existing tests still pass**

```bash
pnpm --filter admin-portal test
```

Expected: all existing tests pass (the `dimension-chips` test must still be green).

- [ ] **Step 6: Commit**

```bash
git add apps/admin-portal/package.json apps/admin-portal/src/test-setup.ts apps/admin-portal/vitest.config.ts pnpm-lock.yaml
git commit -m "chore(admin-portal): add react-hook-form, zod, and jest-dom test setup"
```

---

## Task 2: Shared dimension constants

**Files:**
- Create: `features/quotes/constants.ts`

- [ ] **Step 1: Create the constants file**

Create `apps/admin-portal/src/features/quotes/constants.ts`:

```ts
import type { DimensionKey } from "./types";

export const DIMENSION_VALUES: Record<DimensionKey, string[]> = {
  mindset: ["Growth", "Fixed"],
  worldview: ["Stoic", "Optimistic", "Realist"],
  motivation: ["Intrinsic", "Extrinsic"],
  tone: ["Energizing", "Calming", "Reflective", "Urgent", "Tender", "Resolute", "Empowering"],
  theme: [
    "Resilience",
    "Discipline",
    "Gratitude",
    "Courage",
    "Focus",
    "Perseverance",
    "Perspective",
    "Contentment",
    "Self-belief",
    "Agency",
  ],
  timeframe: ["Present", "Future", "Past"],
  agency: ["Self", "Collective"],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin-portal/src/features/quotes/constants.ts
git commit -m "feat(quotes): add DIMENSION_VALUES constants"
```

---

## Task 3: Zod schema (TDD)

**Files:**
- Create: `features/quotes/components/edit-prompt-dialog/schema.ts`
- Create: `features/quotes/components/edit-prompt-dialog/schema.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/schema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run — verify it fails with "Cannot find module"**

```bash
pnpm --filter admin-portal exec vitest run src/features/quotes/components/edit-prompt-dialog/schema.test.ts --reporter=verbose
```

Expected: `Error: Cannot find module './schema'`

- [ ] **Step 3: Implement the schema**

Create `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/schema.ts`:

```ts
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
```

- [ ] **Step 4: Run — verify all 9 tests pass**

```bash
pnpm --filter admin-portal exec vitest run src/features/quotes/components/edit-prompt-dialog/schema.test.ts --reporter=verbose
```

Expected: `9 passed`  (`it.each` over 4 models = 4 extra cases)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/
git commit -m "feat(edit-prompt-dialog): add Zod schema with tests"
```

---

## Task 4: Form component (TDD)

**Files:**
- Create: `features/quotes/components/edit-prompt-dialog/form.tsx`
- Create: `features/quotes/components/edit-prompt-dialog/form.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/form.test.tsx`:

```tsx
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@repo/ui/components/ui/dialog";
import { EditPromptForm } from "./form";
import { defaultValues, editPromptSchema, type EditPromptFormValues } from "./schema";
import { DIMENSION_ORDER, DIMENSIONS } from "../../types";

afterEach(cleanup);

// DialogClose inside EditPromptForm needs a Dialog context to not throw.
// We wrap with <Dialog open> (no DialogContent) — provides context, renders no overlay.
function FormWrapper({
  onSubmit = vi.fn(),
  onReset = vi.fn(),
}: {
  onSubmit?: (values: EditPromptFormValues) => void;
  onReset?: () => void;
}) {
  const form = useForm<EditPromptFormValues>({
    resolver: zodResolver(editPromptSchema),
    defaultValues,
  });
  return (
    <Dialog open>
      <EditPromptForm form={form} onSubmit={onSubmit} onReset={onReset} />
    </Dialog>
  );
}

describe("EditPromptForm", () => {
  it("renders the prompt textarea", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("textbox", { name: /prompt/i })).toBeInTheDocument();
  });

  it("textarea shows the default prompt text", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("textbox", { name: /prompt/i })).toHaveValue(defaultValues.prompt);
  });

  it("Claude Sonnet 4.5 radio is selected by default", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("radio", { name: /claude sonnet 4\.5/i })).toBeChecked();
  });

  it("clicking a different model selects it", async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);
    await user.click(screen.getByRole("radio", { name: /gpt-4o/i }));
    expect(screen.getByRole("radio", { name: /gpt-4o/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /claude sonnet 4\.5/i })).not.toBeChecked();
  });

  it("calls onSubmit with form values on valid submit", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("button", { name: /save prompt/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ model: "claude-sonnet-4-5" }),
      );
    });
  });

  it("shows error and does not call onSubmit when prompt is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);
    await user.clear(screen.getByRole("textbox", { name: /prompt/i }));
    await user.click(screen.getByRole("button", { name: /save prompt/i }));
    await waitFor(() => {
      expect(screen.getByText("Prompt cannot be empty")).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("calls onReset when reset button is clicked", async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();
    render(<FormWrapper onReset={handleReset} />);
    await user.click(screen.getByRole("button", { name: /reset to default/i }));
    expect(handleReset).toHaveBeenCalledOnce();
  });

  it("renders all 7 dimension section labels", () => {
    render(<FormWrapper />);
    for (const key of DIMENSION_ORDER) {
      expect(screen.getByText(DIMENSIONS[key].label)).toBeInTheDocument();
    }
  });

  it("renders dimension chip values", () => {
    render(<FormWrapper />);
    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Stoic")).toBeInTheDocument();
    expect(screen.getByText("Energizing")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — verify it fails with "Cannot find module"**

```bash
pnpm --filter admin-portal exec vitest run src/features/quotes/components/edit-prompt-dialog/form.test.tsx --reporter=verbose
```

Expected: `Error: Cannot find module './form'`

- [ ] **Step 3: Implement the form component**

Create `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/form.tsx`:

```tsx
"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { DialogClose } from "@repo/ui/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { cn } from "@repo/ui/lib/utils";
import { Controller, type UseFormReturn } from "react-hook-form";
import { DIMENSION_VALUES } from "../../constants";
import { DIMENSION_ORDER, DIMENSIONS } from "../../types";
import { MODELS, type EditPromptFormValues } from "./schema";

const MODEL_META: Record<
  (typeof MODELS)[number],
  { name: string; badge: { label: string; className: string } | null; provider: string; description: string }
> = {
  "claude-sonnet-4-5": {
    name: "Claude Sonnet 4.5",
    badge: { label: "RECOMMENDED", className: "bg-green-100 text-green-700" },
    provider: "Anthropic",
    description: "Balanced quality and speed for nuanced, multi-dimension tagging.",
  },
  "claude-haiku-4-5": {
    name: "Claude Haiku 4.5",
    badge: { label: "FAST", className: "bg-gray-100 text-gray-600" },
    provider: "Anthropic",
    description: "Fastest and lowest cost — ideal for large import batches.",
  },
  "gpt-4o": {
    name: "GPT-4o",
    badge: null,
    provider: "OpenAI",
    description: "Strong general reasoning across varied phrasing.",
  },
  "gemini-2-5-pro": {
    name: "Gemini 2.5 Pro",
    badge: null,
    provider: "Google",
    description: "Long-context and robust multilingual handling.",
  },
};

type EditPromptFormProps = {
  form: UseFormReturn<EditPromptFormValues>;
  onSubmit: (values: EditPromptFormValues) => void;
  onReset: () => void;
};

export function EditPromptForm({ form, onSubmit, onReset }: EditPromptFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-6">
        {/* Left: prompt textarea */}
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prompt
            </p>
            <p className="text-xs text-muted-foreground">
              Define how the model reads, weighs and tags each quote.
            </p>
          </div>
          <Textarea
            {...register("prompt")}
            aria-label="Prompt"
            className="min-h-[300px] flex-1 resize-none font-mono text-sm"
          />
          {errors.prompt && (
            <p className="text-xs text-destructive">{errors.prompt.message}</p>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border" />

        {/* Right panel */}
        <div className="flex w-72 flex-col gap-6 overflow-y-auto">
          {/* Model picker */}
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Model
              </p>
              <p className="text-xs text-muted-foreground">
                Which model runs the classification.
              </p>
            </div>
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="gap-2"
                >
                  {MODELS.map((modelId) => {
                    const meta = MODEL_META[modelId];
                    const isSelected = field.value === modelId;
                    return (
                      <label
                        key={modelId}
                        htmlFor={`model-${modelId}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                          isSelected
                            ? "border-primary ring-1 ring-primary"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <RadioGroupItem
                          id={`model-${modelId}`}
                          value={modelId}
                          aria-label={meta.name}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{meta.name}</span>
                            {meta.badge && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                  meta.badge.className,
                                )}
                              >
                                {meta.badge.label}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{meta.provider}</span>
                          <span className="text-xs text-muted-foreground">{meta.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              )}
            />
          </div>

          {/* Extraction dimensions (read-only) */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Extraction Dimensions
              </p>
              <p className="text-xs text-muted-foreground">
                One tag per dimension — Tone allows up to three.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {DIMENSION_ORDER.map((key) => {
                const dim = DIMENSIONS[key];
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-full", dim.dotClassName)} />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {dim.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {DIMENSION_VALUES[key].map((val) => (
                        <Badge
                          key={val}
                          variant="outline"
                          className={cn("border-transparent text-xs", dim.chipClassName)}
                        >
                          {val}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="-mx-4 -mb-4 mt-4 flex items-center justify-between rounded-b-xl border-t bg-muted/50 px-4 py-3">
        <Button type="button" variant="ghost" className="text-primary" onClick={onReset}>
          Reset to default
        </Button>
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Save prompt</Button>
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Run — verify all 8 tests pass**

```bash
pnpm --filter admin-portal exec vitest run src/features/quotes/components/edit-prompt-dialog/form.test.tsx --reporter=verbose
```

Expected: `8 passed`

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/
git commit -m "feat(edit-prompt-dialog): add EditPromptForm with tests"
```

---

## Task 5: Dialog component (TDD)

**Files:**
- Create: `features/quotes/components/edit-prompt-dialog/dialog.tsx`
- Create: `features/quotes/components/edit-prompt-dialog/dialog.test.tsx`
- Create: `features/quotes/components/edit-prompt-dialog/index.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/dialog.test.tsx`:

```tsx
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { EditPromptDialog } from "./dialog";
import { defaultValues } from "./schema";

afterEach(cleanup);

describe("EditPromptDialog", () => {
  it("renders the trigger button", () => {
    render(<EditPromptDialog />);
    expect(screen.getByRole("button", { name: /edit prompt/i })).toBeInTheDocument();
  });

  it("dialog is closed by default", () => {
    render(<EditPromptDialog />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clicking the trigger opens the dialog", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("AI tagging prompt")).toBeInTheDocument();
  });

  it("cancel closes the dialog", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("save prompt closes the dialog", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    await user.click(screen.getByRole("button", { name: /save prompt/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("re-opening the dialog resets the prompt to defaults", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);

    // Open and edit the prompt
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    const textarea = screen.getByRole("textbox", { name: /prompt/i });
    await user.clear(textarea);
    await user.type(textarea, "edited prompt text");

    // Cancel and reopen
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));

    expect(screen.getByRole("textbox", { name: /prompt/i })).toHaveValue(defaultValues.prompt);
  });
});
```

- [ ] **Step 2: Run — verify it fails with "Cannot find module"**

```bash
pnpm --filter admin-portal exec vitest run src/features/quotes/components/edit-prompt-dialog/dialog.test.tsx --reporter=verbose
```

Expected: `Error: Cannot find module './dialog'`

- [ ] **Step 3: Implement the dialog component**

Create `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/dialog.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { AlignLeftIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EditPromptForm } from "./form";
import { defaultValues, editPromptSchema, type EditPromptFormValues } from "./schema";

export function EditPromptDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<EditPromptFormValues>({
    resolver: zodResolver(editPromptSchema),
    defaultValues,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(defaultValues);
  }

  function handleSubmit(_values: EditPromptFormValues) {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <PencilIcon className="size-4" />
          Edit prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
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

- [ ] **Step 4: Create the index re-export**

Create `apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/index.ts`:

```ts
export { EditPromptDialog } from "./dialog";
```

- [ ] **Step 5: Run — verify all 6 dialog tests pass**

```bash
pnpm --filter admin-portal exec vitest run src/features/quotes/components/edit-prompt-dialog/dialog.test.tsx --reporter=verbose
```

Expected: `6 passed`

- [ ] **Step 6: Run the full test suite**

```bash
pnpm --filter admin-portal test
```

Expected: all tests pass (schema: 9, form: 8, dialog: 6, dimension-chips: 2 = 25 total).

- [ ] **Step 7: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/edit-prompt-dialog/
git commit -m "feat(edit-prompt-dialog): add EditPromptDialog with tests"
```

---

## Task 6: Wire into the Quotes page

**Files:**
- Edit: `app/(app)/quotes/page.tsx`

- [ ] **Step 1: Replace the bare button with `EditPromptDialog`**

Edit `apps/admin-portal/src/app/(app)/quotes/page.tsx`:

```tsx
import { DimensionChips } from "@/features/quotes/components/ui/dimension-chips";
import { EditPromptDialog } from "@/features/quotes/components/edit-prompt-dialog";
import type { QuoteAttributes } from "@/features/quotes/types";
import { Button } from "@repo/ui/components/ui/button";
import { PlusIcon } from "lucide-react";

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

        <div className="flex items-center gap-2">
          <EditPromptDialog />
          <Button variant="default" size="lg">
            <PlusIcon className="size-4" />
            Add quote
          </Button>
        </div>
      </div>

      <DimensionChips attributes={SAMPLE_ATTRIBUTES} />
    </div>
  );
}
```

Note: the page file has **no** `"use client"` — `EditPromptDialog` carries its own `"use client"` boundary inside the component tree.

- [ ] **Step 2: Type-check**

```bash
pnpm --filter admin-portal check-types
```

Expected: no errors.

- [ ] **Step 3: Run full test suite one more time**

```bash
pnpm --filter admin-portal test
```

Expected: all 25 tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/admin-portal/src/app/\(app\)/quotes/page.tsx
git commit -m "feat(quotes): wire EditPromptDialog into quotes page"
```
