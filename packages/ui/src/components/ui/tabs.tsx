"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "ui:group/tabs ui:flex ui:gap-2 ui:data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "ui:group/tabs-list ui:inline-flex ui:w-fit ui:items-center ui:justify-center ui:rounded-lg ui:p-[3px] ui:text-muted-foreground ui:group-data-horizontal/tabs:h-8 ui:group-data-vertical/tabs:h-fit ui:group-data-vertical/tabs:flex-col ui:data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "ui:bg-muted",
        line: "ui:gap-1 ui:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "ui:relative ui:inline-flex ui:h-[calc(100%-1px)] ui:flex-1 ui:items-center ui:justify-center ui:gap-1.5 ui:rounded-md ui:border ui:border-transparent ui:px-1.5 ui:py-0.5 ui:text-sm ui:font-medium ui:whitespace-nowrap ui:text-foreground/60 ui:transition-all ui:group-data-vertical/tabs:w-full ui:group-data-vertical/tabs:justify-start ui:hover:text-foreground ui:focus-visible:border-ring ui:focus-visible:ring-[3px] ui:focus-visible:ring-ring/50 ui:focus-visible:outline-1 ui:focus-visible:outline-ring ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:has-data-[icon=inline-end]:pr-1 ui:has-data-[icon=inline-start]:pl-1 ui:dark:text-muted-foreground ui:dark:hover:text-foreground ui:group-data-[variant=default]/tabs-list:data-active:shadow-sm ui:group-data-[variant=line]/tabs-list:data-active:shadow-none ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*='size-'])]:size-4",
        "ui:group-data-[variant=line]/tabs-list:bg-transparent ui:group-data-[variant=line]/tabs-list:data-active:bg-transparent ui:dark:group-data-[variant=line]/tabs-list:data-active:border-transparent ui:dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "ui:data-active:bg-background ui:data-active:text-foreground ui:dark:data-active:border-input ui:dark:data-active:bg-input/30 ui:dark:data-active:text-foreground",
        "ui:after:absolute ui:after:bg-foreground ui:after:opacity-0 ui:after:transition-opacity ui:group-data-horizontal/tabs:after:inset-x-0 ui:group-data-horizontal/tabs:after:bottom-[-5px] ui:group-data-horizontal/tabs:after:h-0.5 ui:group-data-vertical/tabs:after:inset-y-0 ui:group-data-vertical/tabs:after:-right-1 ui:group-data-vertical/tabs:after:w-0.5 ui:group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("ui:flex-1 ui:text-sm ui:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
