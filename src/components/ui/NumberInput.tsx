"use client";

import { forwardRef, useId } from "react";
import { NumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { FieldLabel } from "./FieldLabel";

export interface NumberInputProps {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  className?: string;
  inputClassName?: string;
  unit?: string;
  allowOutOfRange?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      tooltip,
      tooltipLabel,
      error,
      helperText,
      id,
      name,
      min,
      max,
      step = 1,
      placeholder,
      disabled,
      required,
      value,
      onChange,
      onBlur,
      className,
      inputClassName,
      unit,
      allowOutOfRange = true,
    },
    ref
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const inputId =
      id || label?.toLowerCase().replace(/\s+/g, "-") || `number-input-${generatedId}`;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const tooltipDescriptionId = tooltip
      ? `${inputId}-tooltip-description`
      : undefined;
    const describedBy = [tooltipDescriptionId, errorId, helperId]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("w-full", className)}>
        {label ? (
          <FieldLabel
            label={label}
            htmlFor={inputId}
            tooltip={tooltip}
            tooltipLabel={tooltipLabel}
            tooltipDescriptionId={tooltipDescriptionId}
          />
        ) : null}
        <NumberField.Root
          id={inputId}
          name={name}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          required={required}
          allowOutOfRange={allowOutOfRange}
          onValueChange={onChange}
          className="w-full"
        >
          <NumberField.Group className="relative flex items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--input)] bg-[color:var(--card)] transition-colors focus-within:border-[color:var(--ring)] focus-within:focus-field-ring">
            <NumberField.Decrement
              aria-label={label ? `Decrease ${label}` : "Decrease value"}
              className="inline-flex h-11 w-11 items-center justify-center border-r border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] transition-colors hover:bg-[color:var(--accent)] disabled:status-disabled"
            >
              <Minus className="h-4 w-4" />
            </NumberField.Decrement>
            <div className="relative flex-1">
              <NumberField.Input
                ref={ref}
                aria-describedby={describedBy || undefined}
                aria-invalid={error ? true : undefined}
                placeholder={placeholder}
                onBlur={onBlur}
                className={cn(
                  "h-11 w-full bg-transparent px-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)] disabled:cursor-not-allowed disabled:text-[color:var(--muted-foreground)]",
                  unit ? "pr-11" : "",
                  inputClassName
                )}
              />
              {unit ? (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[color:var(--muted-foreground)]">
                  {unit}
                </span>
              ) : null}
            </div>
            <NumberField.Increment
              aria-label={label ? `Increase ${label}` : "Increase value"}
              className="inline-flex h-11 w-11 items-center justify-center border-l border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] transition-colors hover:bg-[color:var(--accent)] disabled:status-disabled"
            >
              <Plus className="h-4 w-4" />
            </NumberField.Increment>
          </NumberField.Group>
        </NumberField.Root>
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

NumberInput.displayName = "NumberInput";
