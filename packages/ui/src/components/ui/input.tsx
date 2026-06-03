import * as React from "react";

import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "ui:h-8 ui:w-full ui:min-w-0 ui:rounded-lg ui:border ui:border-input ui:bg-transparent ui:px-2.5 ui:py-1 ui:text-base ui:transition-colors ui:outline-none ui:file:inline-flex ui:file:h-6 ui:file:border-0 ui:file:bg-transparent ui:file:text-sm ui:file:font-medium ui:file:text-foreground ui:placeholder:text-muted-foreground ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:disabled:pointer-events-none ui:disabled:cursor-not-allowed ui:disabled:bg-input/50 ui:disabled:opacity-50 ui:aria-invalid:border-destructive ui:aria-invalid:ring-3 ui:aria-invalid:ring-destructive/20 ui:md:text-sm ui:dark:bg-input/30 ui:dark:disabled:bg-input/80 ui:dark:aria-invalid:border-destructive/50 ui:dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
