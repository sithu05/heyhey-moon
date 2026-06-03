"use client";

import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Label } from "./label";
import { Separator } from "./separator";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "ui-flex ui-flex-col ui-gap-4 has-[>[data-slot=checkbox-group]]:ui-gap-3 has-[>[data-slot=radio-group]]:ui-gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "ui-mb-1.5 ui-font-medium data-[variant=label]:ui-text-sm data-[variant=legend]:ui-text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "ui-group/field-group ui-@container/field-group ui-flex ui-w-full ui-flex-col ui-gap-5 data-[slot=checkbox-group]:ui-gap-3 *:data-[slot=field-group]:ui-gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  "ui-group/field ui-flex ui-w-full ui-gap-2 data-[invalid=true]:ui-text-destructive",
  {
    variants: {
      orientation: {
        vertical: "ui-flex-col *:ui-w-full [&>.sr-only]:ui-w-auto",
        horizontal:
          "ui-flex-row ui-items-center has-[>[data-slot=field-content]]:ui-items-start *:data-[slot=field-label]:ui-flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:ui-mt-px",
        responsive:
          "ui-flex-col *:ui-w-full @md/field-group:ui-flex-row @md/field-group:ui-items-center @md/field-group:*:ui-w-auto @md/field-group:has-[>[data-slot=field-content]]:ui-items-start @md/field-group:*:data-[slot=field-label]:ui-flex-auto [&>.sr-only]:ui-w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:ui-mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "ui-group/field-content ui-flex ui-flex-1 ui-flex-col ui-gap-0.5 ui-leading-snug",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "ui-group/field-label ui-peer/field-label ui-flex ui-w-fit ui-gap-2 ui-leading-snug group-data-[disabled=true]/field:ui-opacity-50 has-data-checked:ui-border-primary/30 has-data-checked:ui-bg-primary/5 has-[>[data-slot=field]]:ui-rounded-lg has-[>[data-slot=field]]:ui-border *:data-[slot=field]:ui-p-2.5 dark:has-data-checked:ui-border-primary/20 dark:has-data-checked:ui-bg-primary/10",
        "has-[>[data-slot=field]]:ui-w-full has-[>[data-slot=field]]:ui-flex-col",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "ui-flex ui-w-fit ui-items-center ui-gap-2 ui-text-sm ui-font-medium group-data-[disabled=true]/field:ui-opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "ui-text-left ui-text-sm ui-leading-normal ui-font-normal ui-text-muted-foreground group-has-data-horizontal/field:ui-text-balance [[data-variant=legend]+&]:-ui-mt-1.5",
        "last:ui-mt-0 nth-last-2:-ui-mt-1",
        "[&>a]:ui-underline [&>a]:ui-underline-offset-4 [&>a:hover]:ui-text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "ui-relative -ui-my-2 ui-h-5 ui-text-sm group-data-[variant=outline]/field-group:-ui-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="ui-absolute ui-inset-0 ui-top-1/2" />
      {children && (
        <span
          className="ui-relative ui-mx-auto ui-block ui-w-fit ui-bg-background ui-px-2 ui-text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ui-ml-4 ui-flex ui-list-disc ui-flex-col ui-gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("ui-text-sm ui-font-normal ui-text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
