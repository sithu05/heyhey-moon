import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import { Separator } from "./separator";

const buttonGroupVariants = cva(
  "ui-group/button-group ui-flex ui-w-fit ui-items-stretch *:focus-visible:ui-relative *:focus-visible:ui-z-10 has-[>[data-slot=button-group]]:ui-gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:ui-rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:ui-w-fit [&>input]:ui-flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:ui-rounded-l-none [&>*:not(:first-child)]:ui-border-l-0 [&>*:not(:last-child)]:ui-rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:ui-rounded-r-lg!",
        vertical:
          "ui-flex-col [&>*:not(:first-child)]:ui-rounded-t-none [&>*:not(:first-child)]:ui-border-t-0 [&>*:not(:last-child)]:ui-rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:ui-rounded-b-lg!",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      className={cn(
        "ui-flex ui-items-center ui-gap-2 ui-rounded-lg ui-border ui-bg-muted ui-px-2.5 ui-text-sm ui-font-medium [&_svg]:ui-pointer-events-none [&_svg:not([class*='size-'])]:ui-size-4",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "ui-relative ui-self-stretch ui-bg-input data-horizontal:ui-mx-px data-horizontal:ui-w-auto data-vertical:ui-my-px data-vertical:ui-h-auto",
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
