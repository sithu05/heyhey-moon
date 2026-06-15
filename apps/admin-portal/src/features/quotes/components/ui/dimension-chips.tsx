"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { cn } from "@repo/ui/lib/utils";

import { DIMENSION_ORDER, DIMENSIONS, type QuoteAttributes } from "../../types";

export function DimensionChips({ attributes }: { attributes: QuoteAttributes }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DIMENSION_ORDER.flatMap((key) => {
        const values = attributes[key];
        const list = Array.isArray(values) ? values : [values];
        return list.map((value, i) => (
          <Badge
            key={`${key}-${i}`}
            variant="outline"
            className={cn(
              "gap-1.5 border-transparent font-semibold",
              DIMENSIONS[key].chipClassName,
            )}
          >
            <span className={cn("size-1.5 rounded-full", DIMENSIONS[key].dotClassName)} />
            {value}
          </Badge>
        ));
      })}
    </div>
  );
}
