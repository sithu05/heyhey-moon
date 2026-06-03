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
      className={cn("ui:grid ui:w-full ui:gap-2", className)}
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
        "ui:group/radio-group-item ui:peer ui:relative ui:flex ui:aspect-square ui:size-4 ui:shrink-0 ui:rounded-full ui:border ui:border-input ui:outline-none ui:after:absolute ui:after:-inset-x-3 ui:after:-inset-y-2 ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:aria-invalid:border-destructive ui:aria-invalid:ring-3 ui:aria-invalid:ring-destructive/20 ui:aria-invalid:aria-checked:border-primary ui:dark:bg-input/30 ui:dark:aria-invalid:border-destructive/50 ui:dark:aria-invalid:ring-destructive/40 ui:data-checked:border-primary ui:data-checked:bg-primary ui:data-checked:text-primary-foreground ui:dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="ui:flex ui:size-4 ui:items-center ui:justify-center"
      >
        <span className="ui:absolute ui:top-1/2 ui:left-1/2 ui:size-2 ui:-translate-x-1/2 ui:-translate-y-1/2 ui:rounded-full ui:bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
