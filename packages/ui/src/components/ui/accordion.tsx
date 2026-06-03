"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("ui-flex ui-w-full ui-flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:ui-border-b", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="ui-flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "ui-group/accordion-trigger ui-relative ui-flex ui-flex-1 ui-items-start ui-justify-between ui-rounded-lg ui-border ui-border-transparent ui-py-2.5 ui-text-left ui-text-sm ui-font-medium ui-transition-all ui-outline-none hover:ui-underline focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 focus-visible:after:ui-border-ring disabled:ui-pointer-events-none disabled:ui-opacity-50 **:data-[slot=accordion-trigger-icon]:ui-ml-auto **:data-[slot=accordion-trigger-icon]:ui-size-4 **:data-[slot=accordion-trigger-icon]:ui-text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="ui-pointer-events-none ui-shrink-0 group-aria-expanded/accordion-trigger:ui-hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="ui-pointer-events-none ui-hidden ui-shrink-0 group-aria-expanded/accordion-trigger:ui-inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="ui-overflow-hidden ui-text-sm data-open:ui-animate-accordion-down data-closed:ui-animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "ui-h-(--radix-accordion-content-height) ui-pt-0 ui-pb-2.5 [&_a]:ui-underline [&_a]:ui-underline-offset-3 [&_a]:hover:ui-text-foreground [&_p:not(:last-child)]:ui-mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
