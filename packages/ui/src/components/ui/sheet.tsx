"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { XIcon } from "lucide-react";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "ui:fixed ui:inset-0 ui:z-50 ui:bg-black/10 ui:duration-100 ui:supports-backdrop-filter:backdrop-blur-xs ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-closed:animate-out ui:data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "ui:fixed ui:z-50 ui:flex ui:flex-col ui:gap-4 ui:bg-popover ui:bg-clip-padding ui:text-sm ui:text-popover-foreground ui:shadow-lg ui:transition ui:duration-200 ui:ease-in-out ui:data-[side=bottom]:inset-x-0 ui:data-[side=bottom]:bottom-0 ui:data-[side=bottom]:h-auto ui:data-[side=bottom]:border-t ui:data-[side=left]:inset-y-0 ui:data-[side=left]:left-0 ui:data-[side=left]:h-full ui:data-[side=left]:w-3/4 ui:data-[side=left]:border-r ui:data-[side=right]:inset-y-0 ui:data-[side=right]:right-0 ui:data-[side=right]:h-full ui:data-[side=right]:w-3/4 ui:data-[side=right]:border-l ui:data-[side=top]:inset-x-0 ui:data-[side=top]:top-0 ui:data-[side=top]:h-auto ui:data-[side=top]:border-b ui:data-[side=left]:sm:max-w-sm ui:data-[side=right]:sm:max-w-sm ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-[side=bottom]:data-open:slide-in-from-bottom-10 ui:data-[side=left]:data-open:slide-in-from-left-10 ui:data-[side=right]:data-open:slide-in-from-right-10 ui:data-[side=top]:data-open:slide-in-from-top-10 ui:data-closed:animate-out ui:data-closed:fade-out-0 ui:data-[side=bottom]:data-closed:slide-out-to-bottom-10 ui:data-[side=left]:data-closed:slide-out-to-left-10 ui:data-[side=right]:data-closed:slide-out-to-right-10 ui:data-[side=top]:data-closed:slide-out-to-top-10",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              className="ui:absolute ui:top-3 ui:right-3"
              size="icon-sm"
            >
              <XIcon />
              <span className="ui:sr-only">Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("ui:flex ui:flex-col ui:gap-0.5 ui:p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("ui:mt-auto ui:flex ui:flex-col ui:gap-2 ui:p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "ui:font-heading ui:text-base ui:font-medium ui:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("ui:text-sm ui:text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
