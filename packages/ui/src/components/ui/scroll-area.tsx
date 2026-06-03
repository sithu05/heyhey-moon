"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("ui-relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="ui-size-full ui-rounded-[inherit] ui-transition-[color,box-shadow] ui-outline-none focus-visible:ui-ring-[3px] focus-visible:ui-ring-ring/50 focus-visible:ui-outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "ui-flex ui-touch-none ui-p-px ui-transition-colors ui-select-none data-horizontal:ui-h-2.5 data-horizontal:ui-flex-col data-horizontal:ui-border-t data-horizontal:ui-border-t-transparent data-vertical:ui-h-full data-vertical:ui-w-2.5 data-vertical:ui-border-l data-vertical:ui-border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="ui-relative ui-flex-1 ui-rounded-full ui-bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
