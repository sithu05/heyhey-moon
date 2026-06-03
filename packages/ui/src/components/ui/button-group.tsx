import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import { Separator } from "./separator";

const buttonGroupVariants = cva(
  "ui:group/button-group ui:flex ui:w-fit ui:items-stretch ui:*:focus-visible:relative ui:*:focus-visible:z-10 ui:has-[>[data-slot=button-group]]:gap-2 ui:has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg ui:[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit ui:[&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "ui:[&>*:not(:first-child)]:rounded-l-none ui:[&>*:not(:first-child)]:border-l-0 ui:[&>*:not(:last-child)]:rounded-r-none ui:[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
        vertical:
          "ui:flex-col ui:[&>*:not(:first-child)]:rounded-t-none ui:[&>*:not(:first-child)]:border-t-0 ui:[&>*:not(:last-child)]:rounded-b-none ui:[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
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
        "ui:flex ui:items-center ui:gap-2 ui:rounded-lg ui:border ui:bg-muted ui:px-2.5 ui:text-sm ui:font-medium ui:[&_svg]:pointer-events-none ui:[&_svg:not([class*='size-'])]:size-4",
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
        "ui:relative ui:self-stretch ui:bg-input ui:data-horizontal:mx-px ui:data-horizontal:w-auto ui:data-vertical:my-px ui:data-vertical:h-auto",
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
