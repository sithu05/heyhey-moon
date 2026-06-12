# Quotes Admin Route — Design

## Overview

A new `/quotes` route in `apps/admin-portal` for managing the quote content used
elsewhere in HeyHey Memo. Each quote carries standard editorial fields (quote text,
author, category, a source link for licensing/attribution) plus a set of **sentiment
attributes** — a fixed taxonomy of mindset/worldview/motivation/tone/lifestage tags
used to match quotes to a user's current state.

This spec covers **frontend only**, built against **mock/in-memory data** with
realistic TypeScript types. A real `quotes` database table, Hono API endpoints (mirroring
the existing `prompts` resource pattern), and an actual AI/LLM call for tag generation
are explicitly out of scope — this UI is for validating the UX before building that
backend.

## Domain Terms & Attribute Taxonomy

Sentiment attributes are framed around established frameworks so the taxonomy feels
coherent rather than arbitrary:

- **mindset**: `growth` | `fixed` — Dweck's growth/fixed mindset. Locked pair.
- **worldview**: `stoic` | `optimistic` — the philosophical lens a quote takes on
  adversity. Locked pair.
- **motivation**: `intrinsic` | `extrinsic` — Self-Determination Theory. Locked pair.
- **tone**: open set — the emotional register of the quote's delivery. Editable.
- **lifestage**: open set — the life situation a reader might be in when this quote
  resonates. Editable.

Each attribute holds **exactly one value per quote** (no multi-select).

**Starter taxonomy** (seeded as defaults in `default-taxonomy.ts`, editable via the
Configure Attributes sheet):
- tone: Calming, Reflective, Energizing, Hopeful, Empowering, Comforting, Playful, Bold
- lifestage: Feeling Stuck, Seeking Clarity, New Beginnings, Navigating Change,
  Building Habits, Facing Setbacks, Letting Go, Celebrating Growth

**Category** is a free-form field (creatable combobox), not part of the managed
taxonomy. Seed categories in mock data: Courage, Mindfulness, Discipline, Resilience,
Purpose, Self-Compassion, Gratitude.

## Data Model (mock types)

All types live in `features/quotes/types.ts`. No database/API involved yet.

```ts
export type Mindset = "growth" | "fixed";
export type Worldview = "stoic" | "optimistic";
export type Motivation = "intrinsic" | "extrinsic";

export type SentimentAttributes = {
  mindset: Mindset;
  worldview: Worldview;
  motivation: Motivation;
  tone: string;      // must be one of taxonomy.tone
  lifestage: string; // must be one of taxonomy.lifestage
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
  mindset: readonly ["growth", "fixed"];           // locked, not editable
  worldview: readonly ["stoic", "optimistic"];     // locked, not editable
  motivation: readonly ["intrinsic", "extrinsic"]; // locked, not editable
  tone: string[];      // editable list
  lifestage: string[]; // editable list
};

export type PromptOption = {
  id: number;
  title: string;
  content: string; // template containing {{xxx_options}} placeholders
};
```

## Route & Component Structure

Following the feature-slice pattern from `CLAUDE.md`:

```
apps/admin-portal/src/
  app/
    quotes/
      page.tsx                        # thin shell -> <QuotesPage />
  features/
    quotes/
      components/
        quotes-page.tsx                # container: owns state (quotes, taxonomy, prompt, filters, search)
        quotes-toolbar.tsx             # container: search input, opens Filters/Configure/Add
        quotes-table.tsx               # container: renders rows + row actions
        filters-popover.tsx            # container: filter state (category + 5 attributes)
        quote-form-dialog.tsx          # container: Add/Edit form state + "Generate with AI"
        configure-attributes-sheet.tsx # container: taxonomy + prompt picker state
        delete-quote-dialog.tsx        # container: confirm delete
        ui/
          attribute-badge.tsx          # static: colored pill for one attribute (type + value)
          category-badge.tsx           # static: category pill
          source-link.tsx              # static: external-link icon button for resource link
          taxonomy-pill-list.tsx       # static: row of pills, optional add/remove
      data/
        mock-quotes.ts                 # ~12 seed quotes across the starter taxonomy
        mock-prompts.ts                # mirrors GET /prompts?type=ai-system response shape
        default-taxonomy.ts            # starter AttributeTaxonomy
      lib/
        resolve-prompt-template.ts     # (template, taxonomy) => resolved string
      types.ts
```

**State**: all state (`quotes`, `taxonomy`, `selectedPromptId`, filters, search query)
lives in React state inside `quotes-page.tsx`, seeded from the `data/` mock files.
Nothing persists across page reloads — that's acceptable for this UI-validation phase.

## List Page (`/quotes`)

- **Header**: "Quotes" title + short subtitle ("Manage quotes and their sentiment tags")
- **Toolbar** (`quotes-toolbar.tsx`): search input (left) · Filters popover · "Configure
  Attributes" button · "+ Add Quote" primary button (right)
- **Table** (`quotes-table.tsx`), columns:
  1. **Quote** — text clamped to ~2 lines
  2. **Author**
  3. **Category** — badge (`category-badge.tsx`)
  4. **Attributes** — all 5 sentiment attributes as colored badges (`attribute-badge.tsx`),
     wrapping across rows
  5. **Source** — external-link icon button to `sourceUrl` (`source-link.tsx`)
  6. **Actions** — kebab dropdown: Edit, Delete
- **Pagination** footer using `@repo/ui` pagination component
- **Empty state** (via `@repo/ui` empty component) when search/filters produce no rows

Each attribute badge has a distinct color per attribute *type* (not per value) so a row
reads as: [mindset][worldview][motivation][tone][lifestage] — consistent positions and
colors across rows for scannability.

## Filters

`filters-popover.tsx` provides multi-select filtering by:
- Category
- Mindset, Worldview, Motivation (from locked taxonomy pairs)
- Tone, Lifestage (from current editable taxonomy lists)

The toolbar's "Filters" button shows an active-filter count badge when any filter is
applied, and the popover includes a "Clear filters" action. Filtering is combined with
the search query (AND).

## Configure Attributes Sheet

Opens from the toolbar as a single-scroll sheet (`configure-attributes-sheet.tsx`):

1. **Tagging Prompt**
   - Select populated from `mock-prompts.ts` (shape mirrors `GET /prompts?type=ai-system`)
   - Read-only "raw template" preview of the selected prompt's `content`, containing
     placeholders: `{{mindset_options}}`, `{{worldview_options}}`,
     `{{motivation_options}}`, `{{tone_options}}`, `{{lifestage_options}}`
   - "Resolved Preview" — the same template with placeholders substituted by the
     current taxonomy values via `resolve-prompt-template.ts`, so the admin sees
     exactly what would be sent to an AI model
   - No link into a Prompts admin UI (doesn't exist yet) — preview only

2. **Attribute Taxonomy** (`taxonomy-pill-list.tsx`)
   - Mindset / Worldview / Motivation: locked pills (Growth/Fixed, Stoic/Optimistic,
     Intrinsic/Extrinsic) — read-only, shown for transparency since they also appear in
     the resolved prompt
   - Tone / Lifestage: editable pill lists — add via small input + Enter, remove via ×
     on each pill

3. **Footer**: Cancel / Save. Save updates the shared `taxonomy` state in
   `quotes-page.tsx`, which immediately affects:
   - the Resolved Preview in this sheet
   - the Select options for `tone`/`lifestage` in the Add/Edit Quote dialog
   - the Tone/Lifestage filter options in `filters-popover.tsx`

### `resolve-prompt-template.ts`

Pure function: `(template: string, taxonomy: AttributeTaxonomy) => string`. Replaces
each `{{xxx_options}}` placeholder with a human-readable, comma-separated list of that
attribute's current values (e.g. `{{tone_options}}` → `"Calming, Reflective, Energizing,
..."`). Used by both the Resolved Preview and (conceptually) by the future real AI call.

## Add/Edit Quote Dialog

Single-column dialog (`quote-form-dialog.tsx`), shared between Add and Edit:

- **Quote** — textarea
- **Author** — text input
- **Category** — creatable combobox (suggestions drawn from categories already present
  in the current `quotes` list, plus seed categories; typing a new value creates it)
- **Resource Link** — url input (license/attribution source)
- Divider
- **"Sentiment Attributes"** section header + **"✨ Generate with AI"** button
  - Disabled until Quote, Author, and Category are all filled
  - On click: brief simulated loading state (e.g. ~600ms), then fills the 5 attribute
    selects with values drawn from the *current* taxonomy
  - This is an explicit placeholder for the real AI call — `resolve-prompt-template.ts`
    is real/testable, but no network/model call happens here
  - Generated values remain fully editable afterward
- 5 selects in a 2-column grid: Mindset / Worldview in row 1, Motivation / Tone in row
  2, Lifestage spanning full width in row 3
- **Footer**: Cancel / Save Quote — Save adds a new quote or updates the edited one in
  `quotes-page.tsx` state

## Delete Confirmation

`delete-quote-dialog.tsx` — a simple `alert-dialog`: "Delete this quote? This can't be
undone." Cancel / Delete, removes the quote from in-memory state.

## Navigation

Add a `Quotes` entry to `mainMenu` in `shared/components/ui/nav.ts`, using the `Quote`
icon from `lucide-react`, linking to `/quotes`.

## Testing

Vitest + jsdom (per the `apps/` project in the root `vitest.config.ts`):

- `resolve-prompt-template.test.ts` — placeholder substitution for all 5 attributes,
  including after taxonomy edits (tone/lifestage lists change).
- `quotes-table.test.tsx` — renders mock quotes; verifies all 6 columns and attribute
  badges render with correct labels/colors (Option A layout).
- `filters-popover.test.tsx` — selecting filters (category and/or attributes) narrows
  the table to matching quotes; "Clear filters" resets.
- `quote-form-dialog.test.tsx` — required-field validation; "Generate with AI" is
  disabled until Quote/Author/Category are filled and populates all 5 selects when
  clicked; Save adds/updates a quote in the list.
- `configure-attributes-sheet.test.tsx` — adding/removing a tone/lifestage tag updates
  the Resolved Preview and becomes available as a Select option in the quote form and
  as a filter option.

## Out of Scope

- Real `quotes` database table + Hono API endpoints (a follow-up spec, mirroring the
  `prompts` resource pattern in `apps/api/src/features/prompts/`)
- Real AI/LLM call for "Generate with AI" (prompt resolution is real; the model call is
  mocked)
- Persisting quotes / taxonomy / selected prompt across page reloads
- A Prompts admin UI (the Configure Attributes sheet only previews prompt content, it
  doesn't link to an editor)
- Multi-value (multi-tag) attributes — every attribute holds exactly one value per quote
