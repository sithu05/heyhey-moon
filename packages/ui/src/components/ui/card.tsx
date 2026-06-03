import * as React from "react";

import { cn } from "../../lib/utils";

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "ui-group/card ui-flex ui-flex-col ui-gap-4 ui-overflow-hidden ui-rounded-xl ui-bg-card ui-py-4 ui-text-sm ui-text-card-foreground ui-ring-1 ui-ring-foreground/10 has-data-[slot=card-footer]:ui-pb-0 has-[>img:first-child]:ui-pt-0 data-[size=sm]:ui-gap-3 data-[size=sm]:ui-py-3 data-[size=sm]:has-data-[slot=card-footer]:ui-pb-0 *:[img:first-child]:ui-rounded-t-xl *:[img:last-child]:ui-rounded-b-xl",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "ui-group/card-header ui-@container/card-header ui-grid ui-auto-rows-min ui-items-start ui-gap-1 ui-rounded-t-xl ui-px-4 group-data-[size=sm]/card:ui-px-3 has-data-[slot=card-action]:ui-grid-cols-[1fr_auto] has-data-[slot=card-description]:ui-grid-rows-[auto_auto] [.border-b]:ui-pb-4 group-data-[size=sm]/card:[.border-b]:ui-pb-3",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "ui-font-heading ui-text-base ui-leading-snug ui-font-medium group-data-[size=sm]/card:ui-text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("ui-text-sm ui-text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "ui-col-start-2 ui-row-span-2 ui-row-start-1 ui-self-start ui-justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("ui-px-4 group-data-[size=sm]/card:ui-px-3", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "ui-flex ui-items-center ui-rounded-b-xl ui-border-t ui-bg-muted/50 ui-p-4 group-data-[size=sm]/card:ui-p-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
