"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "ui-flex ui-items-center ui-gap-2 ui-text-sm ui-leading-none ui-font-medium ui-select-none group-data-[disabled=true]:ui-pointer-events-none group-data-[disabled=true]:ui-opacity-50 peer-disabled:ui-cursor-not-allowed peer-disabled:ui-opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
