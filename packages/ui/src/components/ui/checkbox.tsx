"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { CheckIcon } from "lucide-react";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "ui-peer ui-relative ui-flex ui-size-4 ui-shrink-0 ui-items-center ui-justify-center ui-rounded-[4px] ui-border ui-border-input ui-transition-colors ui-outline-none group-has-disabled/field:ui-opacity-50 after:ui-absolute after:-ui-inset-x-3 after:-ui-inset-y-2 focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 disabled:ui-cursor-not-allowed disabled:ui-opacity-50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 aria-invalid:aria-checked:ui-border-primary dark:ui-bg-input/30 dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40 data-checked:ui-border-primary data-checked:ui-bg-primary data-checked:ui-text-primary-foreground dark:data-checked:ui-bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="ui-grid ui-place-content-center ui-text-current ui-transition-none [&>svg]:ui-size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
