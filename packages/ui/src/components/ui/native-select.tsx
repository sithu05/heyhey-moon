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
        "ui:group/native-select ui:relative ui:w-fit ui:has-[select:disabled]:opacity-50",
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="ui:h-8 ui:w-full ui:min-w-0 ui:appearance-none ui:rounded-lg ui:border ui:border-input ui:bg-transparent ui:py-1 ui:pr-8 ui:pl-2.5 ui:text-sm ui:transition-colors ui:outline-none ui:select-none ui:selection:bg-primary ui:selection:text-primary-foreground ui:placeholder:text-muted-foreground ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:disabled:pointer-events-none ui:disabled:cursor-not-allowed ui:aria-invalid:border-destructive ui:aria-invalid:ring-3 ui:aria-invalid:ring-destructive/20 ui:data-[size=sm]:h-7 ui:data-[size=sm]:rounded-[min(var(--radius-md),10px)] ui:data-[size=sm]:py-0.5 ui:dark:bg-input/30 ui:dark:hover:bg-input/50 ui:dark:aria-invalid:border-destructive/50 ui:dark:aria-invalid:ring-destructive/40"
        {...props}
      />
      <ChevronDownIcon
        className="ui:pointer-events-none ui:absolute ui:top-1/2 ui:right-2.5 ui:size-4 ui:-translate-y-1/2 ui:text-muted-foreground ui:select-none"
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
      className={cn("ui:bg-[Canvas] ui:text-[CanvasText]", className)}
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
      className={cn("ui:bg-[Canvas] ui:text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
