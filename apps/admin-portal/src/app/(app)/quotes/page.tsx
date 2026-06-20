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
  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Quotes</h1>
          <p className="text-sm text-gray-500 max-w-lg">
            Every quote is auto-classified by AI across seven psychological
            dimensions. Review the tags, refine them, or regenerate.
          </p>
        </div>

        <div className="flex items-center gap-3.5">
          <EditPromptDialog />
          <AddQuoteDialog />
        </div>
      </div>

      <DimensionChips attributes={SAMPLE_ATTRIBUTES} />
    </div>
  );
}
