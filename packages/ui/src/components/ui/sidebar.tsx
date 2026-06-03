"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { PanelLeftIcon } from "lucide-react";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "ui-group/sidebar-wrapper ui-flex ui-min-h-svh ui-w-full has-data-[variant=inset]:ui-bg-sidebar",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "ui-flex ui-h-full ui-w-(--sidebar-width) ui-flex-col ui-bg-sidebar ui-text-sidebar-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="ui-w-(--sidebar-width) ui-bg-sidebar ui-p-0 ui-text-sidebar-foreground [&>button]:ui-hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="ui-sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="ui-flex ui-h-full ui-w-full ui-flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="ui-group ui-peer ui-hidden ui-text-sidebar-foreground md:ui-block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "ui-relative ui-w-(--sidebar-width) ui-bg-transparent ui-transition-[width] ui-duration-200 ui-ease-linear",
          "group-data-[collapsible=offcanvas]:ui-w-0",
          "group-data-[side=right]:ui-rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:ui-w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:ui-w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "ui-fixed ui-inset-y-0 ui-z-10 ui-hidden ui-h-svh ui-w-(--sidebar-width) ui-transition-[left,right,width] ui-duration-200 ui-ease-linear data-[side=left]:ui-left-0 data-[side=left]:group-data-[collapsible=offcanvas]:ui-left-[calc(var(--sidebar-width)*-1)] data-[side=right]:ui-right-0 data-[side=right]:group-data-[collapsible=offcanvas]:ui-right-[calc(var(--sidebar-width)*-1)] md:ui-flex",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "ui-p-2 group-data-[collapsible=icon]:ui-w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:ui-w-(--sidebar-width-icon) group-data-[side=left]:ui-border-r group-data-[side=right]:ui-border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="ui-flex ui-size-full ui-flex-col ui-bg-sidebar group-data-[variant=floating]:ui-rounded-lg group-data-[variant=floating]:ui-shadow-sm group-data-[variant=floating]:ui-ring-1 group-data-[variant=floating]:ui-ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="ui-sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "ui-absolute ui-inset-y-0 ui-z-20 ui-hidden ui-w-4 ui-transition-all ui-ease-linear group-data-[side=left]:-ui-right-4 group-data-[side=right]:ui-left-0 after:ui-absolute after:ui-inset-y-0 after:ui-start-1/2 after:ui-w-[2px] hover:after:ui-bg-sidebar-border sm:ui-flex ltr:-ui-translate-x-1/2 rtl:-ui-translate-x-1/2",
        "in-data-[side=left]:ui-cursor-w-resize in-data-[side=right]:ui-cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:ui-cursor-e-resize [[data-side=right][data-state=collapsed]_&]:ui-cursor-w-resize",
        "group-data-[collapsible=offcanvas]:ui-translate-x-0 group-data-[collapsible=offcanvas]:after:ui-left-full hover:group-data-[collapsible=offcanvas]:ui-bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-ui-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-ui-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "ui-relative ui-flex ui-w-full ui-flex-1 ui-flex-col ui-bg-background md:peer-data-[variant=inset]:ui-m-2 md:peer-data-[variant=inset]:ui-ml-0 md:peer-data-[variant=inset]:ui-rounded-xl md:peer-data-[variant=inset]:ui-shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ui-ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("ui-h-8 ui-w-full ui-bg-background ui-shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("ui-flex ui-flex-col ui-gap-2 ui-p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("ui-flex ui-flex-col ui-gap-2 ui-p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("ui-mx-2 ui-w-auto ui-bg-sidebar-border", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "ui-no-scrollbar ui-flex ui-min-h-0 ui-flex-1 ui-flex-col ui-gap-0 ui-overflow-auto group-data-[collapsible=icon]:ui-overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("ui-relative ui-flex ui-w-full ui-min-w-0 ui-flex-col ui-p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "ui-flex ui-h-8 ui-shrink-0 ui-items-center ui-rounded-md ui-px-2 ui-text-xs ui-font-medium ui-text-sidebar-foreground/70 ui-ring-sidebar-ring ui-outline-hidden ui-transition-[margin,opacity] ui-duration-200 ui-ease-linear group-data-[collapsible=icon]:-ui-mt-8 group-data-[collapsible=icon]:ui-opacity-0 focus-visible:ui-ring-2 [&>svg]:ui-size-4 [&>svg]:ui-shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "ui-absolute ui-top-3.5 ui-right-3 ui-flex ui-aspect-square ui-w-5 ui-items-center ui-justify-center ui-rounded-md ui-p-0 ui-text-sidebar-foreground ui-ring-sidebar-ring ui-outline-hidden ui-transition-transform group-data-[collapsible=icon]:ui-hidden after:ui-absolute after:-ui-inset-2 hover:ui-bg-sidebar-accent hover:ui-text-sidebar-accent-foreground focus-visible:ui-ring-2 md:after:ui-hidden [&>svg]:ui-size-4 [&>svg]:ui-shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("ui-w-full ui-text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("ui-flex ui-w-full ui-min-w-0 ui-flex-col ui-gap-0", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("ui-group/menu-item ui-relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "ui-peer/menu-button ui-group/menu-button ui-flex ui-w-full ui-items-center ui-gap-2 ui-overflow-hidden ui-rounded-md ui-p-2 ui-text-left ui-text-sm ui-ring-sidebar-ring ui-outline-hidden ui-transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:ui-pr-8 group-data-[collapsible=icon]:ui-size-8! group-data-[collapsible=icon]:ui-p-2! hover:ui-bg-sidebar-accent hover:ui-text-sidebar-accent-foreground focus-visible:ui-ring-2 active:ui-bg-sidebar-accent active:ui-text-sidebar-accent-foreground disabled:ui-pointer-events-none disabled:ui-opacity-50 aria-disabled:ui-pointer-events-none aria-disabled:ui-opacity-50 data-open:hover:ui-bg-sidebar-accent data-open:hover:ui-text-sidebar-accent-foreground data-active:ui-bg-sidebar-accent data-active:ui-font-medium data-active:ui-text-sidebar-accent-foreground [&_svg]:ui-size-4 [&_svg]:ui-shrink-0 [&>span:last-child]:ui-truncate",
  {
    variants: {
      variant: {
        default: "hover:ui-bg-sidebar-accent hover:ui-text-sidebar-accent-foreground",
        outline:
          "ui-bg-background ui-shadow-[0_0_0_1px_var(--sidebar-border)] hover:ui-bg-sidebar-accent hover:ui-text-sidebar-accent-foreground hover:ui-shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "ui-h-8 ui-text-sm",
        sm: "ui-h-7 ui-text-xs",
        lg: "ui-h-12 ui-text-sm group-data-[collapsible=icon]:ui-p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "ui-absolute ui-top-1.5 ui-right-1 ui-flex ui-aspect-square ui-w-5 ui-items-center ui-justify-center ui-rounded-md ui-p-0 ui-text-sidebar-foreground ui-ring-sidebar-ring ui-outline-hidden ui-transition-transform group-data-[collapsible=icon]:ui-hidden peer-hover/menu-button:ui-text-sidebar-accent-foreground peer-data-[size=default]/menu-button:ui-top-1.5 peer-data-[size=lg]/menu-button:ui-top-2.5 peer-data-[size=sm]/menu-button:ui-top-1 after:ui-absolute after:-ui-inset-2 hover:ui-bg-sidebar-accent hover:ui-text-sidebar-accent-foreground focus-visible:ui-ring-2 md:after:ui-hidden [&>svg]:ui-size-4 [&>svg]:ui-shrink-0",
        showOnHover &&
          "group-focus-within/menu-item:ui-opacity-100 group-hover/menu-item:ui-opacity-100 peer-data-active/menu-button:ui-text-sidebar-accent-foreground aria-expanded:ui-opacity-100 md:ui-opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "ui-pointer-events-none ui-absolute ui-right-1 ui-flex ui-h-5 ui-min-w-5 ui-items-center ui-justify-center ui-rounded-md ui-px-1 ui-text-xs ui-font-medium ui-text-sidebar-foreground ui-tabular-nums ui-select-none group-data-[collapsible=icon]:ui-hidden peer-hover/menu-button:ui-text-sidebar-accent-foreground peer-data-[size=default]/menu-button:ui-top-1.5 peer-data-[size=lg]/menu-button:ui-top-2.5 peer-data-[size=sm]/menu-button:ui-top-1 peer-data-active/menu-button:ui-text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  });

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("ui-flex ui-h-8 ui-items-center ui-gap-2 ui-rounded-md ui-px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="ui-size-4 ui-rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="ui-h-4 ui-max-w-(--skeleton-width) ui-flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "ui-mx-3.5 ui-flex ui-min-w-0 ui-translate-x-px ui-flex-col ui-gap-1 ui-border-l ui-border-sidebar-border ui-px-2.5 ui-py-0.5 group-data-[collapsible=icon]:ui-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("ui-group/menu-sub-item ui-relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "ui-flex ui-h-7 ui-min-w-0 -ui-translate-x-px ui-items-center ui-gap-2 ui-overflow-hidden ui-rounded-md ui-px-2 ui-text-sidebar-foreground ui-ring-sidebar-ring ui-outline-hidden group-data-[collapsible=icon]:ui-hidden hover:ui-bg-sidebar-accent hover:ui-text-sidebar-accent-foreground focus-visible:ui-ring-2 active:ui-bg-sidebar-accent active:ui-text-sidebar-accent-foreground disabled:ui-pointer-events-none disabled:ui-opacity-50 aria-disabled:ui-pointer-events-none aria-disabled:ui-opacity-50 data-[size=md]:ui-text-sm data-[size=sm]:ui-text-xs data-active:ui-bg-sidebar-accent data-active:ui-text-sidebar-accent-foreground [&>span:last-child]:ui-truncate [&>svg]:ui-size-4 [&>svg]:ui-shrink-0 [&>svg]:ui-text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
