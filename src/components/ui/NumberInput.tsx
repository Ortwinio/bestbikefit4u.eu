"use client";

import { forwardRef, useId } from "react";
import { NumberField } from "@base-ui/react/number-field";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/utils/cn";
import { Field } from "./Field";
import { Tooltip } from "./Tooltip";

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

function NumberInputSteppers({ label }: { label?: string }) {
  const incrementLabel = label ? `Increase ${label}` : "Increase value";
  const decrementLabel = label ? `Decrease ${label}` : "Decrease value";

  return (
    <div className="flex h-11 w-11 flex-col border-l border-[color:var(--border)] bg-[color:var(--secondary)]">
      <NumberField.Increment
        aria-label={incrementLabel}
        className="flex flex-1 items-center justify-center text-[color:var(--secondary-foreground)] transition-colors hover:bg-[color:var(--accent)] focus-visible:z-10 focus-visible:focus-ring disabled:status-disabled"
      >
        <ChevronUp className="h-4 w-4" />
      </NumberField.Increment>
      <NumberField.Decrement
        aria-label={decrementLabel}
        className="flex flex-1 items-center justify-center border-t border-[color:var(--border)] text-[color:var(--secondary-foreground)] transition-colors hover:bg-[color:var(--accent)] focus-visible:z-10 focus-visible:focus-ring disabled:status-disabled"
      >
        <ChevronDown className="h-4 w-4" />
      </NumberField.Decrement>
    </div>
  );
}

function NumberInputFieldLabel({
  label,
  tooltip,
  tooltipLabel,
  tooltipDescriptionId,
}: {
  label: string;
  tooltip?: string;
  tooltipLabel?: string;
  tooltipDescriptionId?: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <Field.Label className="flex items-center gap-2 text-sm font-medium leading-none text-[color:var(--foreground)] data-[disabled]:status-disabled data-[invalid]:text-[color:var(--danger)] select-none">
        {label}
      </Field.Label>
      {tooltip ? (
        <Tooltip
          content={tooltip}
          label={tooltipLabel ?? `${label} help`}
          descriptionId={tooltipDescriptionId}
        />
      ) : null}
    </div>
  );
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
      <Field.Root
        data-slot="field"
        className={cn("w-full", className)}
        disabled={disabled}
        invalid={Boolean(error)}
        name={name}
      >
        {label ? (
          <NumberInputFieldLabel
            label={label}
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
          <NumberField.Group className="flex items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--input)] bg-[color:var(--card)] transition-colors focus-within:border-[color:var(--ring)] focus-within:focus-field-ring">
            <div className="relative flex min-w-0 flex-1 items-stretch">
              <NumberField.Input
                ref={ref}
                aria-describedby={describedBy || undefined}
                aria-errormessage={errorId}
                aria-invalid={error ? true : undefined}
                placeholder={placeholder}
                onBlur={onBlur}
                className={cn(
                  "h-11 w-full min-w-0 bg-transparent px-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)] disabled:cursor-not-allowed disabled:text-[color:var(--muted-foreground)]",
                  unit ? "pr-10" : "pr-3",
                  inputClassName
                )}
              />
              {unit ? (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[color:var(--muted-foreground)]">
                  {unit}
                </span>
              ) : null}
            </div>
            <NumberInputSteppers label={label} />
          </NumberField.Group>
        </NumberField.Root>
        {error ? (
          <Field.Error
            match={true}
            id={errorId}
            className="mt-1 text-sm text-[color:var(--danger)]"
          >
            {error}
          </Field.Error>
        ) : null}
        {helperText && !error ? (
          <Field.Description
            id={helperId}
            className="mt-1 text-sm text-[color:var(--muted-foreground)]"
          >
            {helperText}
          </Field.Description>
        ) : null}
      </Field.Root>
    );
  }
);

NumberInput.displayName = "NumberInput";
