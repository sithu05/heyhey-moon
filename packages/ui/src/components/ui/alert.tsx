import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const alertVariants = cva(
  "ui:group/alert ui:relative ui:grid ui:w-full ui:gap-0.5 ui:rounded-lg ui:border ui:px-2.5 ui:py-2 ui:text-left ui:text-sm ui:has-data-[slot=alert-action]:relative ui:has-data-[slot=alert-action]:pr-18 ui:has-[>svg]:grid-cols-[auto_1fr] ui:has-[>svg]:gap-x-2 ui:*:[svg]:row-span-2 ui:*:[svg]:translate-y-0.5 ui:*:[svg]:text-current ui:*:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "ui:bg-card ui:text-card-foreground",
        destructive:
          "ui:bg-card ui:text-destructive ui:*:data-[slot=alert-description]:text-destructive/90 ui:*:[svg]:text-current",
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
        "ui:font-medium ui:group-has-[>svg]/alert:col-start-2 ui:[&_a]:underline ui:[&_a]:underline-offset-3 ui:[&_a]:hover:text-foreground",
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
        "ui:text-sm ui:text-balance ui:text-muted-foreground ui:md:text-pretty ui:[&_a]:underline ui:[&_a]:underline-offset-3 ui:[&_a]:hover:text-foreground ui:[&_p:not(:last-child)]:mb-4",
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
      className={cn("ui:absolute ui:top-2 ui:right-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
