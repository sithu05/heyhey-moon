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
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Quotes</h1>
      <DimensionChips attributes={SAMPLE_ATTRIBUTES} />
    </div>
  );
}
