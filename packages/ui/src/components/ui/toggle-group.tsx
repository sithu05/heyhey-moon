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
        "ui:group/toggle-group ui:flex ui:w-fit ui:flex-row ui:items-center ui:gap-[--spacing(var(--gap))] ui:rounded-lg ui:data-[size=sm]:rounded-[min(var(--radius-md),10px)] ui:data-vertical:flex-col ui:data-vertical:items-stretch",
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
        "ui:shrink-0 ui:group-data-[spacing=0]/toggle-group:rounded-none ui:group-data-[spacing=0]/toggle-group:px-2 ui:focus:z-10 ui:focus-visible:z-10 ui:group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 ui:group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 ui:group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg ui:group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg ui:group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg ui:group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg ui:group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 ui:group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 ui:group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l ui:group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
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
