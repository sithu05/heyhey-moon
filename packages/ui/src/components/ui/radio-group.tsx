"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("ui-grid ui-w-full ui-gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "ui-group/radio-group-item ui-peer ui-relative ui-flex ui-aspect-square ui-size-4 ui-shrink-0 ui-rounded-full ui-border ui-border-input ui-outline-none after:ui-absolute after:-ui-inset-x-3 after:-ui-inset-y-2 focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 disabled:ui-cursor-not-allowed disabled:ui-opacity-50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 aria-invalid:aria-checked:ui-border-primary dark:ui-bg-input/30 dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40 data-checked:ui-border-primary data-checked:ui-bg-primary data-checked:ui-text-primary-foreground dark:data-checked:ui-bg-primary",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="ui-flex ui-size-4 ui-items-center ui-justify-center"
      >
        <span className="ui-absolute ui-top-1/2 ui-left-1/2 ui-size-2 -ui-translate-x-1/2 -ui-translate-y-1/2 ui-rounded-full ui-bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
