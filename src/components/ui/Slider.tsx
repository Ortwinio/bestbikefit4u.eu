"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "@/utils/cn";
import { FieldLabel } from "./FieldLabel";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
  value: number;
  onChange: (value: number) => void;
  valueLabel?: string;
}

function SliderRoot({
  className,
  children,
  ...props
}: BaseSlider.Root.Props & { className?: string; children?: ReactNode }) {
  return (
    <BaseSlider.Root
      data-slot="slider"
      className={cn("relative flex w-full flex-col gap-2", className)}
      {...props}
    >
      {children}
    </BaseSlider.Root>
  );
}

function SliderControl({
  className,
  ...props
}: BaseSlider.Control.Props) {
  return (
    <BaseSlider.Control
      data-slot="slider-control"
      className={cn(
        "relative flex h-10 w-full items-center touch-none select-none outline-none",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

function SliderTrack({
  className,
  ...props
}: BaseSlider.Track.Props) {
  return (
    <BaseSlider.Track
      data-slot="slider-track"
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--muted)]",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5",
        className
      )}
      {...props}
    />
  );
}

function SliderIndicator({
  className,
  ...props
}: BaseSlider.Indicator.Props) {
  return (
    <BaseSlider.Indicator
      data-slot="slider-indicator"
      className={cn(
        "absolute inset-y-0 left-0 rounded-full bg-[color:var(--primary)]",
        "transition-[width,background-color] duration-200 ease-smooth motion-reduce:transition-none",
        "data-[orientation=vertical]:inset-x-0 data-[orientation=vertical]:bottom-0 data-[orientation=vertical]:left-0 data-[orientation=vertical]:right-0",
        className
      )}
      {...props}
    />
  );
}

function SliderThumb({
  className,
  ...props
}: BaseSlider.Thumb.Props) {
  return (
    <BaseSlider.Thumb
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
  );
}

function SliderOutput({
  className,
  id,
  ...props
}: BaseSlider.Value.Props) {
  return (
    <BaseSlider.Value
      data-slot="slider-output"
      id={id}
      className={cn("text-sm tabular-nums text-[color:var(--muted-foreground)]", className)}
      {...props}
    />
  );
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      label,
      tooltip,
      tooltipLabel,
      error,
      helperText,
      id,
      min,
      max,
      step,
      value,
      onChange,
      valueLabel,
      disabled,
      name,
      required,
      defaultValue: _defaultValue,
      ...props
    },
    ref
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const sliderId = id || label?.toLowerCase().replace(/\s+/g, "-") || `slider-${generatedId}`;
    const labelId = `${sliderId}-label`;
    const helperId = helperText && !error ? `${sliderId}-helper` : undefined;
    const errorId = error ? `${sliderId}-error` : undefined;
    const valueId = `${sliderId}-value`;
    const tooltipDescriptionId = tooltip ? `${sliderId}-tooltip-description` : undefined;
    const normalizedMin = typeof min === "number" ? min : min === undefined ? undefined : Number(min);
    const normalizedMax = typeof max === "number" ? max : max === undefined ? undefined : Number(max);
    const normalizedStep =
      typeof step === "number"
        ? step
        : step === undefined
          ? undefined
          : Number(step) || 1;
    const sliderProps = props as unknown as BaseSlider.Root.Props;
    const labelledBy = [label ? labelId : undefined, sliderProps["aria-labelledby"]]
      .filter(Boolean)
      .join(" ");
    const describedBy = [sliderProps["aria-describedby"], valueId, tooltipDescriptionId, errorId, helperId]
      .filter(Boolean)
      .join(" ");

    return (
      <SliderRoot
        {...sliderProps}
        ref={ref}
        id={sliderId}
        min={normalizedMin}
        max={normalizedMax}
        step={normalizedStep}
        value={[value]}
        onValueChange={(nextValue) => {
          onChange(Array.isArray(nextValue) ? nextValue[0] ?? value : nextValue);
        }}
        disabled={disabled}
        name={name}
        aria-labelledby={labelledBy || undefined}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        className={cn("w-full", className)}
      >
        {label ? (
          <div className="flex items-center justify-between gap-3">
            <div id={labelId}>
              <FieldLabel
                label={label}
                tooltip={tooltip}
                tooltipLabel={tooltipLabel}
                tooltipDescriptionId={tooltipDescriptionId}
                className="mb-0"
              />
            </div>
            {valueLabel ? (
              <span className="text-sm font-medium tabular-nums text-[color:var(--muted-foreground)]">
                {valueLabel}
              </span>
            ) : null}
          </div>
        ) : null}
        <SliderOutput id={valueId} className="sr-only" />
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb aria-describedby={describedBy || undefined} />
          </SliderTrack>
        </SliderControl>
        {error ? (
          <p id={errorId} className="text-sm text-[color:var(--danger)]">
            {error}
          </p>
        ) : null}
        {helperText && !error ? (
          <p id={helperId} className="text-sm text-[color:var(--muted-foreground)]">
            {helperText}
          </p>
        ) : null}
      </SliderRoot>
    );
  }
);

Slider.displayName = "Slider";

SliderRoot.displayName = "SliderRoot";
SliderControl.displayName = "SliderControl";
SliderTrack.displayName = "SliderTrack";
SliderIndicator.displayName = "SliderIndicator";
SliderThumb.displayName = "SliderThumb";
SliderOutput.displayName = "SliderOutput";

export {
  SliderRoot,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
  SliderOutput,
};
