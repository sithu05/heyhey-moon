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
          "ui:z-50 ui:inline-flex ui:w-fit ui:max-w-xs ui:origin-(--radix-tooltip-content-transform-origin) ui:items-center ui:gap-1.5 ui:rounded-md ui:bg-foreground ui:px-3 ui:py-1.5 ui:text-xs ui:text-background ui:has-data-[slot=kbd]:pr-1.5 ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:**:data-[slot=kbd]:relative ui:**:data-[slot=kbd]:isolate ui:**:data-[slot=kbd]:z-50 ui:**:data-[slot=kbd]:rounded-sm ui:data-[state=delayed-open]:animate-in ui:data-[state=delayed-open]:fade-in-0 ui:data-[state=delayed-open]:zoom-in-95 ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-open:zoom-in-95 ui:data-closed:animate-out ui:data-closed:fade-out-0 ui:data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="ui:z-50 ui:size-2.5 ui:translate-y-[calc(-50%_-_2px)] ui:rotate-45 ui:rounded-[2px] ui:bg-foreground ui:fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
