"use client";

import { forwardRef, useId, type ComponentPropsWithoutRef, type InputHTMLAttributes } from "react";
import { Field } from "@base-ui/react/field";
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

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
  value: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  unit?: string;
  ticks?: readonly { value: number; label?: string }[];
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
      unit,
      ticks,
      disabled,
      name,
      required: _required,
      "aria-valuetext": ariaValueText,
      defaultValue: _defaultValue,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const displayLabel = valueLabel ?? String(value);
    const numericLabel = displayLabel.match(/^([-+−]?\d+(?:[.,]\d+)?)\s*(.*)$/);
    const displayValue = numericLabel?.[1] ?? displayLabel;
    const displayUnit = unit ?? numericLabel?.[2];
    const sliderId = id || `slider-${generatedId}`;
    const labelId = `${sliderId}-label`;
    const helperId = helperText && !error ? `${sliderId}-helper` : undefined;
    const errorId = error ? `${sliderId}-error` : undefined;
    const valueId = `${sliderId}-value`;
    const tooltipDescriptionId = tooltip ? `${sliderId}-tooltip-description` : undefined;
    const normalizedMin = typeof min === "number" ? min : min === undefined ? undefined : Number(min);
    const normalizedMax = typeof max === "number" ? max : max === undefined ? undefined : Number(max);
    const normalizedStep =
      typeof step === "number" ? step : step === undefined ? undefined : Number(step) || 1;
    const sliderProps = props as unknown as ComponentPropsWithoutRef<typeof PrototyperSliderRoot>;
    const labelledBy = [label ? labelId : undefined, sliderProps["aria-labelledby"]]
      .filter(Boolean)
      .join(" ");
    const describedBy = [sliderProps["aria-describedby"], valueId, tooltipDescriptionId, errorId, helperId]
      .filter(Boolean)
      .join(" ");

    return (
      <Field.Root invalid={Boolean(error)} className="contents">
        <PrototyperSliderRoot
          {...sliderProps}
          ref={ref}
          id={sliderId}
          min={normalizedMin}
          max={normalizedMax}
          step={normalizedStep}
          value={[value]}
          onValueChange={(nextValue) => {
            if (!disabled) onChange(Array.isArray(nextValue) ? (nextValue[0] ?? value) : nextValue);
          }}
          disabled={disabled}
          name={name}
          aria-labelledby={labelledBy || undefined}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={cn("w-full", className)}
        >
          <div className="flex items-baseline justify-between gap-3">
            {label ? (
              <div className="flex items-center gap-1.5">
                <PrototyperSliderLabel className="text-base font-semibold leading-snug text-foreground">
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
            ) : null}
            <span
              className={cn(
                "ml-auto shrink-0 font-medium text-foreground",
                numericLabel ? "font-mono text-3xl tabular-nums" : "text-base",
              )}
              aria-hidden="true"
            >
              {displayValue}
              {displayUnit ? <span className="ml-1 text-sm text-muted-foreground">{displayUnit}</span> : null}
            </span>
          </div>
          <PrototyperSliderValue id={valueId} className="sr-only">
            {() => `${displayValue}${displayUnit ? ` ${displayUnit}` : ""}`}
          </PrototyperSliderValue>
          <PrototyperSliderControl className="h-11 min-h-11">
            <PrototyperSliderTrack className="h-2 overflow-visible bg-border">
              <PrototyperSliderIndicator className="bg-primary" />
              <PrototyperSliderThumb
                className={
                  "size-11 border-0 bg-transparent shadow-none hover:border-transparent " +
                  "after:pointer-events-none after:absolute after:inset-[7px] after:rounded-full " +
                  "after:border-4 after:border-primary after:bg-[var(--bbf-wit)] after:shadow-sm " +
                  "focus-visible:focus-ring focus-within:focus-ring"
                }
                aria-label={sliderProps["aria-label"]}
                aria-labelledby={labelledBy || undefined}
                aria-describedby={describedBy || undefined}
                aria-invalid={error ? true : undefined}
                aria-valuetext={ariaValueText ?? `${valueLabel ?? value}${unit ? ` ${unit}` : ""}`}
              />
            </PrototyperSliderTrack>
          </PrototyperSliderControl>
          {ticks?.length ? (
            <div className="relative h-6 font-mono text-xs text-muted-foreground" aria-hidden="true">
              {ticks.map((tick, index) => (
                <span
                  key={tick.value}
                  className={cn(
                    "csp-range-left absolute border-t border-border pt-1",
                    index === 0
                      ? "translate-x-0"
                      : index === ticks.length - 1
                        ? "-translate-x-full"
                        : "-translate-x-1/2",
                  )}
                  data-range-pct={Math.round(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        ((tick.value - (normalizedMin ?? 0)) /
                          ((normalizedMax ?? 100) - (normalizedMin ?? 0) || 1)) *
                          100,
                      ),
                    ),
                  )}
                >
                  {tick.label ?? tick.value}
                </span>
              ))}
            </div>
          ) : null}
          {error ? (
            <p id={errorId} className="text-sm text-destructive-text">
              {error}
            </p>
          ) : null}
          {helperText && !error ? (
            <p id={helperId} className="text-sm text-muted-foreground">
              {helperText}
            </p>
          ) : null}
        </PrototyperSliderRoot>
      </Field.Root>
    );
  },
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
