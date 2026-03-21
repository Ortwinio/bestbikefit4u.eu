"use client";

import { forwardRef, type ReactNode } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "@/utils/cn";

type SliderValue = number | readonly number[];

export const SliderRoot = forwardRef<
  HTMLDivElement,
  BaseSlider.Root.Props<SliderValue> & { className?: string; children?: ReactNode }
>(({ className, children, ...props }, ref) => (
  <BaseSlider.Root
    ref={ref}
    data-slot="slider"
    className={cn("relative flex w-full flex-col gap-2", className)}
    {...props}
  >
    {children}
  </BaseSlider.Root>
));

SliderRoot.displayName = "SliderRoot";

export const SliderLabel = forwardRef<
  HTMLDivElement,
  BaseSlider.Label.Props & { children?: ReactNode }
>(({ className, ...props }, ref) => (
  <BaseSlider.Label
    ref={ref}
    data-slot="slider-label"
    className={cn("text-sm font-medium leading-none text-[color:var(--foreground)]", className)}
    {...props}
  />
));

SliderLabel.displayName = "SliderLabel";

export const SliderValue = forwardRef<
  HTMLOutputElement,
  BaseSlider.Value.Props
>(({ className, ...props }, ref) => (
  <BaseSlider.Value
    ref={ref}
    data-slot="slider-value"
    className={cn("text-sm tabular-nums text-[color:var(--muted-foreground)]", className)}
    {...props}
  />
));

SliderValue.displayName = "SliderValue";

export const SliderControl = forwardRef<
  HTMLDivElement,
  BaseSlider.Control.Props
>(({ className, ...props }, ref) => (
  <BaseSlider.Control
    ref={ref}
    data-slot="slider-control"
    className={cn(
      "relative flex h-10 w-full items-center touch-none select-none outline-none",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
      "motion-reduce:transition-none",
      className
    )}
    {...props}
  />
));

SliderControl.displayName = "SliderControl";

export const SliderTrack = forwardRef<
  HTMLDivElement,
  BaseSlider.Track.Props
>(({ className, ...props }, ref) => (
  <BaseSlider.Track
    ref={ref}
    data-slot="slider-track"
    className={cn(
      "relative h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--muted)]",
      "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5",
      className
    )}
    {...props}
  />
));

SliderTrack.displayName = "SliderTrack";

export const SliderIndicator = forwardRef<
  HTMLDivElement,
  BaseSlider.Indicator.Props
>(({ className, ...props }, ref) => (
  <BaseSlider.Indicator
    ref={ref}
    data-slot="slider-indicator"
    className={cn(
      "absolute inset-y-0 left-0 rounded-full bg-[color:var(--primary)]",
      "transition-[width,background-color] duration-200 ease-smooth motion-reduce:transition-none",
      "data-[orientation=vertical]:inset-x-0 data-[orientation=vertical]:bottom-0 data-[orientation=vertical]:left-0 data-[orientation=vertical]:right-0",
      className
    )}
    {...props}
  />
));

SliderIndicator.displayName = "SliderIndicator";

export const SliderThumb = forwardRef<
  HTMLDivElement,
  BaseSlider.Thumb.Props
>(({ className, ...props }, ref) => (
  <BaseSlider.Thumb
    ref={ref}
    data-slot="slider-thumb"
    className={cn(
      "relative z-10 size-5 rounded-full border border-[color:var(--border)] bg-[color:var(--card)]",
      "shadow-[0_1px_1px_rgba(0,0,0,0.08),0_6px_14px_rgba(0,0,0,0.12)] outline-none",
      "transition-[transform,box-shadow,border-color] duration-150 ease-smooth",
      "hover:border-[color:var(--border-dark)]",
      "focus-visible:focus-ring focus-visible:shadow-[0_1px_1px_rgba(0,0,0,0.08),0_8px_18px_rgba(0,0,0,0.16)]",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
      "motion-safe:active:scale-[0.96] motion-reduce:transition-none",
      className
    )}
    {...props}
  />
));

SliderThumb.displayName = "SliderThumb";
