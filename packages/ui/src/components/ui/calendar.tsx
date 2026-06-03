"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "./button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "ui-group/calendar ui-bg-background ui-p-2 ui-[--cell-radius:var(--radius-md)] ui-[--cell-size:--spacing(7)] in-data-[slot=card-content]:ui-bg-transparent in-data-[slot=popover-content]:ui-bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("ui-w-fit", defaultClassNames.root),
        months: cn(
          "ui-relative ui-flex ui-flex-col ui-gap-4 md:ui-flex-row",
          defaultClassNames.months,
        ),
        month: cn("ui-flex ui-w-full ui-flex-col ui-gap-4", defaultClassNames.month),
        nav: cn(
          "ui-absolute ui-inset-x-0 ui-top-0 ui-flex ui-w-full ui-items-center ui-justify-between ui-gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "ui-size-(--cell-size) ui-p-0 ui-select-none aria-disabled:ui-opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "ui-size-(--cell-size) ui-p-0 ui-select-none aria-disabled:ui-opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "ui-flex ui-h-(--cell-size) ui-w-full ui-items-center ui-justify-center ui-px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "ui-flex ui-h-(--cell-size) ui-w-full ui-items-center ui-justify-center ui-gap-1.5 ui-text-sm ui-font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "ui-relative ui-rounded-(--cell-radius)",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "ui-absolute ui-inset-0 ui-bg-popover ui-opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "ui-font-medium ui-select-none",
          captionLayout === "label"
            ? "ui-text-sm"
            : "ui-flex ui-items-center ui-gap-1 ui-rounded-(--cell-radius) ui-text-sm [&>svg]:ui-size-3.5 [&>svg]:ui-text-muted-foreground",
          defaultClassNames.caption_label,
        ),
        month_grid: "ui-w-full ui-border-collapse",
        weekdays: cn("ui-flex", defaultClassNames.weekdays),
        weekday: cn(
          "ui-flex-1 ui-rounded-(--cell-radius) ui-text-[0.8rem] ui-font-normal ui-text-muted-foreground ui-select-none",
          defaultClassNames.weekday,
        ),
        week: cn("ui-mt-2 ui-flex ui-w-full", defaultClassNames.week),
        week_number_header: cn(
          "ui-w-(--cell-size) ui-select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "ui-text-[0.8rem] ui-text-muted-foreground ui-select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "ui-group/day ui-relative ui-aspect-square ui-h-full ui-w-full ui-rounded-(--cell-radius) ui-p-0 ui-text-center ui-select-none [&:last-child[data-selected=true]_button]:ui-rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:ui-rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:ui-rounded-l-(--cell-radius)",
          defaultClassNames.day,
        ),
        range_start: cn(
          "ui-relative ui-isolate ui-z-0 ui-rounded-l-(--cell-radius) ui-bg-muted after:ui-absolute after:ui-inset-y-0 after:ui-right-0 after:ui-w-4 after:ui-bg-muted",
          defaultClassNames.range_start,
        ),
        range_middle: cn("ui-rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "ui-relative ui-isolate ui-z-0 ui-rounded-r-(--cell-radius) ui-bg-muted after:ui-absolute after:ui-inset-y-0 after:ui-left-0 after:ui-w-4 after:ui-bg-muted",
          defaultClassNames.range_end,
        ),
        today: cn(
          "ui-rounded-(--cell-radius) ui-bg-muted ui-text-foreground data-[selected=true]:ui-rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "ui-text-muted-foreground aria-selected:ui-text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "ui-text-muted-foreground ui-opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("ui-invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("ui-size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("ui-size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("ui-size-4", className)} {...props} />
          );
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="ui-flex ui-size-(--cell-size) ui-items-center ui-justify-center ui-text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "ui-relative ui-isolate ui-z-10 ui-flex ui-aspect-square ui-size-auto ui-w-full ui-min-w-(--cell-size) ui-flex-col ui-gap-1 ui-border-0 ui-leading-none ui-font-normal group-data-[focused=true]/day:ui-relative group-data-[focused=true]/day:ui-z-10 group-data-[focused=true]/day:ui-border-ring group-data-[focused=true]/day:ui-ring-[3px] group-data-[focused=true]/day:ui-ring-ring/50 data-[range-end=true]:ui-rounded-(--cell-radius) data-[range-end=true]:ui-rounded-r-(--cell-radius) data-[range-end=true]:ui-bg-primary data-[range-end=true]:ui-text-primary-foreground data-[range-middle=true]:ui-rounded-none data-[range-middle=true]:ui-bg-muted data-[range-middle=true]:ui-text-foreground data-[range-start=true]:ui-rounded-(--cell-radius) data-[range-start=true]:ui-rounded-l-(--cell-radius) data-[range-start=true]:ui-bg-primary data-[range-start=true]:ui-text-primary-foreground data-[selected-single=true]:ui-bg-primary data-[selected-single=true]:ui-text-primary-foreground dark:hover:ui-text-foreground [&>span]:ui-text-xs [&>span]:ui-opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
