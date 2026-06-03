"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "ui-z-50 ui-max-h-(--radix-dropdown-menu-content-available-height) ui-w-(--radix-dropdown-menu-trigger-width) ui-min-w-32 ui-origin-(--radix-dropdown-menu-content-transform-origin) ui-overflow-x-hidden ui-overflow-y-auto ui-rounded-lg ui-bg-popover ui-p-1 ui-text-popover-foreground ui-shadow-md ui-ring-1 ui-ring-foreground/10 ui-duration-100 data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 data-[state=closed]:ui-overflow-hidden data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "ui-group/dropdown-menu-item ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-px-1.5 ui-py-1 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground not-data-[variant=destructive]:focus:**:ui-text-accent-foreground data-inset:ui-pl-7 data-[variant=destructive]:ui-text-destructive data-[variant=destructive]:focus:ui-bg-destructive/10 data-[variant=destructive]:focus:ui-text-destructive dark:data-[variant=destructive]:focus:ui-bg-destructive/20 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4 data-[variant=destructive]:*:[svg]:ui-text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-py-1 ui-pr-8 ui-pl-1.5 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground focus:**:ui-text-accent-foreground data-inset:ui-pl-7 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="ui-pointer-events-none ui-absolute ui-right-2 ui-flex ui-items-center ui-justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-py-1 ui-pr-8 ui-pl-1.5 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground focus:**:ui-text-accent-foreground data-inset:ui-pl-7 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      <span
        className="ui-pointer-events-none ui-absolute ui-right-2 ui-flex ui-items-center ui-justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "ui-px-1.5 ui-py-1 ui-text-xs ui-font-medium ui-text-muted-foreground data-inset:ui-pl-7",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-ui-mx-1 ui-my-1 ui-h-px ui-bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ui-ml-auto ui-text-xs ui-tracking-widest ui-text-muted-foreground group-focus/dropdown-menu-item:ui-text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-px-1.5 ui-py-1 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground not-data-[variant=destructive]:focus:**:ui-text-accent-foreground data-inset:ui-pl-7 data-open:ui-bg-accent data-open:ui-text-accent-foreground [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ui-ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "ui-z-50 ui-min-w-[96px] ui-origin-(--radix-dropdown-menu-content-transform-origin) ui-overflow-hidden ui-rounded-lg ui-bg-popover ui-p-1 ui-text-popover-foreground ui-shadow-lg ui-ring-1 ui-ring-foreground/10 ui-duration-100 data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
