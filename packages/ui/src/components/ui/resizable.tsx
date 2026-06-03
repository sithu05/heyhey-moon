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
        "ui-flex ui-h-full ui-w-full aria-[orientation=vertical]:ui-flex-col",
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
        "ui-relative ui-flex ui-w-px ui-items-center ui-justify-center ui-bg-border ui-ring-offset-background after:ui-absolute after:ui-inset-y-0 after:ui-left-1/2 after:ui-w-1 after:-ui-translate-x-1/2 focus-visible:ui-ring-1 focus-visible:ui-ring-ring focus-visible:ui-outline-hidden aria-[orientation=horizontal]:ui-h-px aria-[orientation=horizontal]:ui-w-full aria-[orientation=horizontal]:after:ui-left-0 aria-[orientation=horizontal]:after:ui-h-1 aria-[orientation=horizontal]:after:ui-w-full aria-[orientation=horizontal]:after:ui-translate-x-0 aria-[orientation=horizontal]:after:-ui-translate-y-1/2 [&[aria-orientation=horizontal]>div]:ui-rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="ui-z-10 ui-flex ui-h-6 ui-w-1 ui-shrink-0 ui-rounded-lg ui-bg-border" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
