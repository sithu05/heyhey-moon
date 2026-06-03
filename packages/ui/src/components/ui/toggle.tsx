"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

const toggleVariants = cva(
  "ui:group/toggle ui:inline-flex ui:items-center ui:justify-center ui:gap-1 ui:rounded-lg ui:text-sm ui:font-medium ui:whitespace-nowrap ui:transition-all ui:outline-none ui:hover:bg-muted ui:hover:text-foreground ui:focus-visible:border-ring ui:focus-visible:ring-[3px] ui:focus-visible:ring-ring/50 ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:aria-invalid:border-destructive ui:aria-invalid:ring-destructive/20 ui:aria-pressed:bg-muted ui:data-[state=on]:bg-muted ui:dark:aria-invalid:ring-destructive/40 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "ui:bg-transparent",
        outline: "ui:border ui:border-input ui:bg-transparent ui:hover:bg-muted",
      },
      size: {
        default:
          "ui:h-8 ui:min-w-8 ui:px-2.5 ui:has-data-[icon=inline-end]:pr-2 ui:has-data-[icon=inline-start]:pl-2",
        sm: "ui:h-7 ui:min-w-7 ui:rounded-[min(var(--radius-md),12px)] ui:px-2.5 ui:text-[0.8rem] ui:has-data-[icon=inline-end]:pr-1.5 ui:has-data-[icon=inline-start]:pl-1.5 ui:[&_svg:not([class*='size-'])]:size-3.5",
        lg: "ui:h-9 ui:min-w-9 ui:px-2.5 ui:has-data-[icon=inline-end]:pr-2 ui:has-data-[icon=inline-start]:pl-2",
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
