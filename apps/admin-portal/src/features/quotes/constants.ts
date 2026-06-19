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
