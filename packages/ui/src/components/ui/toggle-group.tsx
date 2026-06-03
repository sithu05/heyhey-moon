"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "ui-group/toggle-group ui-flex ui-w-fit ui-flex-row ui-items-center ui-gap-[--spacing(var(--gap))] ui-rounded-lg data-[size=sm]:ui-rounded-[min(var(--radius-md),10px)] data-vertical:ui-flex-col data-vertical:ui-items-stretch",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "ui-shrink-0 group-data-[spacing=0]/toggle-group:ui-rounded-none group-data-[spacing=0]/toggle-group:ui-px-2 focus:ui-z-10 focus-visible:ui-z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:ui-pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:ui-pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:ui-rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:ui-rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:ui-rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:ui-rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:ui-border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:ui-border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:ui-border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:ui-border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
