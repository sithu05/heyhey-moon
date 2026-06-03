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
        "ui:relative ui:flex ui:w-full ui:touch-none ui:items-center ui:select-none ui:data-disabled:opacity-50 ui:data-vertical:h-full ui:data-vertical:min-h-40 ui:data-vertical:w-auto ui:data-vertical:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="ui:relative ui:grow ui:overflow-hidden ui:rounded-full ui:bg-muted ui:data-horizontal:h-1 ui:data-horizontal:w-full ui:data-vertical:h-full ui:data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="ui:absolute ui:bg-primary ui:select-none ui:data-horizontal:h-full ui:data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="ui:relative ui:block ui:size-3 ui:shrink-0 ui:rounded-full ui:border ui:border-ring ui:bg-white ui:ring-ring/50 ui:transition-[color,box-shadow] ui:select-none ui:after:absolute ui:after:-inset-2 ui:hover:ring-3 ui:focus-visible:ring-3 ui:focus-visible:outline-hidden ui:active:ring-3 ui:disabled:pointer-events-none ui:disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
