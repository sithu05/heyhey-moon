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
        "ui-fixed ui-inset-0 ui-z-50 ui-bg-black/10 ui-duration-100 supports-backdrop-filter:ui-backdrop-blur-xs data-open:ui-animate-in data-open:ui-fade-in-0 data-closed:ui-animate-out data-closed:ui-fade-out-0",
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
          "ui-fixed ui-z-50 ui-flex ui-flex-col ui-gap-4 ui-bg-popover ui-bg-clip-padding ui-text-sm ui-text-popover-foreground ui-shadow-lg ui-transition ui-duration-200 ui-ease-in-out data-[side=bottom]:ui-inset-x-0 data-[side=bottom]:ui-bottom-0 data-[side=bottom]:ui-h-auto data-[side=bottom]:ui-border-t data-[side=left]:ui-inset-y-0 data-[side=left]:ui-left-0 data-[side=left]:ui-h-full data-[side=left]:ui-w-3/4 data-[side=left]:ui-border-r data-[side=right]:ui-inset-y-0 data-[side=right]:ui-right-0 data-[side=right]:ui-h-full data-[side=right]:ui-w-3/4 data-[side=right]:ui-border-l data-[side=top]:ui-inset-x-0 data-[side=top]:ui-top-0 data-[side=top]:ui-h-auto data-[side=top]:ui-border-b data-[side=left]:sm:ui-max-w-sm data-[side=right]:sm:ui-max-w-sm data-open:ui-animate-in data-open:ui-fade-in-0 data-[side=bottom]:data-open:ui-slide-in-from-bottom-10 data-[side=left]:data-open:ui-slide-in-from-left-10 data-[side=right]:data-open:ui-slide-in-from-right-10 data-[side=top]:data-open:ui-slide-in-from-top-10 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-[side=bottom]:data-closed:ui-slide-out-to-bottom-10 data-[side=left]:data-closed:ui-slide-out-to-left-10 data-[side=right]:data-closed:ui-slide-out-to-right-10 data-[side=top]:data-closed:ui-slide-out-to-top-10",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              className="ui-absolute ui-top-3 ui-right-3"
              size="icon-sm"
            >
              <XIcon />
              <span className="ui-sr-only">Close</span>
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
      className={cn("ui-flex ui-flex-col ui-gap-0.5 ui-p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("ui-mt-auto ui-flex ui-flex-col ui-gap-2 ui-p-4", className)}
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
        "ui-font-heading ui-text-base ui-font-medium ui-text-foreground",
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
      className={cn("ui-text-sm ui-text-muted-foreground", className)}
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
