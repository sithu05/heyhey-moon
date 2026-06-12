# Quotes Admin Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/quotes` admin route in `apps/admin-portal` — a table of quotes with sentiment-attribute tagging, filters, an Add/Edit dialog with a "Generate with AI" simulation, and a "Configure Attributes" sheet for managing the tagging prompt + attribute taxonomy. Frontend only, backed by in-memory mock data.

**Architecture:** Feature-slice under `apps/admin-portal/src/features/quotes/`. Pure logic (taxonomy, prompt-template resolution, mock AI generation, filtering) lives in `lib/` with full TDD using plain vitest. Presentational pieces live in `components/ui/`, container components in `components/`, wired together by a top-level `QuotesPage` client component. Mock data seeds in-memory React state — nothing persists across reloads.

**Tech Stack:** Next.js 16 (App Router), React 19, `@repo/ui` (shadcn/radix components), Tailwind v4, vitest + jsdom + `@testing-library/react`/`jest-dom`/`user-event` (newly added).

---

## Task 1: Testing infrastructure (`@testing-library/react`)

**Files:**
- Modify: `apps/admin-portal/package.json`
- Create: `apps/admin-portal/vitest-setup.ts`
- Modify: `vitest.config.ts` (repo root)

- [ ] **Step 1: Add testing-library devDependencies**

Edit `apps/admin-portal/package.json`, in `devDependencies` add:

```json
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`
Expected: lockfile updates, install succeeds with no errors.

- [ ] **Step 3: Create the vitest setup file**

Create `apps/admin-portal/vitest-setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Wire the setup file into the root vitest config**

In `vitest.config.ts` (repo root), update the `apps` project entry:

```ts
      {
        root: "./apps",
        test: {
          ...sharedConfig.test,
          // Project-specific configuration for apps
          environment: "jsdom",
          setupFiles: ["./admin-portal/vitest-setup.ts"],
        },
      },
```

- [ ] **Step 5: Verify existing tests still run**

Run: `pnpm test`
Expected: the existing `apps/admin-portal/tests/math.test.ts` test still passes, no config errors.

- [ ] **Step 6: Commit**

```bash
git add apps/admin-portal/package.json apps/admin-portal/vitest-setup.ts vitest.config.ts pnpm-lock.yaml
git commit -m "test(admin-portal): add @testing-library/react for component tests"
```

---

## Task 2: Core types, attribute labels, default taxonomy

**Files:**
- Create: `apps/admin-portal/src/features/quotes/types.ts`
- Create: `apps/admin-portal/src/features/quotes/lib/attribute-labels.ts`
- Test: `apps/admin-portal/src/features/quotes/lib/attribute-labels.test.ts`
- Create: `apps/admin-portal/src/features/quotes/data/default-taxonomy.ts`

- [ ] **Step 1: Write the failing test for attribute labels**

Create `apps/admin-portal/src/features/quotes/lib/attribute-labels.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getAttributeLabel } from "./attribute-labels";

describe("getAttributeLabel", () => {
  it("title-cases known locked attribute values", () => {
    expect(getAttributeLabel("growth")).toBe("Growth");
    expect(getAttributeLabel("fixed")).toBe("Fixed");
    expect(getAttributeLabel("stoic")).toBe("Stoic");
    expect(getAttributeLabel("optimistic")).toBe("Optimistic");
    expect(getAttributeLabel("intrinsic")).toBe("Intrinsic");
    expect(getAttributeLabel("extrinsic")).toBe("Extrinsic");
  });

  it("returns open-set values (tone/lifestage) unchanged", () => {
    expect(getAttributeLabel("Calming")).toBe("Calming");
    expect(getAttributeLabel("Feeling Stuck")).toBe("Feeling Stuck");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/attribute-labels.test.ts`
Expected: FAIL — `./attribute-labels` has no exported member `getAttributeLabel` (module not found).

- [ ] **Step 3: Create the shared types**

Create `apps/admin-portal/src/features/quotes/types.ts`:

```ts
export type Mindset = "growth" | "fixed";
export type Worldview = "stoic" | "optimistic";
export type Motivation = "intrinsic" | "extrinsic";

export type AttributeType =
  | "mindset"
  | "worldview"
  | "motivation"
  | "tone"
  | "lifestage";

export type SentimentAttributes = {
  mindset: Mindset;
  worldview: Worldview;
  motivation: Motivation;
  /** One value from `AttributeTaxonomy.tone`. */
  tone: string;
  /** One value from `AttributeTaxonomy.lifestage`. */
  lifestage: string;
};

export type Quote = {
  id: string;
  quote: string;
  author: string;
  category: string;
  sourceUrl: string;
  attributes: SentimentAttributes;
};

export type AttributeTaxonomy = {
  /** Locked pair, not editable via Configure Attributes. */
  mindset: readonly Mindset[];
  /** Locked pair, not editable via Configure Attributes. */
  worldview: readonly Worldview[];
  /** Locked pair, not editable via Configure Attributes. */
  motivation: readonly Motivation[];
  /** Editable list. */
  tone: string[];
  /** Editable list. */
  lifestage: string[];
};

export type PromptOption = {
  id: number;
  title: string;
  /** Template containing `{{xxx_options}}` placeholders for each attribute. */
  content: string;
};
```

- [ ] **Step 4: Implement `getAttributeLabel`**

Create `apps/admin-portal/src/features/quotes/lib/attribute-labels.ts`:

```ts
const LOCKED_VALUE_LABELS: Record<string, string> = {
  growth: "Growth",
  fixed: "Fixed",
  stoic: "Stoic",
  optimistic: "Optimistic",
  intrinsic: "Intrinsic",
  extrinsic: "Extrinsic",
};

/**
 * Display label for a sentiment attribute value. The three locked attributes
 * (mindset/worldview/motivation) store lowercase canonical values that need
 * title-casing; tone/lifestage values are already stored as display strings.
 */
export function getAttributeLabel(value: string): string {
  return LOCKED_VALUE_LABELS[value] ?? value;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/attribute-labels.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Create the default taxonomy**

Create `apps/admin-portal/src/features/quotes/data/default-taxonomy.ts`:

```ts
import type { AttributeTaxonomy } from "../types";

export const defaultTaxonomy: AttributeTaxonomy = {
  mindset: ["growth", "fixed"],
  worldview: ["stoic", "optimistic"],
  motivation: ["intrinsic", "extrinsic"],
  tone: [
    "Calming",
    "Reflective",
    "Energizing",
    "Hopeful",
    "Empowering",
    "Comforting",
    "Playful",
    "Bold",
  ],
  lifestage: [
    "Feeling Stuck",
    "Seeking Clarity",
    "New Beginnings",
    "Navigating Change",
    "Building Habits",
    "Facing Setbacks",
    "Letting Go",
    "Celebrating Growth",
  ],
};
```

- [ ] **Step 7: Commit**

```bash
git add apps/admin-portal/src/features/quotes/types.ts \
        apps/admin-portal/src/features/quotes/lib/attribute-labels.ts \
        apps/admin-portal/src/features/quotes/lib/attribute-labels.test.ts \
        apps/admin-portal/src/features/quotes/data/default-taxonomy.ts
git commit -m "feat(admin-portal): add Quotes domain types, attribute labels, default taxonomy"
```

---

## Task 3: `resolvePromptTemplate` (TDD)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/lib/resolve-prompt-template.ts`
- Test: `apps/admin-portal/src/features/quotes/lib/resolve-prompt-template.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/lib/resolve-prompt-template.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolvePromptTemplate } from "./resolve-prompt-template";
import { defaultTaxonomy } from "../data/default-taxonomy";
import type { AttributeTaxonomy } from "../types";

const TEMPLATE =
  "mindset: {{mindset_options}} | worldview: {{worldview_options}} | " +
  "motivation: {{motivation_options}} | tone: {{tone_options}} | " +
  "lifestage: {{lifestage_options}}";

describe("resolvePromptTemplate", () => {
  it("substitutes all five placeholders with title-cased, comma-separated values", () => {
    const result = resolvePromptTemplate(TEMPLATE, defaultTaxonomy);

    expect(result).toContain("mindset: Growth, Fixed");
    expect(result).toContain("worldview: Stoic, Optimistic");
    expect(result).toContain("motivation: Intrinsic, Extrinsic");
    expect(result).toContain("tone: Calming, Reflective, Energizing");
    expect(result).toContain("lifestage: Feeling Stuck, Seeking Clarity");
  });

  it("reflects edited taxonomy lists", () => {
    const taxonomy: AttributeTaxonomy = {
      ...defaultTaxonomy,
      tone: ["Calming", "Playful With Friends"],
    };

    const result = resolvePromptTemplate(TEMPLATE, taxonomy);

    expect(result).toContain("tone: Calming, Playful With Friends");
  });

  it("leaves text without placeholders unchanged", () => {
    expect(resolvePromptTemplate("no placeholders here", defaultTaxonomy)).toBe(
      "no placeholders here",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/resolve-prompt-template.test.ts`
Expected: FAIL — module `./resolve-prompt-template` not found.

- [ ] **Step 3: Implement `resolvePromptTemplate`**

Create `apps/admin-portal/src/features/quotes/lib/resolve-prompt-template.ts`:

```ts
import { getAttributeLabel } from "./attribute-labels";
import type { AttributeTaxonomy } from "../types";

const PLACEHOLDERS: Record<string, keyof AttributeTaxonomy> = {
  "{{mindset_options}}": "mindset",
  "{{worldview_options}}": "worldview",
  "{{motivation_options}}": "motivation",
  "{{tone_options}}": "tone",
  "{{lifestage_options}}": "lifestage",
};

/**
 * Replaces each `{{xxx_options}}` placeholder in a prompt template with a
 * comma-separated, human-readable list of that attribute's current taxonomy
 * values — so admins can preview exactly what would be sent to an AI model.
 */
export function resolvePromptTemplate(
  template: string,
  taxonomy: AttributeTaxonomy,
): string {
  return Object.entries(PLACEHOLDERS).reduce((result, [placeholder, key]) => {
    const options = taxonomy[key].map(getAttributeLabel).join(", ");
    return result.replaceAll(placeholder, options);
  }, template);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/resolve-prompt-template.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/lib/resolve-prompt-template.ts \
        apps/admin-portal/src/features/quotes/lib/resolve-prompt-template.test.ts
git commit -m "feat(admin-portal): add resolvePromptTemplate for attribute taxonomy preview"
```

---

## Task 4: `generateAttributes` mock AI generator (TDD)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/lib/generate-attributes.ts`
- Test: `apps/admin-portal/src/features/quotes/lib/generate-attributes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/lib/generate-attributes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateAttributes } from "./generate-attributes";
import { defaultTaxonomy } from "../data/default-taxonomy";

describe("generateAttributes", () => {
  it("is deterministic for the same seed", () => {
    const a = generateAttributes("The cave you fear|Joseph Campbell|Courage", defaultTaxonomy);
    const b = generateAttributes("The cave you fear|Joseph Campbell|Courage", defaultTaxonomy);

    expect(a).toEqual(b);
  });

  it("returns values that exist in the given taxonomy", () => {
    const result = generateAttributes("seed-a", defaultTaxonomy);

    expect(defaultTaxonomy.mindset).toContain(result.mindset);
    expect(defaultTaxonomy.worldview).toContain(result.worldview);
    expect(defaultTaxonomy.motivation).toContain(result.motivation);
    expect(defaultTaxonomy.tone).toContain(result.tone);
    expect(defaultTaxonomy.lifestage).toContain(result.lifestage);
  });

  it("can produce different results for different seeds", () => {
    const a = generateAttributes("seed-a", defaultTaxonomy);
    const b = generateAttributes("a completely different seed string", defaultTaxonomy);

    expect(a).not.toEqual(b);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/generate-attributes.test.ts`
Expected: FAIL — module `./generate-attributes` not found.

- [ ] **Step 3: Implement `generateAttributes`**

Create `apps/admin-portal/src/features/quotes/lib/generate-attributes.ts`:

```ts
import type { AttributeTaxonomy, SentimentAttributes } from "../types";

/** Simple deterministic string hash (djb2-like), used to fake an AI response. */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Placeholder for the real AI tagging call: deterministically picks one
 * value per attribute from the current taxonomy based on a hash of `seed`
 * (typically the quote text + author + category). Always overridable by
 * the admin afterward.
 */
export function generateAttributes(
  seed: string,
  taxonomy: AttributeTaxonomy,
): SentimentAttributes {
  const hash = hashString(seed);

  return {
    mindset: taxonomy.mindset[hash % taxonomy.mindset.length],
    worldview: taxonomy.worldview[Math.floor(hash / 7) % taxonomy.worldview.length],
    motivation:
      taxonomy.motivation[Math.floor(hash / 13) % taxonomy.motivation.length],
    tone: taxonomy.tone[Math.floor(hash / 17) % taxonomy.tone.length],
    lifestage:
      taxonomy.lifestage[Math.floor(hash / 23) % taxonomy.lifestage.length],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/generate-attributes.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/lib/generate-attributes.ts \
        apps/admin-portal/src/features/quotes/lib/generate-attributes.test.ts
git commit -m "feat(admin-portal): add deterministic mock AI attribute generator"
```

---

## Task 5: `filterQuotes` / `QuoteFilters` (TDD)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/lib/filter-quotes.ts`
- Test: `apps/admin-portal/src/features/quotes/lib/filter-quotes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/lib/filter-quotes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  emptyFilters,
  filterQuotes,
} from "./filter-quotes";
import type { Quote } from "../types";

const QUOTES: Quote[] = [
  {
    id: "1",
    quote: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell",
    category: "Courage",
    sourceUrl: "https://en.wikiquote.org/wiki/Joseph_Campbell",
    attributes: {
      mindset: "growth",
      worldview: "stoic",
      motivation: "intrinsic",
      tone: "Reflective",
      lifestage: "Feeling Stuck",
    },
  },
  {
    id: "2",
    quote: "You are not your thoughts. You are the awareness behind them.",
    author: "Eckhart Tolle",
    category: "Mindfulness",
    sourceUrl: "https://en.wikiquote.org/wiki/Eckhart_Tolle",
    attributes: {
      mindset: "growth",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Calming",
      lifestage: "Seeking Clarity",
    },
  },
  {
    id: "3",
    quote: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    category: "Resilience",
    sourceUrl: "https://en.wikiquote.org/wiki/Epictetus",
    attributes: {
      mindset: "fixed",
      worldview: "stoic",
      motivation: "extrinsic",
      tone: "Empowering",
      lifestage: "Letting Go",
    },
  },
];

describe("filterQuotes", () => {
  it("returns all quotes when search and filters are empty", () => {
    expect(filterQuotes(QUOTES, "", emptyFilters)).toEqual(QUOTES);
  });

  it("matches search text against quote and author, case-insensitively", () => {
    expect(filterQuotes(QUOTES, "campbell", emptyFilters)).toEqual([QUOTES[0]]);
    expect(filterQuotes(QUOTES, "AWARENESS", emptyFilters)).toEqual([QUOTES[1]]);
    expect(filterQuotes(QUOTES, "no match", emptyFilters)).toEqual([]);
  });

  it("filters by category", () => {
    const result = filterQuotes(QUOTES, "", { ...emptyFilters, categories: ["Resilience"] });
    expect(result).toEqual([QUOTES[2]]);
  });

  it("filters by a locked attribute (mindset)", () => {
    const result = filterQuotes(QUOTES, "", { ...emptyFilters, mindset: ["fixed"] });
    expect(result).toEqual([QUOTES[2]]);
  });

  it("filters by an open attribute (tone) combined with search", () => {
    const result = filterQuotes(QUOTES, "you", {
      ...emptyFilters,
      tone: ["Calming"],
    });
    expect(result).toEqual([QUOTES[1]]);
  });
});

describe("countActiveFilters", () => {
  it("counts zero for empty filters", () => {
    expect(countActiveFilters(emptyFilters)).toBe(0);
  });

  it("sums selections across all filter groups", () => {
    expect(
      countActiveFilters({
        ...emptyFilters,
        categories: ["Courage"],
        mindset: ["growth", "fixed"],
      }),
    ).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/filter-quotes.test.ts`
Expected: FAIL — module `./filter-quotes` not found.

- [ ] **Step 3: Implement `filterQuotes`, `emptyFilters`, `countActiveFilters`**

Create `apps/admin-portal/src/features/quotes/lib/filter-quotes.ts`:

```ts
import type { Quote } from "../types";

export type QuoteFilters = {
  categories: string[];
  mindset: string[];
  worldview: string[];
  motivation: string[];
  tone: string[];
  lifestage: string[];
};

export const emptyFilters: QuoteFilters = {
  categories: [],
  mindset: [],
  worldview: [],
  motivation: [],
  tone: [],
  lifestage: [],
};

/** Text search (quote + author) ANDed with any selected attribute/category filters. */
export function filterQuotes(
  quotes: Quote[],
  search: string,
  filters: QuoteFilters,
): Quote[] {
  const term = search.trim().toLowerCase();

  return quotes.filter((quote) => {
    if (
      term &&
      !quote.quote.toLowerCase().includes(term) &&
      !quote.author.toLowerCase().includes(term)
    ) {
      return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(quote.category)) {
      return false;
    }
    if (filters.mindset.length > 0 && !filters.mindset.includes(quote.attributes.mindset)) {
      return false;
    }
    if (
      filters.worldview.length > 0 &&
      !filters.worldview.includes(quote.attributes.worldview)
    ) {
      return false;
    }
    if (
      filters.motivation.length > 0 &&
      !filters.motivation.includes(quote.attributes.motivation)
    ) {
      return false;
    }
    if (filters.tone.length > 0 && !filters.tone.includes(quote.attributes.tone)) {
      return false;
    }
    if (
      filters.lifestage.length > 0 &&
      !filters.lifestage.includes(quote.attributes.lifestage)
    ) {
      return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: QuoteFilters): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/lib/filter-quotes.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/lib/filter-quotes.ts \
        apps/admin-portal/src/features/quotes/lib/filter-quotes.test.ts
git commit -m "feat(admin-portal): add filterQuotes for search + attribute/category filtering"
```

---

## Task 6: Mock data (`mockQuotes`, `mockPrompts`)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/data/mock-quotes.ts`
- Test: `apps/admin-portal/src/features/quotes/data/mock-quotes.test.ts`
- Create: `apps/admin-portal/src/features/quotes/data/mock-prompts.ts`

- [ ] **Step 1: Write the failing sanity test for mock quotes**

Create `apps/admin-portal/src/features/quotes/data/mock-quotes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mockQuotes } from "./mock-quotes";
import { defaultTaxonomy } from "./default-taxonomy";

describe("mockQuotes", () => {
  it("has at least 10 quotes with unique ids", () => {
    expect(mockQuotes.length).toBeGreaterThanOrEqual(10);
    expect(new Set(mockQuotes.map((quote) => quote.id)).size).toBe(mockQuotes.length);
  });

  it("has non-empty quote/author/category/sourceUrl for every entry", () => {
    for (const quote of mockQuotes) {
      expect(quote.quote.trim()).not.toBe("");
      expect(quote.author.trim()).not.toBe("");
      expect(quote.category.trim()).not.toBe("");
      expect(quote.sourceUrl.trim()).not.toBe("");
    }
  });

  it("only uses attribute values present in the default taxonomy", () => {
    for (const quote of mockQuotes) {
      expect(defaultTaxonomy.mindset).toContain(quote.attributes.mindset);
      expect(defaultTaxonomy.worldview).toContain(quote.attributes.worldview);
      expect(defaultTaxonomy.motivation).toContain(quote.attributes.motivation);
      expect(defaultTaxonomy.tone).toContain(quote.attributes.tone);
      expect(defaultTaxonomy.lifestage).toContain(quote.attributes.lifestage);
    }
  });

  it("includes both mindset values across the seed data (for filter testing)", () => {
    const mindsets = new Set(mockQuotes.map((quote) => quote.attributes.mindset));
    expect(mindsets.has("growth")).toBe(true);
    expect(mindsets.has("fixed")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/data/mock-quotes.test.ts`
Expected: FAIL — module `./mock-quotes` not found.

- [ ] **Step 3: Create the mock quotes**

Create `apps/admin-portal/src/features/quotes/data/mock-quotes.ts`:

```ts
import type { Quote } from "../types";

export const mockQuotes: Quote[] = [
  {
    id: "1",
    quote: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell",
    category: "Courage",
    sourceUrl: "https://en.wikiquote.org/wiki/Joseph_Campbell",
    attributes: {
      mindset: "growth",
      worldview: "stoic",
      motivation: "intrinsic",
      tone: "Reflective",
      lifestage: "Feeling Stuck",
    },
  },
  {
    id: "2",
    quote: "You are not your thoughts. You are the awareness behind them.",
    author: "Eckhart Tolle",
    category: "Mindfulness",
    sourceUrl: "https://en.wikiquote.org/wiki/Eckhart_Tolle",
    attributes: {
      mindset: "growth",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Calming",
      lifestage: "Seeking Clarity",
    },
  },
  {
    id: "3",
    quote: "We suffer more in imagination than in reality.",
    author: "Seneca",
    category: "Resilience",
    sourceUrl: "https://en.wikiquote.org/wiki/Seneca_the_Younger",
    attributes: {
      mindset: "growth",
      worldview: "stoic",
      motivation: "intrinsic",
      tone: "Reflective",
      lifestage: "Facing Setbacks",
    },
  },
  {
    id: "4",
    quote: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
    category: "Discipline",
    sourceUrl: "https://en.wikiquote.org/wiki/Jim_Rohn",
    attributes: {
      mindset: "growth",
      worldview: "optimistic",
      motivation: "extrinsic",
      tone: "Empowering",
      lifestage: "Building Habits",
    },
  },
  {
    id: "5",
    quote:
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "Resilience",
    sourceUrl: "https://en.wikiquote.org/wiki/Marcus_Aurelius",
    attributes: {
      mindset: "growth",
      worldview: "stoic",
      motivation: "intrinsic",
      tone: "Bold",
      lifestage: "Facing Setbacks",
    },
  },
  {
    id: "6",
    quote:
      "When we are no longer able to change a situation, we are challenged to change ourselves.",
    author: "Viktor Frankl",
    category: "Purpose",
    sourceUrl: "https://en.wikiquote.org/wiki/Viktor_Frankl",
    attributes: {
      mindset: "growth",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Hopeful",
      lifestage: "Navigating Change",
    },
  },
  {
    id: "7",
    quote: "The view you adopt for yourself profoundly affects the way you lead your life.",
    author: "Carol Dweck",
    category: "Growth",
    sourceUrl: "https://en.wikiquote.org/wiki/Carol_Dweck",
    attributes: {
      mindset: "growth",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Energizing",
      lifestage: "New Beginnings",
    },
  },
  {
    id: "8",
    quote: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    category: "Resilience",
    sourceUrl: "https://en.wikiquote.org/wiki/Epictetus",
    attributes: {
      mindset: "fixed",
      worldview: "stoic",
      motivation: "extrinsic",
      tone: "Empowering",
      lifestage: "Letting Go",
    },
  },
  {
    id: "9",
    quote:
      "You may not control all the events that happen to you, but you can decide not to be reduced by them.",
    author: "Maya Angelou",
    category: "Purpose",
    sourceUrl: "https://en.wikiquote.org/wiki/Maya_Angelou",
    attributes: {
      mindset: "fixed",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Comforting",
      lifestage: "Celebrating Growth",
    },
  },
  {
    id: "10",
    quote: "Letting go gives us freedom, and freedom is the only condition for happiness.",
    author: "Thich Nhat Hanh",
    category: "Self-Compassion",
    sourceUrl: "https://en.wikiquote.org/wiki/Thich_Nhat_Hanh",
    attributes: {
      mindset: "growth",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Calming",
      lifestage: "Letting Go",
    },
  },
  {
    id: "11",
    quote:
      "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "Courage",
    sourceUrl: "https://en.wikiquote.org/wiki/Ralph_Waldo_Emerson",
    attributes: {
      mindset: "growth",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Empowering",
      lifestage: "New Beginnings",
    },
  },
  {
    id: "12",
    quote: "The wound is the place where the Light enters you.",
    author: "Rumi",
    category: "Resilience",
    sourceUrl: "https://en.wikiquote.org/wiki/Rumi",
    attributes: {
      mindset: "fixed",
      worldview: "optimistic",
      motivation: "intrinsic",
      tone: "Hopeful",
      lifestage: "Facing Setbacks",
    },
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/data/mock-quotes.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Create the mock prompts**

Create `apps/admin-portal/src/features/quotes/data/mock-prompts.ts`:

```ts
import type { PromptOption } from "../types";

/**
 * Mirrors the shape of `GET /prompts?type=ai-system` from the `prompts`
 * resource (apps/api/src/features/prompts). Used by the "Configure
 * Attributes" sheet's tagging-prompt picker.
 */
export const mockPrompts: PromptOption[] = [
  {
    id: 1,
    title: "Quote Sentiment Tagger",
    content: [
      "You are a quote sentiment classifier for a journaling app.",
      "Given a quote, its author, and category, classify it along five axes:",
      "- mindset: one of {{mindset_options}}",
      "- worldview: one of {{worldview_options}}",
      "- motivation: one of {{motivation_options}}",
      "- tone: one of {{tone_options}}",
      "- lifestage: one of {{lifestage_options}}",
      "Return a JSON object with these five keys.",
    ].join("\n"),
  },
  {
    id: 2,
    title: "Quote Sentiment Tagger (Concise)",
    content: [
      "Classify the quote below.",
      "mindset ({{mindset_options}}), worldview ({{worldview_options}}),",
      "motivation ({{motivation_options}}), tone ({{tone_options}}),",
      "lifestage ({{lifestage_options}}).",
    ].join("\n"),
  },
];
```

- [ ] **Step 6: Commit**

```bash
git add apps/admin-portal/src/features/quotes/data/mock-quotes.ts \
        apps/admin-portal/src/features/quotes/data/mock-quotes.test.ts \
        apps/admin-portal/src/features/quotes/data/mock-prompts.ts
git commit -m "feat(admin-portal): add Quotes mock data (quotes + tagging prompts)"
```

---

## Task 7: `AttributeBadge` (presentational)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/ui/attribute-badge.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/ui/attribute-badge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/ui/attribute-badge.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttributeBadge } from "./attribute-badge";

describe("AttributeBadge", () => {
  it("renders the title-cased label for a locked attribute value", () => {
    render(<AttributeBadge type="mindset" value="growth" />);
    expect(screen.getByText("Growth")).toBeInTheDocument();
  });

  it("renders open-set values (tone/lifestage) as-is", () => {
    render(<AttributeBadge type="lifestage" value="Feeling Stuck" />);
    expect(screen.getByText("Feeling Stuck")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/ui/attribute-badge.test.tsx`
Expected: FAIL — module `./attribute-badge` not found.

- [ ] **Step 3: Implement `AttributeBadge`**

Create `apps/admin-portal/src/features/quotes/components/ui/attribute-badge.tsx`:

```tsx
import { Badge } from "@repo/ui/components/ui/badge";
import { cn } from "@repo/ui/lib/utils";

import { getAttributeLabel } from "../../lib/attribute-labels";
import type { AttributeType } from "../../types";

const ATTRIBUTE_STYLES: Record<AttributeType, string> = {
  mindset: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  worldview: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  motivation: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  tone: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  lifestage: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

/** Small colored pill for one sentiment attribute. Color is per attribute type. */
export function AttributeBadge({ type, value }: { type: AttributeType; value: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", ATTRIBUTE_STYLES[type])}>
      {getAttributeLabel(value)}
    </Badge>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/ui/attribute-badge.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/ui/attribute-badge.tsx \
        apps/admin-portal/src/features/quotes/components/ui/attribute-badge.test.tsx
git commit -m "feat(admin-portal): add AttributeBadge component"
```

---

## Task 8: `CategoryBadge` and `SourceLink` (presentational)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/ui/category-badge.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/ui/category-badge.test.tsx`
- Create: `apps/admin-portal/src/features/quotes/components/ui/source-link.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/ui/source-link.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/admin-portal/src/features/quotes/components/ui/category-badge.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBadge } from "./category-badge";

describe("CategoryBadge", () => {
  it("renders the category text", () => {
    render(<CategoryBadge category="Courage" />);
    expect(screen.getByText("Courage")).toBeInTheDocument();
  });
});
```

Create `apps/admin-portal/src/features/quotes/components/ui/source-link.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SourceLink } from "./source-link";

describe("SourceLink", () => {
  it("renders a link to the given url that opens in a new tab", () => {
    render(<SourceLink url="https://en.wikiquote.org/wiki/Joseph_Campbell" />);

    const link = screen.getByRole("link", { name: /open source link/i });
    expect(link).toHaveAttribute("href", "https://en.wikiquote.org/wiki/Joseph_Campbell");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/ui/category-badge.test.tsx src/features/quotes/components/ui/source-link.test.tsx`
Expected: FAIL — `./category-badge` and `./source-link` not found.

- [ ] **Step 3: Implement `CategoryBadge`**

Create `apps/admin-portal/src/features/quotes/components/ui/category-badge.tsx`:

```tsx
import { Badge } from "@repo/ui/components/ui/badge";

/** Pill for a quote's free-form category (e.g. "Courage", "Mindfulness"). */
export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge
      variant="secondary"
      className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200"
    >
      {category}
    </Badge>
  );
}
```

- [ ] **Step 4: Implement `SourceLink`**

Create `apps/admin-portal/src/features/quotes/components/ui/source-link.tsx`:

```tsx
import { ExternalLinkIcon } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";

/** External-link icon button to a quote's resource/license URL. */
export function SourceLink({ url }: { url: string }) {
  return (
    <Button variant="ghost" size="icon-sm" asChild>
      <a href={url} target="_blank" rel="noreferrer" aria-label="Open source link">
        <ExternalLinkIcon />
      </a>
    </Button>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/ui/category-badge.test.tsx src/features/quotes/components/ui/source-link.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/ui/category-badge.tsx \
        apps/admin-portal/src/features/quotes/components/ui/category-badge.test.tsx \
        apps/admin-portal/src/features/quotes/components/ui/source-link.tsx \
        apps/admin-portal/src/features/quotes/components/ui/source-link.test.tsx
git commit -m "feat(admin-portal): add CategoryBadge and SourceLink components"
```

---

## Task 9: `TaxonomyPillList` (presentational, optional add/remove)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/ui/taxonomy-pill-list.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/ui/taxonomy-pill-list.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/ui/taxonomy-pill-list.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaxonomyPillList } from "./taxonomy-pill-list";

describe("TaxonomyPillList", () => {
  it("renders values without remove buttons or an add input when locked", () => {
    render(<TaxonomyPillList values={["Growth", "Fixed"]} />);

    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Fixed")).toBeInTheDocument();
    expect(screen.queryByLabelText(/remove/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Add value")).not.toBeInTheDocument();
  });

  it("calls onRemove when a pill's remove button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    render(
      <TaxonomyPillList values={["Calming", "Reflective"]} onAdd={onAdd} onRemove={onRemove} />,
    );

    await user.click(screen.getByLabelText("Remove Calming"));
    expect(onRemove).toHaveBeenCalledWith("Calming");
  });

  it("calls onAdd with the trimmed value on Enter and clears the input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    render(
      <TaxonomyPillList values={["Calming", "Reflective"]} onAdd={onAdd} onRemove={onRemove} />,
    );

    const input = screen.getByLabelText("Add value");
    await user.type(input, "  Playful  {Enter}");

    expect(onAdd).toHaveBeenCalledWith("Playful");
    expect(input).toHaveValue("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/ui/taxonomy-pill-list.test.tsx`
Expected: FAIL — module `./taxonomy-pill-list` not found.

- [ ] **Step 3: Implement `TaxonomyPillList`**

Create `apps/admin-portal/src/features/quotes/components/ui/taxonomy-pill-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

/**
 * Row of pills for one attribute's taxonomy values. Locked (read-only) when
 * `onAdd`/`onRemove` are omitted; editable (remove buttons + add input) when
 * both are provided.
 */
export function TaxonomyPillList({
  values,
  onAdd,
  onRemove,
}: {
  values: string[];
  onAdd?: (value: string) => void;
  onRemove?: (value: string) => void;
}) {
  const editable = Boolean(onAdd && onRemove);
  const [draft, setDraft] = useState("");

  function handleAdd() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onAdd?.(trimmed);
      setDraft("");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {value}
          {editable && (
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onRemove?.(value)}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          )}
        </span>
      ))}
      {editable && (
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add..."
          aria-label="Add value"
          className="h-6 w-24 rounded-full border border-dashed border-input bg-transparent px-2.5 text-xs outline-none"
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/ui/taxonomy-pill-list.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/ui/taxonomy-pill-list.tsx \
        apps/admin-portal/src/features/quotes/components/ui/taxonomy-pill-list.test.tsx
git commit -m "feat(admin-portal): add TaxonomyPillList component"
```

---

## Task 10: `QuotesTable`

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/quotes-table.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/quotes-table.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/quotes-table.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuotesTable } from "./quotes-table";
import { mockQuotes } from "../data/mock-quotes";

const QUOTES = mockQuotes.slice(0, 2);

describe("QuotesTable", () => {
  it("renders quote text, author, category, attribute badges, and source link for each row", () => {
    render(<QuotesTable quotes={QUOTES} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(QUOTES[0].quote)).toBeInTheDocument();
    expect(screen.getByText(QUOTES[0].author)).toBeInTheDocument();
    expect(screen.getByText(QUOTES[0].category)).toBeInTheDocument();
    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Stoic")).toBeInTheDocument();
    expect(screen.getByText("Intrinsic")).toBeInTheDocument();
    expect(screen.getByText("Reflective")).toBeInTheDocument();
    expect(screen.getByText("Feeling Stuck")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: /open source link/i });
    expect(links[0]).toHaveAttribute("href", QUOTES[0].sourceUrl);
  });

  it("calls onEdit with the row's quote when Edit is chosen", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<QuotesTable quotes={QUOTES} onEdit={onEdit} onDelete={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: `Actions for quote by ${QUOTES[0].author}` }),
    );
    await user.click(await screen.findByText("Edit"));

    expect(onEdit).toHaveBeenCalledWith(QUOTES[0]);
  });

  it("calls onDelete with the row's quote when Delete is chosen", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<QuotesTable quotes={QUOTES} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(
      screen.getByRole("button", { name: `Actions for quote by ${QUOTES[1].author}` }),
    );
    await user.click(await screen.findByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(QUOTES[1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quotes-table.test.tsx`
Expected: FAIL — module `./quotes-table` not found.

- [ ] **Step 3: Implement `QuotesTable`**

Create `apps/admin-portal/src/features/quotes/components/quotes-table.tsx`:

```tsx
"use client";

import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

import { AttributeBadge } from "./ui/attribute-badge";
import { CategoryBadge } from "./ui/category-badge";
import { SourceLink } from "./ui/source-link";
import type { Quote } from "../types";

export function QuotesTable({
  quotes,
  onEdit,
  onDelete,
}: {
  quotes: Quote[];
  onEdit: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quote</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Attributes</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.id}>
            <TableCell className="max-w-sm whitespace-normal">
              <p className="line-clamp-2">{quote.quote}</p>
            </TableCell>
            <TableCell className="font-medium text-primary whitespace-nowrap">
              {quote.author}
            </TableCell>
            <TableCell>
              <CategoryBadge category={quote.category} />
            </TableCell>
            <TableCell className="whitespace-normal">
              <div className="flex flex-wrap gap-1">
                <AttributeBadge type="mindset" value={quote.attributes.mindset} />
                <AttributeBadge type="worldview" value={quote.attributes.worldview} />
                <AttributeBadge type="motivation" value={quote.attributes.motivation} />
                <AttributeBadge type="tone" value={quote.attributes.tone} />
                <AttributeBadge type="lifestage" value={quote.attributes.lifestage} />
              </div>
            </TableCell>
            <TableCell>
              <SourceLink url={quote.sourceUrl} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Actions for quote by ${quote.author}`}>
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(quote)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={() => onDelete(quote)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quotes-table.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/quotes-table.tsx \
        apps/admin-portal/src/features/quotes/components/quotes-table.test.tsx
git commit -m "feat(admin-portal): add QuotesTable component"
```

---

## Task 11: `FiltersPopover`

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/filters-popover.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/filters-popover.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/filters-popover.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltersPopover } from "./filters-popover";
import { defaultTaxonomy } from "../data/default-taxonomy";
import { emptyFilters } from "../lib/filter-quotes";

const CATEGORIES = ["Courage", "Mindfulness"];

describe("FiltersPopover", () => {
  it("shows no active-filter count when no filters are selected", () => {
    render(
      <FiltersPopover
        taxonomy={defaultTaxonomy}
        categories={CATEGORIES}
        filters={emptyFilters}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByText(/^[0-9]+$/)).not.toBeInTheDocument();
  });

  it("shows an active-filter count badge when filters are selected", () => {
    render(
      <FiltersPopover
        taxonomy={defaultTaxonomy}
        categories={CATEGORIES}
        filters={{ ...emptyFilters, mindset: ["growth"] }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("toggles a mindset checkbox by calling onChange with the updated filters", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <FiltersPopover
        taxonomy={defaultTaxonomy}
        categories={CATEGORIES}
        filters={emptyFilters}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /filters/i }));
    await user.click(await screen.findByRole("checkbox", { name: "Growth" }));

    expect(onChange).toHaveBeenCalledWith({ ...emptyFilters, mindset: ["growth"] });
  });

  it("clears all filters when Clear filters is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <FiltersPopover
        taxonomy={defaultTaxonomy}
        categories={CATEGORIES}
        filters={{ ...emptyFilters, mindset: ["growth"], categories: ["Courage"] }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /filters/i }));
    await user.click(await screen.findByRole("button", { name: "Clear filters" }));

    expect(onChange).toHaveBeenCalledWith(emptyFilters);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/filters-popover.test.tsx`
Expected: FAIL — module `./filters-popover` not found.

- [ ] **Step 3: Implement `FiltersPopover`**

Create `apps/admin-portal/src/features/quotes/components/filters-popover.tsx`:

```tsx
"use client";

import { SlidersHorizontalIcon } from "lucide-react";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";

import { getAttributeLabel } from "../lib/attribute-labels";
import { countActiveFilters, emptyFilters, type QuoteFilters } from "../lib/filter-quotes";
import type { AttributeTaxonomy } from "../types";

type FilterOption = { value: string; label: string };

function toOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ value, label: getAttributeLabel(value) }));
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              aria-label={option.label}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FiltersPopover({
  taxonomy,
  categories,
  filters,
  onChange,
}: {
  taxonomy: AttributeTaxonomy;
  categories: string[];
  filters: QuoteFilters;
  onChange: (filters: QuoteFilters) => void;
}) {
  const activeCount = countActiveFilters(filters);

  function toggle(group: keyof QuoteFilters, value: string) {
    const current = filters[group];
    const next = current.includes(value)
      ? current.filter((existing) => existing !== value)
      : [...current, value];
    onChange({ ...filters, [group]: next });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontalIcon />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="px-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-96 w-80 overflow-y-auto">
        <div className="space-y-3">
          <FilterGroup
            label="Category"
            options={categories.map((category) => ({ value: category, label: category }))}
            selected={filters.categories}
            onToggle={(value) => toggle("categories", value)}
          />
          <FilterGroup
            label="Mindset"
            options={toOptions(taxonomy.mindset)}
            selected={filters.mindset}
            onToggle={(value) => toggle("mindset", value)}
          />
          <FilterGroup
            label="Worldview"
            options={toOptions(taxonomy.worldview)}
            selected={filters.worldview}
            onToggle={(value) => toggle("worldview", value)}
          />
          <FilterGroup
            label="Motivation"
            options={toOptions(taxonomy.motivation)}
            selected={filters.motivation}
            onToggle={(value) => toggle("motivation", value)}
          />
          <FilterGroup
            label="Tone"
            options={toOptions(taxonomy.tone)}
            selected={filters.tone}
            onToggle={(value) => toggle("tone", value)}
          />
          <FilterGroup
            label="Lifestage"
            options={toOptions(taxonomy.lifestage)}
            selected={filters.lifestage}
            onToggle={(value) => toggle("lifestage", value)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={activeCount === 0}
            onClick={() => onChange(emptyFilters)}
          >
            Clear filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/filters-popover.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/filters-popover.tsx \
        apps/admin-portal/src/features/quotes/components/filters-popover.test.tsx
git commit -m "feat(admin-portal): add FiltersPopover component"
```

---

## Task 12: `ConfigureAttributesSheet`

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/configure-attributes-sheet.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/configure-attributes-sheet.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/configure-attributes-sheet.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigureAttributesSheet } from "./configure-attributes-sheet";
import { defaultTaxonomy } from "../data/default-taxonomy";
import { mockPrompts } from "../data/mock-prompts";

function renderSheet(overrides: Partial<Parameters<typeof ConfigureAttributesSheet>[0]> = {}) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    taxonomy: defaultTaxonomy,
    onTaxonomyChange: vi.fn(),
    prompts: mockPrompts,
    selectedPromptId: mockPrompts[0].id,
    onSelectedPromptChange: vi.fn(),
    ...overrides,
  };

  render(<ConfigureAttributesSheet {...props} />);
  return props;
}

describe("ConfigureAttributesSheet", () => {
  it("shows the raw prompt template and a resolved preview using the current taxonomy", () => {
    renderSheet();

    expect(screen.getByText("Configure Attributes")).toBeInTheDocument();
    expect(screen.getByTestId("raw-prompt-template").textContent).toContain(
      "{{mindset_options}}",
    );
    expect(screen.getByTestId("resolved-prompt-preview").textContent).toContain(
      "Growth, Fixed",
    );
  });

  it("updates the resolved preview when a tone value is added", async () => {
    const user = userEvent.setup();
    renderSheet();

    const toneInput = screen.getAllByLabelText("Add value")[0];
    await user.type(toneInput, "Playful With Friends{Enter}");

    expect(screen.getByTestId("resolved-prompt-preview").textContent).toContain(
      "Playful With Friends",
    );
  });

  it("calls onTaxonomyChange, onSelectedPromptChange, and closes on Save", async () => {
    const user = userEvent.setup();
    const props = renderSheet();

    const toneInput = screen.getAllByLabelText("Add value")[0];
    await user.type(toneInput, "Playful With Friends{Enter}");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(props.onTaxonomyChange).toHaveBeenCalledTimes(1);
    expect(props.onTaxonomyChange.mock.calls[0][0].tone).toContain("Playful With Friends");
    expect(props.onSelectedPromptChange).toHaveBeenCalledWith(mockPrompts[0].id);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("discards edits and closes on Cancel", async () => {
    const user = userEvent.setup();
    const props = renderSheet();

    const toneInput = screen.getAllByLabelText("Add value")[0];
    await user.type(toneInput, "Playful With Friends{Enter}");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(props.onTaxonomyChange).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/configure-attributes-sheet.test.tsx`
Expected: FAIL — module `./configure-attributes-sheet` not found.

- [ ] **Step 3: Implement `ConfigureAttributesSheet`**

Create `apps/admin-portal/src/features/quotes/components/configure-attributes-sheet.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/ui/sheet";

import { getAttributeLabel } from "../lib/attribute-labels";
import { resolvePromptTemplate } from "../lib/resolve-prompt-template";
import { TaxonomyPillList } from "./ui/taxonomy-pill-list";
import type { AttributeTaxonomy, PromptOption } from "../types";

type EditableAttribute = "tone" | "lifestage";

export function ConfigureAttributesSheet({
  open,
  onOpenChange,
  taxonomy,
  onTaxonomyChange,
  prompts,
  selectedPromptId,
  onSelectedPromptChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxonomy: AttributeTaxonomy;
  onTaxonomyChange: (taxonomy: AttributeTaxonomy) => void;
  prompts: PromptOption[];
  selectedPromptId: number;
  onSelectedPromptChange: (id: number) => void;
}) {
  const [draftTaxonomy, setDraftTaxonomy] = useState(taxonomy);
  const [draftPromptId, setDraftPromptId] = useState(selectedPromptId);

  useEffect(() => {
    if (open) {
      setDraftTaxonomy(taxonomy);
      setDraftPromptId(selectedPromptId);
    }
  }, [open, taxonomy, selectedPromptId]);

  const selectedPrompt = prompts.find((prompt) => prompt.id === draftPromptId) ?? prompts[0];

  function addValue(key: EditableAttribute, value: string) {
    setDraftTaxonomy((prev) => ({ ...prev, [key]: [...prev[key], value] }));
  }

  function removeValue(key: EditableAttribute, value: string) {
    setDraftTaxonomy((prev) => ({
      ...prev,
      [key]: prev[key].filter((existing) => existing !== value),
    }));
  }

  function handleSave() {
    onTaxonomyChange(draftTaxonomy);
    onSelectedPromptChange(draftPromptId);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Attributes</SheetTitle>
          <SheetDescription>
            Controls how sentiment attributes are suggested and which values are allowed.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="tagging-prompt">Tagging prompt</Label>
            <Select
              value={String(draftPromptId)}
              onValueChange={(value) => setDraftPromptId(Number(value))}
            >
              <SelectTrigger id="tagging-prompt" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={String(prompt.id)}>
                    {prompt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Raw template
              </p>
              <pre
                data-testid="raw-prompt-template"
                className="mt-1 max-h-32 overflow-y-auto rounded-md bg-muted p-2 text-xs whitespace-pre-wrap"
              >
                {selectedPrompt?.content}
              </pre>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Resolved preview
              </p>
              <pre
                data-testid="resolved-prompt-preview"
                className="mt-1 max-h-32 overflow-y-auto rounded-md bg-muted p-2 text-xs whitespace-pre-wrap"
              >
                {selectedPrompt
                  ? resolvePromptTemplate(selectedPrompt.content, draftTaxonomy)
                  : ""}
              </pre>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Mindset</p>
              <p className="text-xs text-muted-foreground">Fixed pair</p>
              <TaxonomyPillList values={draftTaxonomy.mindset.map(getAttributeLabel)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Worldview</p>
              <p className="text-xs text-muted-foreground">Fixed pair</p>
              <TaxonomyPillList values={draftTaxonomy.worldview.map(getAttributeLabel)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Motivation</p>
              <p className="text-xs text-muted-foreground">Fixed pair</p>
              <TaxonomyPillList values={draftTaxonomy.motivation.map(getAttributeLabel)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Tone</p>
              <p className="text-xs text-muted-foreground">Editable — add or remove values</p>
              <TaxonomyPillList
                values={draftTaxonomy.tone}
                onAdd={(value) => addValue("tone", value)}
                onRemove={(value) => removeValue("tone", value)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Lifestage</p>
              <p className="text-xs text-muted-foreground">Editable — add or remove values</p>
              <TaxonomyPillList
                values={draftTaxonomy.lifestage}
                onAdd={(value) => addValue("lifestage", value)}
                onRemove={(value) => removeValue("lifestage", value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/configure-attributes-sheet.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/configure-attributes-sheet.tsx \
        apps/admin-portal/src/features/quotes/components/configure-attributes-sheet.test.tsx
git commit -m "feat(admin-portal): add ConfigureAttributesSheet component"
```

---

## Task 13: `QuoteFormDialog`

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/quote-form-dialog.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/quote-form-dialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/quote-form-dialog.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteFormDialog } from "./quote-form-dialog";
import { defaultTaxonomy } from "../data/default-taxonomy";
import { mockQuotes } from "../data/mock-quotes";
import { generateAttributes } from "../lib/generate-attributes";
import { getAttributeLabel } from "../lib/attribute-labels";

const CATEGORIES = ["Courage", "Mindfulness"];

describe("QuoteFormDialog", () => {
  it("shows 'Add Quote' with disabled Generate/Save until required fields are filled", async () => {
    const user = userEvent.setup();

    render(
      <QuoteFormDialog
        open
        onOpenChange={vi.fn()}
        quote={null}
        categories={CATEGORIES}
        taxonomy={defaultTaxonomy}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText("Add Quote")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate with ai/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save Quote" })).toBeDisabled();

    await user.type(screen.getByLabelText("Quote"), "Test quote text");
    await user.type(screen.getByLabelText("Author"), "Test Author");
    await user.type(screen.getByLabelText("Category"), "Courage");

    expect(screen.getByRole("button", { name: /generate with ai/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save Quote" })).toBeEnabled();
  });

  it("prefills fields in 'Edit Quote' mode from the given quote", () => {
    const quote = mockQuotes[0];

    render(
      <QuoteFormDialog
        open
        onOpenChange={vi.fn()}
        quote={quote}
        categories={CATEGORIES}
        taxonomy={defaultTaxonomy}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText("Edit Quote")).toBeInTheDocument();
    expect(screen.getByLabelText("Quote")).toHaveValue(quote.quote);
    expect(screen.getByLabelText("Author")).toHaveValue(quote.author);
    expect(screen.getByLabelText("Category")).toHaveValue(quote.category);
    expect(screen.getByText(getAttributeLabel(quote.attributes.worldview))).toBeInTheDocument();
    expect(screen.getByText(quote.attributes.lifestage)).toBeInTheDocument();
  });

  it("fills attribute selects via Generate with AI", async () => {
    const user = userEvent.setup();

    render(
      <QuoteFormDialog
        open
        onOpenChange={vi.fn()}
        quote={null}
        categories={CATEGORIES}
        taxonomy={defaultTaxonomy}
        onSave={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Quote"), "Test quote text");
    await user.type(screen.getByLabelText("Author"), "Test Author");
    await user.type(screen.getByLabelText("Category"), "Courage");
    await user.click(screen.getByRole("button", { name: /generate with ai/i }));

    const expected = generateAttributes(
      "Test quote text|Test Author|Courage",
      defaultTaxonomy,
    );

    await waitFor(() => {
      expect(screen.getByText(getAttributeLabel(expected.tone))).toBeInTheDocument();
      expect(screen.getByText(getAttributeLabel(expected.lifestage))).toBeInTheDocument();
    });
  });

  it("calls onSave with the form values and closes on Save", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <QuoteFormDialog
        open
        onOpenChange={onOpenChange}
        quote={null}
        categories={CATEGORIES}
        taxonomy={defaultTaxonomy}
        onSave={onSave}
      />,
    );

    await user.type(screen.getByLabelText("Quote"), "Test quote text");
    await user.type(screen.getByLabelText("Author"), "Test Author");
    await user.type(screen.getByLabelText("Category"), "Courage");
    await user.click(screen.getByRole("button", { name: "Save Quote" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0];
    expect(saved.quote).toBe("Test quote text");
    expect(saved.author).toBe("Test Author");
    expect(saved.category).toBe("Courage");
    expect(typeof saved.id).toBe("string");
    expect(saved.id.length).toBeGreaterThan(0);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quote-form-dialog.test.tsx`
Expected: FAIL — module `./quote-form-dialog` not found.

- [ ] **Step 3: Implement `QuoteFormDialog`**

Create `apps/admin-portal/src/features/quotes/components/quote-form-dialog.tsx`:

```tsx
"use client";

import { useEffect, useId, useState } from "react";
import { SparklesIcon } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";

import { generateAttributes } from "../lib/generate-attributes";
import { getAttributeLabel } from "../lib/attribute-labels";
import type { AttributeTaxonomy, Quote, SentimentAttributes } from "../types";

const GENERATE_DELAY_MS = 300;

function defaultAttributes(taxonomy: AttributeTaxonomy): SentimentAttributes {
  return {
    mindset: taxonomy.mindset[0],
    worldview: taxonomy.worldview[0],
    motivation: taxonomy.motivation[0],
    tone: taxonomy.tone[0],
    lifestage: taxonomy.lifestage[0],
  };
}

function AttributeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {getAttributeLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function QuoteFormDialog({
  open,
  onOpenChange,
  quote,
  categories,
  taxonomy,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` for Add mode, an existing quote for Edit mode. */
  quote: Quote | null;
  categories: string[];
  taxonomy: AttributeTaxonomy;
  onSave: (quote: Quote) => void;
}) {
  const categoryListId = useId();
  const [quoteText, setQuoteText] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [attributes, setAttributes] = useState<SentimentAttributes>(() =>
    defaultAttributes(taxonomy),
  );
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (quote) {
      setQuoteText(quote.quote);
      setAuthor(quote.author);
      setCategory(quote.category);
      setSourceUrl(quote.sourceUrl);
      setAttributes(quote.attributes);
    } else {
      setQuoteText("");
      setAuthor("");
      setCategory("");
      setSourceUrl("");
      setAttributes(defaultAttributes(taxonomy));
    }
  }, [open, quote, taxonomy]);

  const requiredFieldsFilled =
    quoteText.trim() !== "" && author.trim() !== "" && category.trim() !== "";

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setAttributes(generateAttributes(`${quoteText}|${author}|${category}`, taxonomy));
      setGenerating(false);
    }, GENERATE_DELAY_MS);
  }

  function handleSave() {
    onSave({
      id: quote?.id ?? crypto.randomUUID(),
      quote: quoteText.trim(),
      author: author.trim(),
      category: category.trim(),
      sourceUrl: sourceUrl.trim(),
      attributes,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{quote ? "Edit Quote" : "Add Quote"}</DialogTitle>
          <DialogDescription>
            Fill in the quote details, then generate or set sentiment attributes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quote-text">Quote</Label>
            <Textarea
              id="quote-text"
              value={quoteText}
              onChange={(event) => setQuoteText(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quote-author">Author</Label>
            <Input
              id="quote-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quote-category">Category</Label>
              <Input
                id="quote-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                list={categoryListId}
              />
              <datalist id={categoryListId}>
                {categories.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote-source">Resource Link</Label>
              <Input
                id="quote-source"
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Sentiment Attributes</p>
              <Button
                type="button"
                size="sm"
                disabled={!requiredFieldsFilled || generating}
                onClick={handleGenerate}
              >
                <SparklesIcon />
                {generating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AttributeSelect
                label="Mindset"
                value={attributes.mindset}
                options={taxonomy.mindset}
                onChange={(value) =>
                  setAttributes((prev) => ({
                    ...prev,
                    mindset: value as SentimentAttributes["mindset"],
                  }))
                }
              />
              <AttributeSelect
                label="Worldview"
                value={attributes.worldview}
                options={taxonomy.worldview}
                onChange={(value) =>
                  setAttributes((prev) => ({
                    ...prev,
                    worldview: value as SentimentAttributes["worldview"],
                  }))
                }
              />
              <AttributeSelect
                label="Motivation"
                value={attributes.motivation}
                options={taxonomy.motivation}
                onChange={(value) =>
                  setAttributes((prev) => ({
                    ...prev,
                    motivation: value as SentimentAttributes["motivation"],
                  }))
                }
              />
              <AttributeSelect
                label="Tone"
                value={attributes.tone}
                options={taxonomy.tone}
                onChange={(value) => setAttributes((prev) => ({ ...prev, tone: value }))}
              />
              <div className="col-span-2">
                <AttributeSelect
                  label="Lifestage"
                  value={attributes.lifestage}
                  options={taxonomy.lifestage}
                  onChange={(value) =>
                    setAttributes((prev) => ({ ...prev, lifestage: value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!requiredFieldsFilled} onClick={handleSave}>
            Save Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quote-form-dialog.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/quote-form-dialog.tsx \
        apps/admin-portal/src/features/quotes/components/quote-form-dialog.test.tsx
git commit -m "feat(admin-portal): add QuoteFormDialog with mock Generate with AI"
```

---

## Task 14: `DeleteQuoteDialog`

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/delete-quote-dialog.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/delete-quote-dialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/delete-quote-dialog.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteQuoteDialog } from "./delete-quote-dialog";

describe("DeleteQuoteDialog", () => {
  it("calls onConfirm when Delete is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<DeleteQuoteDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} />);

    expect(screen.getByText("Delete this quote?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("closes via onOpenChange(false) when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<DeleteQuoteDialog open onOpenChange={onOpenChange} onConfirm={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/delete-quote-dialog.test.tsx`
Expected: FAIL — module `./delete-quote-dialog` not found.

- [ ] **Step 3: Implement `DeleteQuoteDialog`**

Create `apps/admin-portal/src/features/quotes/components/delete-quote-dialog.tsx`:

```tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";

export function DeleteQuoteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
          <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/delete-quote-dialog.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/delete-quote-dialog.tsx \
        apps/admin-portal/src/features/quotes/components/delete-quote-dialog.test.tsx
git commit -m "feat(admin-portal): add DeleteQuoteDialog component"
```

---

## Task 15: `QuotesToolbar`

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/quotes-toolbar.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/quotes-toolbar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/quotes-toolbar.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuotesToolbar } from "./quotes-toolbar";
import { defaultTaxonomy } from "../data/default-taxonomy";
import { emptyFilters } from "../lib/filter-quotes";

function renderToolbar(overrides: Partial<Parameters<typeof QuotesToolbar>[0]> = {}) {
  const props = {
    search: "",
    onSearchChange: vi.fn(),
    taxonomy: defaultTaxonomy,
    categories: ["Courage"],
    filters: emptyFilters,
    onFiltersChange: vi.fn(),
    onConfigureAttributes: vi.fn(),
    onAddQuote: vi.fn(),
    ...overrides,
  };

  render(<QuotesToolbar {...props} />);
  return props;
}

describe("QuotesToolbar", () => {
  it("calls onSearchChange when typing in the search input", () => {
    const props = renderToolbar();

    fireEvent.change(screen.getByLabelText("Search quotes"), {
      target: { value: "campbell" },
    });

    expect(props.onSearchChange).toHaveBeenCalledWith("campbell");
  });

  it("calls onConfigureAttributes and onAddQuote when their buttons are clicked", async () => {
    const user = userEvent.setup();
    const props = renderToolbar();

    await user.click(screen.getByRole("button", { name: "Configure Attributes" }));
    expect(props.onConfigureAttributes).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Add Quote" }));
    expect(props.onAddQuote).toHaveBeenCalledTimes(1);
  });

  it("renders the Filters control", () => {
    renderToolbar();
    expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quotes-toolbar.test.tsx`
Expected: FAIL — module `./quotes-toolbar` not found.

- [ ] **Step 3: Implement `QuotesToolbar`**

Create `apps/admin-portal/src/features/quotes/components/quotes-toolbar.tsx`:

```tsx
"use client";

import { PlusIcon, SearchIcon, Settings2Icon } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";

import { FiltersPopover } from "./filters-popover";
import type { QuoteFilters } from "../lib/filter-quotes";
import type { AttributeTaxonomy } from "../types";

export function QuotesToolbar({
  search,
  onSearchChange,
  taxonomy,
  categories,
  filters,
  onFiltersChange,
  onConfigureAttributes,
  onAddQuote,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  taxonomy: AttributeTaxonomy;
  categories: string[];
  filters: QuoteFilters;
  onFiltersChange: (filters: QuoteFilters) => void;
  onConfigureAttributes: () => void;
  onAddQuote: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative max-w-sm flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search quotes..."
          aria-label="Search quotes"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-8"
        />
      </div>
      <FiltersPopover
        taxonomy={taxonomy}
        categories={categories}
        filters={filters}
        onChange={onFiltersChange}
      />
      <Button variant="outline" size="sm" onClick={onConfigureAttributes}>
        <Settings2Icon />
        Configure Attributes
      </Button>
      <Button size="sm" className="ml-auto" onClick={onAddQuote}>
        <PlusIcon />
        Add Quote
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quotes-toolbar.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/quotes-toolbar.tsx \
        apps/admin-portal/src/features/quotes/components/quotes-toolbar.test.tsx
git commit -m "feat(admin-portal): add QuotesToolbar component"
```

---

## Task 16: `QuotesPage` (state, pagination, empty state)

**Files:**
- Create: `apps/admin-portal/src/features/quotes/components/quotes-page.tsx`
- Test: `apps/admin-portal/src/features/quotes/components/quotes-page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-portal/src/features/quotes/components/quotes-page.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuotesPage } from "./quotes-page";
import { mockQuotes } from "../data/mock-quotes";

describe("QuotesPage", () => {
  it("renders the heading and the first page of quotes", () => {
    render(<QuotesPage />);

    expect(screen.getByRole("heading", { name: "Quotes" })).toBeInTheDocument();
    expect(screen.getByText(mockQuotes[0].quote)).toBeInTheDocument();
    expect(screen.queryByText(mockQuotes[11].quote)).not.toBeInTheDocument();
  });

  it("navigates to page 2 to see the remaining quotes", async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);

    await user.click(screen.getByRole("link", { name: "2" }));

    expect(screen.getByText(mockQuotes[11].quote)).toBeInTheDocument();
    expect(screen.queryByText(mockQuotes[0].quote)).not.toBeInTheDocument();
  });

  it("filters via search and shows an empty state for no matches", async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);

    const search = screen.getByLabelText("Search quotes");
    await user.type(search, "Campbell");

    expect(screen.getByText(mockQuotes[0].quote)).toBeInTheDocument();
    expect(screen.queryByText(mockQuotes[1].quote)).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "no-such-quote");

    expect(screen.getByText("No quotes found")).toBeInTheDocument();
  });

  it("adds a new quote via the Add Quote dialog", async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);

    await user.click(screen.getByRole("button", { name: "Add Quote" }));
    await user.type(screen.getByLabelText("Quote"), "A brand new quote.");
    await user.type(screen.getByLabelText("Author"), "New Author");
    await user.type(screen.getByLabelText("Category"), "Courage");
    await user.click(screen.getByRole("button", { name: "Save Quote" }));

    expect(screen.getByText("A brand new quote.")).toBeInTheDocument();
  });

  it("deletes a quote after confirming", async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);

    await user.click(
      screen.getByRole("button", { name: `Actions for quote by ${mockQuotes[0].author}` }),
    );
    await user.click(await screen.findByText("Delete"));
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(screen.queryByText(mockQuotes[0].quote)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quotes-page.test.tsx`
Expected: FAIL — module `./quotes-page` not found.

- [ ] **Step 3: Implement `QuotesPage`**

Create `apps/admin-portal/src/features/quotes/components/quotes-page.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { QuoteIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/ui/pagination";

import { ConfigureAttributesSheet } from "./configure-attributes-sheet";
import { DeleteQuoteDialog } from "./delete-quote-dialog";
import { QuoteFormDialog } from "./quote-form-dialog";
import { QuotesTable } from "./quotes-table";
import { QuotesToolbar } from "./quotes-toolbar";
import { defaultTaxonomy } from "../data/default-taxonomy";
import { mockPrompts } from "../data/mock-prompts";
import { mockQuotes } from "../data/mock-quotes";
import { emptyFilters, filterQuotes, type QuoteFilters } from "../lib/filter-quotes";
import type { AttributeTaxonomy, Quote } from "../types";

const PAGE_SIZE = 10;

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [taxonomy, setTaxonomy] = useState<AttributeTaxonomy>(defaultTaxonomy);
  const [selectedPromptId, setSelectedPromptId] = useState(mockPrompts[0].id);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<QuoteFilters>(emptyFilters);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(quotes.map((quote) => quote.category))).sort(),
    [quotes],
  );

  const visibleQuotes = useMemo(
    () => filterQuotes(quotes, search, filters),
    [quotes, search, filters],
  );

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const totalPages = Math.max(1, Math.ceil(visibleQuotes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedQuotes = visibleQuotes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleAddQuote() {
    setEditingQuote(null);
    setFormOpen(true);
  }

  function handleEditQuote(quote: Quote) {
    setEditingQuote(quote);
    setFormOpen(true);
  }

  function handleSaveQuote(quote: Quote) {
    setQuotes((prev) => {
      const exists = prev.some((existing) => existing.id === quote.id);
      return exists
        ? prev.map((existing) => (existing.id === quote.id ? quote : existing))
        : [quote, ...prev];
    });
  }

  function handleDeleteConfirm() {
    if (!deletingQuote) return;
    setQuotes((prev) => prev.filter((quote) => quote.id !== deletingQuote.id));
    setDeletingQuote(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quotes</h1>
        <p className="text-sm text-muted-foreground">Manage quotes and their sentiment tags.</p>
      </div>

      <QuotesToolbar
        search={search}
        onSearchChange={setSearch}
        taxonomy={taxonomy}
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
        onConfigureAttributes={() => setConfigOpen(true)}
        onAddQuote={handleAddQuote}
      />

      {visibleQuotes.length > 0 ? (
        <>
          <QuotesTable quotes={pagedQuotes} onEdit={handleEditQuote} onDelete={setDeletingQuote} />
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.max(1, current - 1));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.min(totalPages, current + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <QuoteIcon />
            </EmptyMedia>
            <EmptyTitle>No quotes found</EmptyTitle>
            <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <QuoteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        quote={editingQuote}
        categories={categories}
        taxonomy={taxonomy}
        onSave={handleSaveQuote}
      />

      <ConfigureAttributesSheet
        open={configOpen}
        onOpenChange={setConfigOpen}
        taxonomy={taxonomy}
        onTaxonomyChange={setTaxonomy}
        prompts={mockPrompts}
        selectedPromptId={selectedPromptId}
        onSelectedPromptChange={setSelectedPromptId}
      />

      <DeleteQuoteDialog
        open={deletingQuote !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingQuote(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes/components/quotes-page.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-portal/src/features/quotes/components/quotes-page.tsx \
        apps/admin-portal/src/features/quotes/components/quotes-page.test.tsx
git commit -m "feat(admin-portal): add QuotesPage with pagination and empty state"
```

---

## Task 17: Route, sidebar entry, and final verification

**Files:**
- Create: `apps/admin-portal/src/app/quotes/page.tsx`
- Modify: `apps/admin-portal/src/shared/components/ui/app-sidebar.tsx`

- [ ] **Step 1: Create the route shell**

Create `apps/admin-portal/src/app/quotes/page.tsx`:

```tsx
import { QuotesPage } from "../../features/quotes/components/quotes-page";

export default function Page() {
  return <QuotesPage />;
}
```

- [ ] **Step 2: Add a "Quotes" entry to the sidebar**

`app-sidebar.tsx` hardcodes its menu items (it does not read from `shared/components/ui/nav.ts`, which is currently unused), so the new route needs its own `SidebarMenuItem` here to be reachable.

In `apps/admin-portal/src/shared/components/ui/app-sidebar.tsx`, update the lucide-react import:

```tsx
import { LayoutDashboardIcon, QuoteIcon, ShoppingCartIcon } from "lucide-react";
```

Then add a new `SidebarMenuItem` for Quotes, right after the Dashboard item:

```tsx
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/">
                    <LayoutDashboardIcon />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/quotes">
                    <QuoteIcon />
                    <span>Quotes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <ShoppingCartIcon />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
```

- [ ] **Step 3: Run the full Quotes test suite**

Run: `pnpm --filter admin-portal exec vitest run src/features/quotes`
Expected: PASS — all tests from Tasks 2–16 pass together.

- [ ] **Step 4: Lint and type-check**

Run (from repo root, per `CLAUDE.md`):

```bash
pnpm lint
pnpm check-types
```

Expected: both pass with no errors for `apps/admin-portal`. Fix any issues (e.g. unused imports, missing types) before continuing.

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test`
Expected: PASS — every package/app test, including `apps/admin-portal`, passes.

- [ ] **Step 6: Manual check in the browser**

Run: `pnpm run dev` (from repo root)

Visit `http://localhost:3000/quotes` and confirm:
- "Quotes" appears in the sidebar and navigates to the route.
- The table shows the 12 mock quotes across 2 pages with category, attribute badges, and a working source link.
- "Filters" narrows the table by category/attribute; "Configure Attributes" opens the sheet, edits to Tone/Lifestage update the resolved preview, and Save persists them (new values appear as Select options in "Add Quote").
- "Add Quote" → fill fields → "Generate with AI" fills the 5 attribute selects after a brief delay → "Save Quote" adds the row.
- Row actions → "Edit" prefills the dialog; "Delete" asks for confirmation and removes the row.

Stop the dev server once verified.

- [ ] **Step 7: Commit**

```bash
git add apps/admin-portal/src/app/quotes/page.tsx \
        apps/admin-portal/src/shared/components/ui/app-sidebar.tsx
git commit -m "feat(admin-portal): wire up /quotes route and sidebar entry"
```

---

## Spec coverage check

- Domain taxonomy, locked vs. editable attributes, single-value-per-attribute → Tasks 2, 6
- `resolvePromptTemplate` / taxonomy-drives-prompt link → Task 3, 12
- Mock AI generation (`generateAttributes`) → Tasks 4, 13
- Search + category/attribute filters → Tasks 5, 11, 15, 16
- Quotes table (Option A: dedicated Attributes column) → Task 10
- Configure Attributes sheet (prompt picker + raw/resolved preview + taxonomy editor) → Task 12
- Add/Edit Quote dialog (single column, Generate with AI, creatable category via datalist) → Task 13
- Delete confirmation → Task 14
- Toolbar (search, Filters, Configure Attributes, Add Quote) → Task 15
- Pagination + empty state → Task 16
- Route + navigation → Task 17
- Out of scope items (real API/DB, real AI call, persistence, Prompts admin UI, multi-value attributes) — intentionally not implemented anywhere in this plan.
