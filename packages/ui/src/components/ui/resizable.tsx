"use client";

import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "../../lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "ui:flex ui:h-full ui:w-full ui:aria-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "ui:relative ui:flex ui:w-px ui:items-center ui:justify-center ui:bg-border ui:ring-offset-background ui:after:absolute ui:after:inset-y-0 ui:after:left-1/2 ui:after:w-1 ui:after:-translate-x-1/2 ui:focus-visible:ring-1 ui:focus-visible:ring-ring ui:focus-visible:outline-hidden ui:aria-[orientation=horizontal]:h-px ui:aria-[orientation=horizontal]:w-full ui:aria-[orientation=horizontal]:after:left-0 ui:aria-[orientation=horizontal]:after:h-1 ui:aria-[orientation=horizontal]:after:w-full ui:aria-[orientation=horizontal]:after:translate-x-0 ui:aria-[orientation=horizontal]:after:-translate-y-1/2 ui:[&[aria-orientation=horizontal]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="ui:z-10 ui:flex ui:h-6 ui:w-1 ui:shrink-0 ui:rounded-lg ui:bg-border" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
