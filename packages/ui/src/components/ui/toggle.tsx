"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

const toggleVariants = cva(
  "ui-group/toggle ui-inline-flex ui-items-center ui-justify-center ui-gap-1 ui-rounded-lg ui-text-sm ui-font-medium ui-whitespace-nowrap ui-transition-all ui-outline-none hover:ui-bg-muted hover:ui-text-foreground focus-visible:ui-border-ring focus-visible:ui-ring-[3px] focus-visible:ui-ring-ring/50 disabled:ui-pointer-events-none disabled:ui-opacity-50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-destructive/20 aria-pressed:ui-bg-muted data-[state=on]:ui-bg-muted dark:aria-invalid:ui-ring-destructive/40 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
  {
    variants: {
      variant: {
        default: "ui-bg-transparent",
        outline: "ui-border ui-border-input ui-bg-transparent hover:ui-bg-muted",
      },
      size: {
        default:
          "ui-h-8 ui-min-w-8 ui-px-2.5 has-data-[icon=inline-end]:ui-pr-2 has-data-[icon=inline-start]:ui-pl-2",
        sm: "ui-h-7 ui-min-w-7 ui-rounded-[min(var(--radius-md),12px)] ui-px-2.5 ui-text-[0.8rem] has-data-[icon=inline-end]:ui-pr-1.5 has-data-[icon=inline-start]:ui-pl-1.5 [&_svg:not([class*='size-'])]:ui-size-3.5",
        lg: "ui-h-9 ui-min-w-9 ui-px-2.5 has-data-[icon=inline-end]:ui-pr-2 has-data-[icon=inline-start]:ui-pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
