"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "ui-shrink-0 ui-bg-border data-horizontal:ui-h-px data-horizontal:ui-w-full data-vertical:ui-w-px data-vertical:ui-self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
