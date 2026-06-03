import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import { Separator } from "./separator";

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        "ui-group/item-group ui-flex ui-w-full ui-flex-col ui-gap-4 has-data-[size=sm]:ui-gap-2.5 has-data-[size=xs]:ui-gap-2",
        className,
      )}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("ui-my-2", className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  "ui-group/item ui-flex ui-w-full ui-flex-wrap ui-items-center ui-rounded-lg ui-border ui-text-sm ui-transition-colors ui-duration-100 ui-outline-none focus-visible:ui-border-ring focus-visible:ui-ring-[3px] focus-visible:ui-ring-ring/50 [a]:ui-transition-colors [a]:hover:ui-bg-muted",
  {
    variants: {
      variant: {
        default: "ui-border-transparent",
        outline: "ui-border-border",
        muted: "ui-border-transparent ui-bg-muted/50",
      },
      size: {
        default: "ui-gap-2.5 ui-px-3 ui-py-2.5",
        sm: "ui-gap-2.5 ui-px-3 ui-py-2.5",
        xs: "ui-gap-2 ui-px-2.5 ui-py-2 in-data-[slot=dropdown-menu-content]:ui-p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  );
}

const itemMediaVariants = cva(
  "ui-flex ui-shrink-0 ui-items-center ui-justify-center ui-gap-2 group-has-data-[slot=item-description]/item:ui-translate-y-0.5 group-has-data-[slot=item-description]/item:ui-self-start [&_svg]:ui-pointer-events-none",
  {
    variants: {
      variant: {
        default: "ui-bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:ui-size-4",
        image:
          "ui-size-10 ui-overflow-hidden ui-rounded-sm group-data-[size=sm]/item:ui-size-8 group-data-[size=xs]/item:ui-size-6 [&_img]:ui-size-full [&_img]:ui-object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "ui-flex ui-flex-1 ui-flex-col ui-gap-1 group-data-[size=xs]/item:ui-gap-0 [&+[data-slot=item-content]]:ui-flex-none",
        className,
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "ui-line-clamp-1 ui-flex ui-w-fit ui-items-center ui-gap-2 ui-text-sm ui-leading-snug ui-font-medium ui-underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "ui-line-clamp-2 ui-text-left ui-text-sm ui-leading-normal ui-font-normal ui-text-muted-foreground group-data-[size=xs]/item:ui-text-xs [&>a]:ui-underline [&>a]:ui-underline-offset-4 [&>a:hover]:ui-text-primary",
        className,
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("ui-flex ui-items-center ui-gap-2", className)}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "ui-flex ui-basis-full ui-items-center ui-justify-between ui-gap-2",
        className,
      )}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "ui-flex ui-basis-full ui-items-center ui-justify-between ui-gap-2",
        className,
      )}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
