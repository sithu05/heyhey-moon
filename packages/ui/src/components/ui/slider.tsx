"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "ui-relative ui-flex ui-w-full ui-touch-none ui-items-center ui-select-none data-disabled:ui-opacity-50 data-vertical:ui-h-full data-vertical:ui-min-h-40 data-vertical:ui-w-auto data-vertical:ui-flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="ui-relative ui-grow ui-overflow-hidden ui-rounded-full ui-bg-muted data-horizontal:ui-h-1 data-horizontal:ui-w-full data-vertical:ui-h-full data-vertical:ui-w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="ui-absolute ui-bg-primary ui-select-none data-horizontal:ui-h-full data-vertical:ui-w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="ui-relative ui-block ui-size-3 ui-shrink-0 ui-rounded-full ui-border ui-border-ring ui-bg-white ui-ring-ring/50 ui-transition-[color,box-shadow] ui-select-none after:ui-absolute after:-ui-inset-2 hover:ui-ring-3 focus-visible:ui-ring-3 focus-visible:ui-outline-hidden active:ui-ring-3 disabled:ui-pointer-events-none disabled:ui-opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
