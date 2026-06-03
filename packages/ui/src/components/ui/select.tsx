"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("ui-scroll-my-1 ui-p-1", className)}
      {...props}
    />
  );
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "ui-flex ui-w-fit ui-items-center ui-justify-between ui-gap-1.5 ui-rounded-lg ui-border ui-border-input ui-bg-transparent ui-py-2 ui-pr-2 ui-pl-2.5 ui-text-sm ui-whitespace-nowrap ui-transition-colors ui-outline-none ui-select-none focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 disabled:ui-cursor-not-allowed disabled:ui-opacity-50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 data-placeholder:ui-text-muted-foreground data-[size=default]:ui-h-8 data-[size=sm]:ui-h-7 data-[size=sm]:ui-rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:ui-line-clamp-1 *:data-[slot=select-value]:ui-flex *:data-[slot=select-value]:ui-items-center *:data-[slot=select-value]:ui-gap-1.5 dark:ui-bg-input/30 dark:hover:ui-bg-input/50 dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="ui-pointer-events-none ui-size-4 ui-text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "ui-relative ui-z-50 ui-max-h-(--radix-select-content-available-height) ui-min-w-36 ui-origin-(--radix-select-content-transform-origin) ui-overflow-x-hidden ui-overflow-y-auto ui-rounded-lg ui-bg-popover ui-text-popover-foreground ui-shadow-md ui-ring-1 ui-ring-foreground/10 ui-duration-100 data-[align-trigger=true]:ui-animate-none data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
          position === "ui-popper" &&
            "data-[side=bottom]:ui-translate-y-1 data-[side=left]:-ui-translate-x-1 data-[side=right]:ui-translate-x-1 data-[side=top]:-ui-translate-y-1",
          className,
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "data-[position=popper]:ui-h-(--radix-select-trigger-height) data-[position=popper]:ui-w-full data-[position=popper]:ui-min-w-(--radix-select-trigger-width)",
            position === "ui-popper" && "",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("ui-px-1.5 ui-py-1 ui-text-xs ui-text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "ui-relative ui-flex ui-w-full ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-py-1 ui-pr-8 ui-pl-1.5 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground not-data-[variant=destructive]:focus:**:ui-text-accent-foreground data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4 *:[span]:last:ui-flex *:[span]:last:ui-items-center *:[span]:last:ui-gap-2",
        className,
      )}
      {...props}
    >
      <span className="ui-pointer-events-none ui-absolute ui-right-2 ui-flex ui-size-4 ui-items-center ui-justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="ui-pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("ui-pointer-events-none -ui-mx-1 ui-my-1 ui-h-px ui-bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "ui-z-10 ui-flex ui-cursor-default ui-items-center ui-justify-center ui-bg-popover ui-py-1 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "ui-z-10 ui-flex ui-cursor-default ui-items-center ui-justify-center ui-bg-popover ui-py-1 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
