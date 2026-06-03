import * as React from "react";
import { cva } from "class-variance-authority";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { ChevronDownIcon } from "lucide-react";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "ui-group/navigation-menu ui-relative ui-flex ui-max-w-max ui-flex-1 ui-items-center ui-justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "ui-group ui-flex ui-flex-1 ui-list-none ui-items-center ui-justify-center ui-gap-0",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("ui-relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "ui-group/navigation-menu-trigger ui-inline-flex ui-h-9 ui-w-max ui-items-center ui-justify-center ui-rounded-lg ui-px-2.5 ui-py-1.5 ui-text-sm ui-font-medium ui-transition-all ui-outline-none hover:ui-bg-muted focus:ui-bg-muted focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 focus-visible:ui-outline-1 disabled:ui-pointer-events-none disabled:ui-opacity-50 data-popup-open:ui-bg-muted/50 data-popup-open:hover:ui-bg-muted data-open:ui-bg-muted/50 data-open:hover:ui-bg-muted data-open:focus:ui-bg-muted",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "ui-group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="ui-relative ui-top-px ui-ml-1 ui-size-3 ui-transition ui-duration-300 group-data-popup-open/navigation-menu-trigger:ui-rotate-180 group-data-open/navigation-menu-trigger:ui-rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "ui-top-0 ui-left-0 ui-w-full ui-p-1 ui-ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:ui-top-full group-data-[viewport=false]/navigation-menu:ui-mt-1.5 group-data-[viewport=false]/navigation-menu:ui-overflow-hidden group-data-[viewport=false]/navigation-menu:ui-rounded-lg group-data-[viewport=false]/navigation-menu:ui-bg-popover group-data-[viewport=false]/navigation-menu:ui-text-popover-foreground group-data-[viewport=false]/navigation-menu:ui-shadow group-data-[viewport=false]/navigation-menu:ui-ring-1 group-data-[viewport=false]/navigation-menu:ui-ring-foreground/10 group-data-[viewport=false]/navigation-menu:ui-duration-300 data-[motion=from-end]:ui-slide-in-from-right-52 data-[motion=from-start]:ui-slide-in-from-left-52 data-[motion=to-end]:ui-slide-out-to-right-52 data-[motion=to-start]:ui-slide-out-to-left-52 data-[motion^=from-]:ui-animate-in data-[motion^=from-]:ui-fade-in data-[motion^=to-]:ui-animate-out data-[motion^=to-]:ui-fade-out **:data-[slot=navigation-menu-link]:focus:ui-ring-0 **:data-[slot=navigation-menu-link]:focus:ui-outline-none md:ui-absolute md:ui-w-auto group-data-[viewport=false]/navigation-menu:data-open:ui-animate-in group-data-[viewport=false]/navigation-menu:data-open:ui-fade-in-0 group-data-[viewport=false]/navigation-menu:data-open:ui-zoom-in-95 group-data-[viewport=false]/navigation-menu:data-closed:ui-animate-out group-data-[viewport=false]/navigation-menu:data-closed:ui-fade-out-0 group-data-[viewport=false]/navigation-menu:data-closed:ui-zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "ui-absolute ui-top-full ui-left-0 ui-isolate ui-z-50 ui-flex ui-justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "ui-origin-top-center ui-relative ui-mt-1.5 ui-h-(--radix-navigation-menu-viewport-height) ui-w-full ui-overflow-hidden ui-rounded-lg ui-bg-popover ui-text-popover-foreground ui-shadow ui-ring-1 ui-ring-foreground/10 ui-duration-100 md:ui-w-(--radix-navigation-menu-viewport-width) data-open:ui-animate-in data-open:ui-zoom-in-90 data-closed:ui-animate-out data-closed:ui-zoom-out-90",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "ui-flex ui-items-center ui-gap-2 ui-rounded-lg ui-p-2 ui-text-sm ui-transition-all ui-outline-none hover:ui-bg-muted focus:ui-bg-muted focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 focus-visible:ui-outline-1 in-data-[slot=navigation-menu-content]:ui-rounded-md data-active:ui-bg-muted/50 data-active:hover:ui-bg-muted data-active:focus:ui-bg-muted [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "ui-top-full ui-z-1 ui-flex ui-h-1.5 ui-items-end ui-justify-center ui-overflow-hidden data-[state=hidden]:ui-animate-out data-[state=hidden]:ui-fade-out data-[state=visible]:ui-animate-in data-[state=visible]:ui-fade-in",
        className,
      )}
      {...props}
    >
      <div className="ui-relative ui-top-[60%] ui-h-2 ui-w-2 ui-rotate-45 ui-rounded-tl-sm ui-bg-border ui-shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
