"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "../../lib/utils";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "ui-fixed ui-inset-0 ui-z-50 ui-bg-black/10 supports-backdrop-filter:ui-backdrop-blur-xs data-open:ui-animate-in data-open:ui-fade-in-0 data-closed:ui-animate-out data-closed:ui-fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "ui-group/drawer-content ui-fixed ui-z-50 ui-flex ui-h-auto ui-flex-col ui-bg-popover ui-text-sm ui-text-popover-foreground data-[vaul-drawer-direction=bottom]:ui-inset-x-0 data-[vaul-drawer-direction=bottom]:ui-bottom-0 data-[vaul-drawer-direction=bottom]:ui-mt-24 data-[vaul-drawer-direction=bottom]:ui-max-h-[80vh] data-[vaul-drawer-direction=bottom]:ui-rounded-t-xl data-[vaul-drawer-direction=bottom]:ui-border-t data-[vaul-drawer-direction=left]:ui-inset-y-0 data-[vaul-drawer-direction=left]:ui-left-0 data-[vaul-drawer-direction=left]:ui-w-3/4 data-[vaul-drawer-direction=left]:ui-rounded-r-xl data-[vaul-drawer-direction=left]:ui-border-r data-[vaul-drawer-direction=right]:ui-inset-y-0 data-[vaul-drawer-direction=right]:ui-right-0 data-[vaul-drawer-direction=right]:ui-w-3/4 data-[vaul-drawer-direction=right]:ui-rounded-l-xl data-[vaul-drawer-direction=right]:ui-border-l data-[vaul-drawer-direction=top]:ui-inset-x-0 data-[vaul-drawer-direction=top]:ui-top-0 data-[vaul-drawer-direction=top]:ui-mb-24 data-[vaul-drawer-direction=top]:ui-max-h-[80vh] data-[vaul-drawer-direction=top]:ui-rounded-b-xl data-[vaul-drawer-direction=top]:ui-border-b data-[vaul-drawer-direction=left]:sm:ui-max-w-sm data-[vaul-drawer-direction=right]:sm:ui-max-w-sm",
          className,
        )}
        {...props}
      >
        <div className="ui-mx-auto ui-mt-4 ui-hidden ui-h-1 ui-w-[100px] ui-shrink-0 ui-rounded-full ui-bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:ui-block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "ui-flex ui-flex-col ui-gap-0.5 ui-p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:ui-text-center group-data-[vaul-drawer-direction=top]/drawer-content:ui-text-center md:ui-gap-0.5 md:ui-text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("ui-mt-auto ui-flex ui-flex-col ui-gap-2 ui-p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "ui-font-heading ui-text-base ui-font-medium ui-text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("ui-text-sm ui-text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
