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
