"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "ui-peer ui-group/switch ui-relative ui-inline-flex ui-shrink-0 ui-items-center ui-rounded-full ui-border ui-border-transparent ui-transition-all ui-outline-none after:ui-absolute after:-ui-inset-x-3 after:-ui-inset-y-2 focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 data-[size=default]:ui-h-[18.4px] data-[size=default]:ui-w-[32px] data-[size=sm]:ui-h-[14px] data-[size=sm]:ui-w-[24px] dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40 data-checked:ui-bg-primary data-unchecked:ui-bg-input dark:data-unchecked:ui-bg-input/80 data-disabled:ui-cursor-not-allowed data-disabled:ui-opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="ui-pointer-events-none ui-block ui-rounded-full ui-bg-background ui-ring-0 ui-transition-transform group-data-[size=default]/switch:ui-size-4 group-data-[size=sm]/switch:ui-size-3 group-data-[size=default]/switch:data-checked:ui-translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:ui-translate-x-[calc(100%-2px)] dark:data-checked:ui-bg-primary-foreground group-data-[size=default]/switch:data-unchecked:ui-translate-x-0 group-data-[size=sm]/switch:data-unchecked:ui-translate-x-0 dark:data-unchecked:ui-bg-foreground"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
