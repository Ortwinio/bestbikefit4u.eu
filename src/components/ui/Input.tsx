"use client";

import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { Input as PrototyperInput } from "@/components/prototyper-ui/ui/input";
import { Field } from "./Field";
import { Tooltip } from "./Tooltip";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
}

function InputFieldLabel({
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      tooltip,
      tooltipLabel,
      error,
      helperText,
      id,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const inputId =
      id || label?.toLowerCase().replace(/\s+/g, "-") || `input-${generatedId}`;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const tooltipDescriptionId = tooltip
      ? `${inputId}-tooltip-description`
      : undefined;
    const describedBy = [ariaDescribedBy, tooltipDescriptionId, errorId, helperId]
      .filter(Boolean)
      .join(" ");

    return (
      <Field.Root
        data-slot="field"
        className="w-full"
        disabled={props.disabled}
        invalid={Boolean(error)}
        name={props.name}
      >
        {label ? (
          <InputFieldLabel
            label={label}
            tooltip={tooltip}
            tooltipLabel={tooltipLabel}
            tooltipDescriptionId={tooltipDescriptionId}
          />
        ) : null}
        <PrototyperInput
          ref={ref}
          id={inputId}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={className}
          {...props}
        />
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

Input.displayName = "Input";
