"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { Button } from "./button";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "ui-fixed ui-inset-0 ui-z-50 ui-bg-black/10 ui-duration-100 supports-backdrop-filter:ui-backdrop-blur-xs data-open:ui-animate-in data-open:ui-fade-in-0 data-closed:ui-animate-out data-closed:ui-fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm";
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "ui-group/alert-dialog-content ui-fixed ui-top-1/2 ui-left-1/2 ui-z-50 ui-grid ui-w-full -ui-translate-x-1/2 -ui-translate-y-1/2 ui-gap-4 ui-rounded-xl ui-bg-popover ui-p-4 ui-text-popover-foreground ui-ring-1 ui-ring-foreground/10 ui-duration-100 ui-outline-none data-[size=default]:ui-max-w-xs data-[size=sm]:ui-max-w-xs data-[size=default]:sm:ui-max-w-sm data-open:ui-animate-in data-open:ui-fade-in-0 data-open:ui-zoom-in-95 data-closed:ui-animate-out data-closed:ui-fade-out-0 data-closed:ui-zoom-out-95",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "ui-grid ui-grid-rows-[auto_1fr] ui-place-items-center ui-gap-1.5 ui-text-center has-data-[slot=alert-dialog-media]:ui-grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:ui-gap-x-4 sm:group-data-[size=default]/alert-dialog-content:ui-place-items-start sm:group-data-[size=default]/alert-dialog-content:ui-text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:ui-grid-rows-[auto_1fr]",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "-ui-mx-4 -ui-mb-4 ui-flex ui-flex-col-reverse ui-gap-2 ui-rounded-b-xl ui-border-t ui-bg-muted/50 ui-p-4 group-data-[size=sm]/alert-dialog-content:ui-grid group-data-[size=sm]/alert-dialog-content:ui-grid-cols-2 sm:ui-flex-row sm:ui-justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "ui-mb-2 ui-inline-flex ui-size-10 ui-items-center ui-justify-center ui-rounded-md ui-bg-muted sm:group-data-[size=default]/alert-dialog-content:ui-row-span-2 *:[svg:not([class*='size-'])]:ui-size-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "ui-font-heading ui-text-base ui-font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:ui-col-start-2",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "ui-text-sm ui-text-balance ui-text-muted-foreground md:ui-text-pretty *:[a]:ui-underline *:[a]:ui-underline-offset-3 *:[a]:hover:ui-text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
