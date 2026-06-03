"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("ui-select-none", className)}
      {...props}
    />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "ui-z-50 ui-max-h-(--radix-context-menu-content-available-height) ui-min-w-36 ui-origin-(--radix-context-menu-content-transform-origin) ui-overflow-x-hidden ui-overflow-y-auto ui-rounded-lg ui-bg-popover ui-p-1 ui-text-popover-foreground ui-shadow-md ui-ring-1 ui-ring-foreground/10 ui-duration-100 data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "ui-group/context-menu-item ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-px-1.5 ui-py-1 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground data-inset:ui-pl-7 data-[variant=destructive]:ui-text-destructive data-[variant=destructive]:focus:ui-bg-destructive/10 data-[variant=destructive]:focus:ui-text-destructive dark:data-[variant=destructive]:focus:ui-bg-destructive/20 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4 focus:*:[svg]:ui-text-accent-foreground data-[variant=destructive]:*:[svg]:ui-text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-px-1.5 ui-py-1 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground data-inset:ui-pl-7 data-open:ui-bg-accent data-open:ui-text-accent-foreground [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ui-ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "ui-z-50 ui-min-w-32 ui-origin-(--radix-context-menu-content-transform-origin) ui-overflow-hidden ui-rounded-lg ui-border ui-bg-popover ui-p-1 ui-text-popover-foreground ui-shadow-lg ui-duration-100 data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-py-1 ui-pr-8 ui-pl-1.5 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground data-inset:ui-pl-7 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="ui-pointer-events-none ui-absolute ui-right-2">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-py-1 ui-pr-8 ui-pl-1.5 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground data-inset:ui-pl-7 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      <span className="ui-pointer-events-none ui-absolute ui-right-2">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "ui-px-1.5 ui-py-1 ui-text-xs ui-font-medium ui-text-muted-foreground data-inset:ui-pl-7",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-ui-mx-1 ui-my-1 ui-h-px ui-bg-border", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ui-ml-auto ui-text-xs ui-tracking-widest ui-text-muted-foreground group-focus/context-menu-item:ui-text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
