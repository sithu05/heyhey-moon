"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "ui-group/input-group ui-relative ui-flex ui-h-8 ui-w-full ui-min-w-0 ui-items-center ui-rounded-lg ui-border ui-border-input ui-transition-colors ui-outline-none in-data-[slot=combobox-content]:focus-within:ui-border-inherit in-data-[slot=combobox-content]:focus-within:ui-ring-0 has-disabled:ui-bg-input/50 has-disabled:ui-opacity-50 has-[[data-slot=input-group-control]:focus-visible]:ui-border-ring has-[[data-slot=input-group-control]:focus-visible]:ui-ring-3 has-[[data-slot=input-group-control]:focus-visible]:ui-ring-ring/50 has-[[data-slot][aria-invalid=true]]:ui-border-destructive has-[[data-slot][aria-invalid=true]]:ui-ring-3 has-[[data-slot][aria-invalid=true]]:ui-ring-destructive/20 has-[>[data-align=block-end]]:ui-h-auto has-[>[data-align=block-end]]:ui-flex-col has-[>[data-align=block-start]]:ui-h-auto has-[>[data-align=block-start]]:ui-flex-col has-[>textarea]:ui-h-auto dark:ui-bg-input/30 dark:has-disabled:ui-bg-input/80 dark:has-[[data-slot][aria-invalid=true]]:ui-ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:ui-pt-3 has-[>[data-align=block-start]]:[&>input]:ui-pb-3 has-[>[data-align=inline-end]]:[&>input]:ui-pr-1.5 has-[>[data-align=inline-start]]:[&>input]:ui-pl-1.5",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "ui-flex ui-h-auto ui-cursor-text ui-items-center ui-justify-center ui-gap-2 ui-py-1.5 ui-text-sm ui-font-medium ui-text-muted-foreground ui-select-none group-data-[disabled=true]/input-group:ui-opacity-50 [&>kbd]:ui-rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:ui-size-4",
  {
    variants: {
      align: {
        "inline-start":
          "ui-order-first ui-pl-2 has-[>button]:ui-ml-[-0.3rem] has-[>kbd]:ui-ml-[-0.15rem]",
        "inline-end":
          "ui-order-last ui-pr-2 has-[>button]:ui-mr-[-0.3rem] has-[>kbd]:ui-mr-[-0.15rem]",
        "block-start":
          "ui-order-first ui-w-full ui-justify-start ui-px-2.5 ui-pt-2 group-has-[>input]/input-group:ui-pt-2 [.border-b]:ui-pb-2",
        "block-end":
          "ui-order-last ui-w-full ui-justify-start ui-px-2.5 ui-pb-2 group-has-[>input]/input-group:ui-pb-2 [.border-t]:ui-pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "ui-flex ui-items-center ui-gap-2 ui-text-sm ui-shadow-none",
  {
    variants: {
      size: {
        xs: "ui-h-6 ui-gap-1 ui-rounded-[calc(var(--radius)-3px)] ui-px-1.5 [&>svg:not([class*='size-'])]:ui-size-3.5",
        sm: "",
        "ui-icon-xs":
          "ui-size-6 ui-rounded-[calc(var(--radius)-3px)] ui-p-0 has-[>svg]:ui-p-0",
        "ui-icon-sm": "ui-size-8 ui-p-0 has-[>svg]:ui-p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ui-flex ui-items-center ui-gap-2 ui-text-sm ui-text-muted-foreground [&_svg]:ui-pointer-events-none [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "ui-flex-1 ui-rounded-none ui-border-0 ui-bg-transparent ui-shadow-none ui-ring-0 focus-visible:ui-ring-0 disabled:ui-bg-transparent aria-invalid:ui-ring-0 dark:ui-bg-transparent dark:disabled:ui-bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "ui-flex-1 ui-resize-none ui-rounded-none ui-border-0 ui-bg-transparent ui-py-2 ui-shadow-none ui-ring-0 focus-visible:ui-ring-0 disabled:ui-bg-transparent aria-invalid:ui-ring-0 dark:ui-bg-transparent dark:disabled:ui-bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
