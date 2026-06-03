import * as React from "react";

import { cn } from "../../lib/utils";
import { ChevronDownIcon } from "lucide-react";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "ui-group/native-select ui-relative ui-w-fit has-[select:disabled]:ui-opacity-50",
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="ui-h-8 ui-w-full ui-min-w-0 ui-appearance-none ui-rounded-lg ui-border ui-border-input ui-bg-transparent ui-py-1 ui-pr-8 ui-pl-2.5 ui-text-sm ui-transition-colors ui-outline-none ui-select-none selection:ui-bg-primary selection:ui-text-primary-foreground placeholder:ui-text-muted-foreground focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 disabled:ui-pointer-events-none disabled:ui-cursor-not-allowed aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 data-[size=sm]:ui-h-7 data-[size=sm]:ui-rounded-[min(var(--radius-md),10px)] data-[size=sm]:ui-py-0.5 dark:ui-bg-input/30 dark:hover:ui-bg-input/50 dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40"
        {...props}
      />
      <ChevronDownIcon
        className="ui-pointer-events-none ui-absolute ui-top-1/2 ui-right-2.5 ui-size-4 -ui-translate-y-1/2 ui-text-muted-foreground ui-select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("ui-bg-[Canvas] ui-text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("ui-bg-[Canvas] ui-text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
