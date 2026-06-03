"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg";
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "ui-group/avatar ui-relative ui-flex ui-size-8 ui-shrink-0 ui-rounded-full ui-select-none after:ui-absolute after:ui-inset-0 after:ui-rounded-full after:ui-border after:ui-border-border after:ui-mix-blend-darken data-[size=lg]:ui-size-10 data-[size=sm]:ui-size-6 dark:after:ui-mix-blend-lighten",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "ui-aspect-square ui-size-full ui-rounded-full ui-object-cover",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "ui-flex ui-size-full ui-items-center ui-justify-center ui-rounded-full ui-bg-muted ui-text-sm ui-text-muted-foreground group-data-[size=sm]/avatar:ui-text-xs",
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "ui-absolute ui-right-0 ui-bottom-0 ui-z-10 ui-inline-flex ui-items-center ui-justify-center ui-rounded-full ui-bg-primary ui-text-primary-foreground ui-bg-blend-color ui-ring-2 ui-ring-background ui-select-none",
        "group-data-[size=sm]/avatar:ui-size-2 group-data-[size=sm]/avatar:[&>svg]:ui-hidden",
        "group-data-[size=default]/avatar:ui-size-2.5 group-data-[size=default]/avatar:[&>svg]:ui-size-2",
        "group-data-[size=lg]/avatar:ui-size-3 group-data-[size=lg]/avatar:[&>svg]:ui-size-2",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "ui-group/avatar-group ui-flex -ui-space-x-2 *:data-[slot=avatar]:ui-ring-2 *:data-[slot=avatar]:ui-ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "ui-relative ui-flex ui-size-8 ui-shrink-0 ui-items-center ui-justify-center ui-rounded-full ui-bg-muted ui-text-sm ui-text-muted-foreground ui-ring-2 ui-ring-background group-has-data-[size=lg]/avatar-group:ui-size-10 group-has-data-[size=sm]/avatar-group:ui-size-6 [&>svg]:ui-size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:ui-size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:ui-size-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
