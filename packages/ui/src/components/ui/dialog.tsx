"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { XIcon } from "lucide-react";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "ui-fixed ui-inset-0 ui-isolate ui-z-50 ui-bg-black/10 ui-duration-100 supports-backdrop-filter:ui-backdrop-blur-xs data-open:ui-animate-in data-open:ui-fade-in-0 data-closed:ui-animate-out data-closed:ui-fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "ui-fixed ui-top-1/2 ui-left-1/2 ui-z-50 ui-grid ui-w-full ui-max-w-[calc(100%-2rem)] -ui-translate-x-1/2 -ui-translate-y-1/2 ui-gap-4 ui-rounded-xl ui-bg-popover ui-p-4 ui-text-sm ui-text-popover-foreground ui-ring-1 ui-ring-foreground/10 ui-duration-100 ui-outline-none sm:ui-max-w-sm data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="ui-absolute ui-top-2 ui-right-2"
              size="icon-sm"
            >
              <XIcon />
              <span className="ui-sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("ui-flex ui-flex-col ui-gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-ui-mx-4 -ui-mb-4 ui-flex ui-flex-col-reverse ui-gap-2 ui-rounded-b-xl ui-border-t ui-bg-muted/50 ui-p-4 sm:ui-flex-row sm:ui-justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "ui-font-heading ui-text-base ui-leading-none ui-font-medium",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "ui-text-sm ui-text-muted-foreground *:[a]:ui-underline *:[a]:ui-underline-offset-3 *:[a]:hover:ui-text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
