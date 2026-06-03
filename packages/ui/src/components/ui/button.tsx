import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "ui-group/button ui-inline-flex ui-shrink-0 ui-items-center ui-justify-center ui-rounded-lg ui-border ui-border-transparent ui-bg-clip-padding ui-text-sm ui-font-medium ui-whitespace-nowrap ui-transition-all ui-outline-none ui-select-none focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 active:not-aria-[haspopup]:ui-translate-y-px disabled:ui-pointer-events-none disabled:ui-opacity-50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
  {
    variants: {
      variant: {
        default: "ui-bg-primary ui-text-primary-foreground hover:ui-bg-primary/80",
        outline:
          "ui-border-border ui-bg-background hover:ui-bg-muted hover:ui-text-foreground aria-expanded:ui-bg-muted aria-expanded:ui-text-foreground dark:ui-border-input dark:ui-bg-input/30 dark:hover:ui-bg-input/50",
        secondary:
          "ui-bg-secondary ui-text-secondary-foreground hover:ui-bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:ui-bg-secondary aria-expanded:ui-text-secondary-foreground",
        ghost:
          "hover:ui-bg-muted hover:ui-text-foreground aria-expanded:ui-bg-muted aria-expanded:ui-text-foreground dark:hover:ui-bg-muted/50",
        destructive:
          "ui-bg-destructive/10 ui-text-destructive hover:ui-bg-destructive/20 focus-visible:ui-border-destructive/40 focus-visible:ui-ring-destructive/20 dark:ui-bg-destructive/20 dark:hover:ui-bg-destructive/30 dark:focus-visible:ui-ring-destructive/40",
        link: "ui-text-primary ui-underline-offset-4 hover:ui-underline",
      },
      size: {
        default:
          "ui-h-8 ui-gap-1.5 ui-px-2.5 has-data-[icon=inline-end]:ui-pr-2 has-data-[icon=inline-start]:ui-pl-2",
        xs: "ui-h-6 ui-gap-1 ui-rounded-[min(var(--radius-md),10px)] ui-px-2 ui-text-xs in-data-[slot=button-group]:ui-rounded-lg has-data-[icon=inline-end]:ui-pr-1.5 has-data-[icon=inline-start]:ui-pl-1.5 [&_svg:not([class*='size-'])]:ui-size-3",
        sm: "ui-h-7 ui-gap-1 ui-rounded-[min(var(--radius-md),12px)] ui-px-2.5 ui-text-[0.8rem] in-data-[slot=button-group]:ui-rounded-lg has-data-[icon=inline-end]:ui-pr-1.5 has-data-[icon=inline-start]:ui-pl-1.5 [&_svg:not([class*='size-'])]:ui-size-3.5",
        lg: "ui-h-9 ui-gap-1.5 ui-px-2.5 has-data-[icon=inline-end]:ui-pr-2 has-data-[icon=inline-start]:ui-pl-2",
        icon: "ui-size-8",
        "icon-xs":
          "ui-size-6 ui-rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:ui-rounded-lg [&_svg:not([class*='size-'])]:ui-size-3",
        "icon-sm":
          "ui-size-7 ui-rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:ui-rounded-lg",
        "icon-lg": "ui-size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
