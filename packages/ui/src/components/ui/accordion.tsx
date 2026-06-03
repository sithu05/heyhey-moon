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
      className={cn("ui:flex ui:w-full ui:flex-col", className)}
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
      className={cn("ui:not-last:border-b", className)}
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
    <AccordionPrimitive.Header className="ui:flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "ui:group/accordion-trigger ui:relative ui:flex ui:flex-1 ui:items-start ui:justify-between ui:rounded-lg ui:border ui:border-transparent ui:py-2.5 ui:text-left ui:text-sm ui:font-medium ui:transition-all ui:outline-none ui:hover:underline ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:focus-visible:after:border-ring ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:**:data-[slot=accordion-trigger-icon]:ml-auto ui:**:data-[slot=accordion-trigger-icon]:size-4 ui:**:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="ui:pointer-events-none ui:shrink-0 ui:group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="ui:pointer-events-none ui:hidden ui:shrink-0 ui:group-aria-expanded/accordion-trigger:inline"
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
      className="ui:overflow-hidden ui:text-sm ui:data-open:animate-accordion-down ui:data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "ui:h-(--radix-accordion-content-height) ui:pt-0 ui:pb-2.5 ui:[&_a]:underline ui:[&_a]:underline-offset-3 ui:[&_a]:hover:text-foreground ui:[&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
