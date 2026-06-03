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
        "ui:group/navigation-menu ui:relative ui:flex ui:max-w-max ui:flex-1 ui:items-center ui:justify-center",
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
        "ui:group ui:flex ui:flex-1 ui:list-none ui:items-center ui:justify-center ui:gap-0",
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
      className={cn("ui:relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "ui:group/navigation-menu-trigger ui:inline-flex ui:h-9 ui:w-max ui:items-center ui:justify-center ui:rounded-lg ui:px-2.5 ui:py-1.5 ui:text-sm ui:font-medium ui:transition-all ui:outline-none ui:hover:bg-muted ui:focus:bg-muted ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:focus-visible:outline-1 ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:data-popup-open:bg-muted/50 ui:data-popup-open:hover:bg-muted ui:data-open:bg-muted/50 ui:data-open:hover:bg-muted ui:data-open:focus:bg-muted",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "ui:group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="ui:relative ui:top-px ui:ml-1 ui:size-3 ui:transition ui:duration-300 ui:group-data-popup-open/navigation-menu-trigger:rotate-180 ui:group-data-open/navigation-menu-trigger:rotate-180"
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
        "ui:top-0 ui:left-0 ui:w-full ui:p-1 ui:ease-[cubic-bezier(0.22,1,0.36,1)] ui:group-data-[viewport=false]/navigation-menu:top-full ui:group-data-[viewport=false]/navigation-menu:mt-1.5 ui:group-data-[viewport=false]/navigation-menu:overflow-hidden ui:group-data-[viewport=false]/navigation-menu:rounded-lg ui:group-data-[viewport=false]/navigation-menu:bg-popover ui:group-data-[viewport=false]/navigation-menu:text-popover-foreground ui:group-data-[viewport=false]/navigation-menu:shadow ui:group-data-[viewport=false]/navigation-menu:ring-1 ui:group-data-[viewport=false]/navigation-menu:ring-foreground/10 ui:group-data-[viewport=false]/navigation-menu:duration-300 ui:data-[motion=from-end]:slide-in-from-right-52 ui:data-[motion=from-start]:slide-in-from-left-52 ui:data-[motion=to-end]:slide-out-to-right-52 ui:data-[motion=to-start]:slide-out-to-left-52 ui:data-[motion^=from-]:animate-in ui:data-[motion^=from-]:fade-in ui:data-[motion^=to-]:animate-out ui:data-[motion^=to-]:fade-out ui:**:data-[slot=navigation-menu-link]:focus:ring-0 ui:**:data-[slot=navigation-menu-link]:focus:outline-none ui:md:absolute ui:md:w-auto ui:group-data-[viewport=false]/navigation-menu:data-open:animate-in ui:group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 ui:group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 ui:group-data-[viewport=false]/navigation-menu:data-closed:animate-out ui:group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 ui:group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95",
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
        "ui:absolute ui:top-full ui:left-0 ui:isolate ui:z-50 ui:flex ui:justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "ui:origin-top-center ui:relative ui:mt-1.5 ui:h-(--radix-navigation-menu-viewport-height) ui:w-full ui:overflow-hidden ui:rounded-lg ui:bg-popover ui:text-popover-foreground ui:shadow ui:ring-1 ui:ring-foreground/10 ui:duration-100 ui:md:w-(--radix-navigation-menu-viewport-width) ui:data-open:animate-in ui:data-open:zoom-in-90 ui:data-closed:animate-out ui:data-closed:zoom-out-90",
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
        "ui:flex ui:items-center ui:gap-2 ui:rounded-lg ui:p-2 ui:text-sm ui:transition-all ui:outline-none ui:hover:bg-muted ui:focus:bg-muted ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:focus-visible:outline-1 ui:in-data-[slot=navigation-menu-content]:rounded-md ui:data-active:bg-muted/50 ui:data-active:hover:bg-muted ui:data-active:focus:bg-muted ui:[&_svg:not([class*='size-'])]:size-4",
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
        "ui:top-full ui:z-1 ui:flex ui:h-1.5 ui:items-end ui:justify-center ui:overflow-hidden ui:data-[state=hidden]:animate-out ui:data-[state=hidden]:fade-out ui:data-[state=visible]:animate-in ui:data-[state=visible]:fade-in",
        className,
      )}
      {...props}
    >
      <div className="ui:relative ui:top-[60%] ui:h-2 ui:w-2 ui:rotate-45 ui:rounded-tl-sm ui:bg-border ui:shadow-md" />
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
