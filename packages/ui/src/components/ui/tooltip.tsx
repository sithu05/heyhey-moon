"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "ui-z-50 ui-inline-flex ui-w-fit ui-max-w-xs ui-origin-(--radix-tooltip-content-transform-origin) ui-items-center ui-gap-1.5 ui-rounded-md ui-bg-foreground ui-px-3 ui-py-1.5 ui-text-xs ui-text-background has-data-[slot=kbd]:ui-pr-1.5 data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 **:data-[slot=kbd]:ui-relative **:data-[slot=kbd]:ui-isolate **:data-[slot=kbd]:ui-z-50 **:data-[slot=kbd]:ui-rounded-sm data-[state=delayed-open]:ui-animate-in data-[state=delayed-open]:ui-fade-in-0 data-[state=delayed-open]:ui-zoom-in-95 data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="ui-z-50 ui-size-2.5 ui-translate-y-[calc(-50%_-_2px)] ui-rotate-45 ui-rounded-[2px] ui-bg-foreground ui-fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
