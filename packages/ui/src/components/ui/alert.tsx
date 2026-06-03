import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const alertVariants = cva(
  "ui-group/alert ui-relative ui-grid ui-w-full ui-gap-0.5 ui-rounded-lg ui-border ui-px-2.5 ui-py-2 ui-text-left ui-text-sm has-data-[slot=alert-action]:ui-relative has-data-[slot=alert-action]:ui-pr-18 has-[>svg]:ui-grid-cols-[auto_1fr] has-[>svg]:ui-gap-x-2 *:[svg]:ui-row-span-2 *:[svg]:ui-translate-y-0.5 *:[svg]:ui-text-current *:[svg:not([class*='size-'])]:ui-size-4",
  {
    variants: {
      variant: {
        default: "ui-bg-card ui-text-card-foreground",
        destructive:
          "ui-bg-card ui-text-destructive *:data-[slot=alert-description]:ui-text-destructive/90 *:[svg]:ui-text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "ui-font-medium group-has-[>svg]/alert:ui-col-start-2 [&_a]:ui-underline [&_a]:ui-underline-offset-3 [&_a]:hover:ui-text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "ui-text-sm ui-text-balance ui-text-muted-foreground md:ui-text-pretty [&_a]:ui-underline [&_a]:ui-underline-offset-3 [&_a]:hover:ui-text-foreground [&_p:not(:last-child)]:ui-mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("ui-absolute ui-top-2 ui-right-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
