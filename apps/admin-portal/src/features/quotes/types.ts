export type DimensionKey =
  | "mindset"
  | "worldview"
  | "motivation"
  | "tone"
  | "theme"
  | "timeframe"
  | "agency";

export type QuoteAttributes = {
  mindset: string;
  worldview: string;
  motivation: string;
  tone: string[];
  theme: string;
  timeframe: string;
  agency: string;
};

export const DIMENSION_ORDER: DimensionKey[] = [
  "mindset",
  "worldview",
  "motivation",
  "tone",
  "theme",
  "timeframe",
  "agency",
];

export const DIMENSIONS: Record<
  DimensionKey,
  { label: string; chipClassName: string; dotClassName: string }
> = {
  mindset: {
    label: "Mindset",
    chipClassName: "bg-dimension-mindset/12 text-dimension-mindset",
    dotClassName: "bg-dimension-mindset",
  },
  worldview: {
    label: "Worldview",
    chipClassName: "bg-dimension-worldview/12 text-dimension-worldview",
    dotClassName: "bg-dimension-worldview",
  },
  motivation: {
    label: "Motivation",
    chipClassName: "bg-dimension-motivation/12 text-dimension-motivation",
    dotClassName: "bg-dimension-motivation",
  },
  tone: {
    label: "Tone",
    chipClassName: "bg-dimension-tone/12 text-dimension-tone",
    dotClassName: "bg-dimension-tone",
  },
  theme: {
    label: "Theme",
    chipClassName: "bg-dimension-theme/12 text-dimension-theme",
    dotClassName: "bg-dimension-theme",
  },
  timeframe: {
    label: "Time",
    chipClassName: "bg-dimension-timeframe/12 text-dimension-timeframe",
    dotClassName: "bg-dimension-timeframe",
  },
  agency: {
    label: "Agency",
    chipClassName: "bg-dimension-agency/12 text-dimension-agency",
    dotClassName: "bg-dimension-agency",
  },
};
