import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "ui-group/badge ui-inline-flex ui-h-5 ui-w-fit ui-shrink-0 ui-items-center ui-justify-center ui-gap-1 ui-overflow-hidden ui-rounded-4xl ui-border ui-border-transparent ui-px-2 ui-py-0.5 ui-text-xs ui-font-medium ui-whitespace-nowrap ui-transition-all focus-visible:ui-border-ring focus-visible:ui-ring-[3px] focus-visible:ui-ring-ring/50 has-data-[icon=inline-end]:ui-pr-1.5 has-data-[icon=inline-start]:ui-pl-1.5 aria-invalid:ui-border-destructive aria-invalid:ui-ring-destructive/20 dark:aria-invalid:ui-ring-destructive/40 [&>svg]:ui-pointer-events-none [&>svg]:ui-size-3!",
  {
    variants: {
      variant: {
        default: "ui-bg-primary ui-text-primary-foreground [a]:hover:ui-bg-primary/80",
        secondary:
          "ui-bg-secondary ui-text-secondary-foreground [a]:hover:ui-bg-secondary/80",
        destructive:
          "ui-bg-destructive/10 ui-text-destructive focus-visible:ui-ring-destructive/20 dark:ui-bg-destructive/20 dark:focus-visible:ui-ring-destructive/40 [a]:hover:ui-bg-destructive/20",
        outline:
          "ui-border-border ui-text-foreground [a]:hover:ui-bg-muted [a]:hover:ui-text-muted-foreground",
        ghost:
          "hover:ui-bg-muted hover:ui-text-muted-foreground dark:hover:ui-bg-muted/50",
        link: "ui-text-primary ui-underline-offset-4 hover:ui-underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
