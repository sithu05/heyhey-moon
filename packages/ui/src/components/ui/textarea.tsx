import * as React from "react";

import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "ui:flex ui:field-sizing-content ui:min-h-16 ui:w-full ui:rounded-lg ui:border ui:border-input ui:bg-transparent ui:px-2.5 ui:py-2 ui:text-base ui:transition-colors ui:outline-none ui:placeholder:text-muted-foreground ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:disabled:cursor-not-allowed ui:disabled:bg-input/50 ui:disabled:opacity-50 ui:aria-invalid:border-destructive ui:aria-invalid:ring-3 ui:aria-invalid:ring-destructive/20 ui:md:text-sm ui:dark:bg-input/30 ui:dark:disabled:bg-input/80 ui:dark:aria-invalid:border-destructive/50 ui:dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
