"use client";

import { forwardRef, useId, type ComponentPropsWithoutRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { Tooltip } from "./Tooltip";
import {
  SliderControl as PrototyperSliderControl,
  SliderIndicator as PrototyperSliderIndicator,
  SliderLabel as PrototyperSliderLabel,
  SliderRoot as PrototyperSliderRoot,
  SliderThumb as PrototyperSliderThumb,
  SliderTrack as PrototyperSliderTrack,
  SliderValue as PrototyperSliderValue,
} from "@/components/prototyper-ui/ui/slider";

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
    const sliderProps = props as unknown as ComponentPropsWithoutRef<
      typeof PrototyperSliderRoot
    >;
    const labelledBy = [label ? labelId : undefined, sliderProps["aria-labelledby"]]
      .filter(Boolean)
      .join(" ");
    const describedBy = [sliderProps["aria-describedby"], valueId, tooltipDescriptionId, errorId, helperId]
      .filter(Boolean)
      .join(" ");

    return (
      <PrototyperSliderRoot
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
            <div id={labelId} className="flex items-center gap-1.5">
              <PrototyperSliderLabel className="text-sm font-medium leading-none text-[color:var(--foreground)]">
                {label}
              </PrototyperSliderLabel>
              {tooltip ? (
                <Tooltip
                  content={tooltip}
                  label={tooltipLabel ?? `${label} help`}
                  descriptionId={tooltipDescriptionId}
                />
              ) : null}
            </div>
            {valueLabel ? (
              <span className="text-sm font-medium tabular-nums text-[color:var(--muted-foreground)]">
                {valueLabel}
              </span>
            ) : null}
          </div>
        ) : null}
        <PrototyperSliderValue id={valueId} className="sr-only" />
        <PrototyperSliderControl>
          <PrototyperSliderTrack>
            <PrototyperSliderIndicator />
            <PrototyperSliderThumb aria-describedby={describedBy || undefined} />
          </PrototyperSliderTrack>
        </PrototyperSliderControl>
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
      </PrototyperSliderRoot>
    );
  }
);

Slider.displayName = "Slider";

export {
  PrototyperSliderControl as SliderControl,
  PrototyperSliderIndicator as SliderIndicator,
  PrototyperSliderLabel as SliderLabel,
  PrototyperSliderRoot as SliderRoot,
  PrototyperSliderThumb as SliderThumb,
  PrototyperSliderTrack as SliderTrack,
  PrototyperSliderValue as SliderOutput,
  PrototyperSliderValue as SliderValue,
};
