"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
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

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
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
      ...props
    },
    ref
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const inputId =
      id || label?.toLowerCase().replace(/\s+/g, "-") || `slider-${generatedId}`;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const tooltipDescriptionId = tooltip
      ? `${inputId}-tooltip-description`
      : undefined;
    const describedBy = [tooltipDescriptionId, errorId, helperId]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full">
        {label ? (
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <FieldLabel
              label={label}
              htmlFor={inputId}
              tooltip={tooltip}
              tooltipLabel={tooltipLabel}
              tooltipDescriptionId={tooltipDescriptionId}
              className="mb-0"
            />
            {valueLabel ? (
              <span className="text-sm font-medium text-[color:var(--muted-foreground)]">
                {valueLabel}
              </span>
            ) : null}
          </div>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(Number(event.target.value))}
          className={cn(
            "w-full accent-[color:var(--primary)]",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="mt-1 text-sm text-[color:var(--danger)]">
            {error}
          </p>
        ) : null}
        {helperText && !error ? (
          <p id={helperId} className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Slider.displayName = "Slider";
