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
        "ui-group/tabs ui-flex ui-gap-2 data-horizontal:ui-flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "ui-group/tabs-list ui-inline-flex ui-w-fit ui-items-center ui-justify-center ui-rounded-lg ui-p-[3px] ui-text-muted-foreground group-data-horizontal/tabs:ui-h-8 group-data-vertical/tabs:ui-h-fit group-data-vertical/tabs:ui-flex-col data-[variant=line]:ui-rounded-none",
  {
    variants: {
      variant: {
        default: "ui-bg-muted",
        line: "ui-gap-1 ui-bg-transparent",
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
        "ui-relative ui-inline-flex ui-h-[calc(100%-1px)] ui-flex-1 ui-items-center ui-justify-center ui-gap-1.5 ui-rounded-md ui-border ui-border-transparent ui-px-1.5 ui-py-0.5 ui-text-sm ui-font-medium ui-whitespace-nowrap ui-text-foreground/60 ui-transition-all group-data-vertical/tabs:ui-w-full group-data-vertical/tabs:ui-justify-start hover:ui-text-foreground focus-visible:ui-border-ring focus-visible:ui-ring-[3px] focus-visible:ui-ring-ring/50 focus-visible:ui-outline-1 focus-visible:ui-outline-ring disabled:ui-pointer-events-none disabled:ui-opacity-50 has-data-[icon=inline-end]:ui-pr-1 has-data-[icon=inline-start]:ui-pl-1 dark:ui-text-muted-foreground dark:hover:ui-text-foreground group-data-[variant=default]/tabs-list:data-active:ui-shadow-sm group-data-[variant=line]/tabs-list:data-active:ui-shadow-none [&_svg]:ui-pointer-events-none [&_svg]:ui-shrink-0 [&_svg:not([class*='size-'])]:ui-size-4",
        "group-data-[variant=line]/tabs-list:ui-bg-transparent group-data-[variant=line]/tabs-list:data-active:ui-bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:ui-border-transparent dark:group-data-[variant=line]/tabs-list:data-active:ui-bg-transparent",
        "data-active:ui-bg-background data-active:ui-text-foreground dark:data-active:ui-border-input dark:data-active:ui-bg-input/30 dark:data-active:ui-text-foreground",
        "after:ui-absolute after:ui-bg-foreground after:ui-opacity-0 after:ui-transition-opacity group-data-horizontal/tabs:after:ui-inset-x-0 group-data-horizontal/tabs:after:ui-bottom-[-5px] group-data-horizontal/tabs:after:ui-h-0.5 group-data-vertical/tabs:after:ui-inset-y-0 group-data-vertical/tabs:after:-ui-right-1 group-data-vertical/tabs:after:ui-w-0.5 group-data-[variant=line]/tabs-list:data-active:after:ui-opacity-100",
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
      className={cn("ui-flex-1 ui-text-sm ui-outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
