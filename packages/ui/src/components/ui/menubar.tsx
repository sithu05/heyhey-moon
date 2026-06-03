"use client";

import * as React from "react";
import { Menubar as MenubarPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "ui-flex ui-h-8 ui-items-center ui-gap-0.5 ui-rounded-lg ui-border ui-p-[3px]",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "ui-flex ui-items-center ui-rounded-sm ui-px-1.5 ui-py-[2px] ui-text-sm ui-font-medium ui-outline-hidden ui-select-none hover:ui-bg-muted aria-expanded:ui-bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "ui-z-50 ui-min-w-36 ui-origin-(--radix-menubar-content-transform-origin) ui-overflow-hidden ui-rounded-lg ui-bg-popover ui-p-1 ui-text-popover-foreground ui-shadow-md ui-ring-1 ui-ring-foreground/10 ui-duration-100 data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95",
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "ui-group/menubar-item ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-px-1.5 ui-py-1 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground not-data-[variant=destructive]:focus:**:ui-text-accent-foreground data-inset:ui-pl-7 data-[variant=destructive]:ui-text-destructive data-[variant=destructive]:focus:ui-bg-destructive/10 data-[variant=destructive]:focus:ui-text-destructive dark:data-[variant=destructive]:focus:ui-bg-destructive/20 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4 data-[variant=destructive]:*:[svg]:ui-text-destructive!",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(
        "ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-py-1 ui-pr-1.5 ui-pl-7 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground focus:**:ui-text-accent-foreground data-inset:ui-pl-7 data-disabled:ui-pointer-events-none [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="ui-pointer-events-none ui-absolute ui-left-1.5 ui-flex ui-size-4 ui-items-center ui-justify-center [&_svg:not([class*='size-'])]:ui-size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        "ui-relative ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-py-1 ui-pr-1.5 ui-pl-7 ui-text-sm ui-outline-hidden ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground focus:**:ui-text-accent-foreground data-inset:ui-pl-7 data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      <span className="ui-pointer-events-none ui-absolute ui-left-1.5 ui-flex ui-size-4 ui-items-center ui-justify-center [&_svg:not([class*='size-'])]:ui-size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "ui-px-1.5 ui-py-1 ui-text-sm ui-font-medium data-inset:ui-pl-7",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-ui-mx-1 ui-my-1 ui-h-px ui-bg-border", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ui-ml-auto ui-text-xs ui-tracking-widest ui-text-muted-foreground group-focus/menubar-item:ui-text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "ui-flex ui-cursor-default ui-items-center ui-gap-1.5 ui-rounded-md ui-px-1.5 ui-py-1 ui-text-sm ui-outline-none ui-select-none focus:ui-bg-accent focus:ui-text-accent-foreground data-inset:ui-pl-7 data-open:ui-bg-accent data-open:ui-text-accent-foreground [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ui-ml-auto ui-size-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "ui-z-50 ui-min-w-32 ui-origin-(--radix-menubar-content-transform-origin) ui-overflow-hidden ui-rounded-lg ui-bg-popover ui-p-1 ui-text-popover-foreground ui-shadow-lg ui-ring-1 ui-ring-foreground/10 ui-duration-100 data-[side=bottom]:ui-slide-in-from-top-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
