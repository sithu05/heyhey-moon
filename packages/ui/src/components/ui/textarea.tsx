import * as React from "react";

import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "ui-flex ui-field-sizing-content ui-min-h-16 ui-w-full ui-rounded-lg ui-border ui-border-input ui-bg-transparent ui-px-2.5 ui-py-2 ui-text-base ui-transition-colors ui-outline-none placeholder:ui-text-muted-foreground focus-visible:ui-border-ring focus-visible:ui-ring-3 focus-visible:ui-ring-ring/50 disabled:ui-cursor-not-allowed disabled:ui-bg-input/50 disabled:ui-opacity-50 aria-invalid:ui-border-destructive aria-invalid:ui-ring-3 aria-invalid:ui-ring-destructive/20 md:ui-text-sm dark:ui-bg-input/30 dark:disabled:ui-bg-input/80 dark:aria-invalid:ui-border-destructive/50 dark:aria-invalid:ui-ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
