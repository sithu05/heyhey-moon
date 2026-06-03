"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react";

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:ui-size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="ui-pointer-events-none ui-size-4 ui-text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="ui-pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  return (
    <InputGroup className={cn("ui-w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:ui-hidden data-pressed:ui-bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="ui-isolate ui-z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "ui-group/combobox-content ui-relative ui-max-h-(--available-height) ui-w-(--anchor-width) ui-max-w-(--available-width) ui-min-w-[calc(var(--anchor-width)+--spacing(7))] ui-origin-(--transform-origin) ui-overflow-hidden ui-rounded-lg ui-bg-popover ui-text-popover-foreground ui-shadow-md ui-ring-1 ui-ring-foreground/10 ui-duration-100 data-[chips=true]:ui-min-w-(--anchor-width) data-[side=bottom]:ui-slide-in-from-top-2 data-[side=inline-end]:ui-slide-in-from-left-2 data-[side=inline-start]:ui-slide-in-from-right-2 data-[side=left]:ui-slide-in-from-right-2 data-[side=right]:ui-slide-in-from-left-2 data-[side=top]:ui-slide-in-from-bottom-2 *:data-[slot=input-group]:ui-m-1 *:data-[slot=input-group]:ui-mb-0 *:data-[slot=input-group]:ui-h-8 *:data-[slot=input-group]:ui-border-input/30 *:data-[slot=input-group]:ui-bg-input/30 *:data-[slot=input-group]:ui-shadow-none data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "ui-no-scrollbar ui-max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] ui-scroll-py-1 ui-overflow-y-auto ui-overscroll-contain ui-p-1 data-empty:ui-p-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "ui-relative ui-flex ui-w-full ui-cursor-default ui-items-center ui-gap-2 ui-rounded-md ui-py-1 ui-pr-8 ui-pl-1.5 ui-text-sm ui-outline-hidden ui-select-none data-highlighted:ui-bg-accent data-highlighted:ui-text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:ui-text-accent-foreground data-disabled:ui-pointer-events-none data-disabled:ui-opacity-50 [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="ui-pointer-events-none ui-absolute ui-right-2 ui-flex ui-size-4 ui-items-center ui-justify-center" />
        }
      >
        <CheckIcon className="ui-pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  );
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("ui-px-2 ui-py-1.5 ui-text-xs ui-text-muted-foreground", className)}
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "ui-hidden ui-w-full ui-justify-center ui-py-2 ui-text-center ui-text-sm ui-text-muted-foreground group-data-empty/combobox-content:ui-flex",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-ui-mx-1 ui-my-1 ui-h-px ui-bg-border", className)}
      {...props}
    />
  );
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "ui-flex ui-min-h-8 ui-flex-wrap ui-items-center ui-gap-1 ui-rounded-lg ui-border ui-border-input ui-bg-transparent ui-bg-clip-padding ui-px-2.5 ui-py-1 ui-text-sm ui-transition-colors focus-within:ui-border-ring focus-within:ui-ring-3 focus-within:ui-ring-ring/50 has-aria-invalid:ui-border-destructive has-aria-invalid:ui-ring-3 has-aria-invalid:ui-ring-destructive/20 has-data-[slot=combobox-chip]:ui-px-1 dark:ui-bg-input/30 dark:has-aria-invalid:ui-border-destructive/50 dark:has-aria-invalid:ui-ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "ui-flex ui-h-[calc(--spacing(5.25))] ui-w-fit ui-items-center ui-justify-center ui-gap-1 ui-rounded-sm ui-bg-muted ui-px-1.5 ui-text-xs ui-font-medium ui-whitespace-nowrap ui-text-foreground has-disabled:ui-pointer-events-none has-disabled:ui-cursor-not-allowed has-disabled:ui-opacity-50 has-data-[slot=combobox-chip-remove]:ui-pr-0",
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ui-ml-1 ui-opacity-50 hover:ui-opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="ui-pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("ui-min-w-16 ui-flex-1 ui-outline-none", className)}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
