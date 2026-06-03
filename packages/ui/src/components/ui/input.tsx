import * as React from "react";

import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "ui-h-8 ui-w-full ui-min-w-0 ui-rounded-lg ui-border ui-border-input ui-bg-transparent ui-px-2.5 ui-py-1 ui-text-base ui-transition-colors ui-outline-none file:ui-inline-flex file:ui-h-6 file:ui-border-0 file:ui-bg-transparent file:ui-text-sm file:ui-font-medium file:ui-text-foreground placeholder:ui-text-muted-foreground focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 disabled:ui-pointer-events-none disabled:ui-cursor-not-allowed disabled:ui-bg-input/50 disabled:ui-opacity-50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 md:ui-text-sm dark:ui-bg-input/30 dark:disabled:ui-bg-input/80 dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
