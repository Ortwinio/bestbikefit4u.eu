"use client";

import { forwardRef, type ChangeEvent, type SelectHTMLAttributes, useId } from "react";
import {
  Select as PrototyperSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/prototyper-ui/ui/select";
import { Field } from "./Field";
import { Tooltip } from "./Tooltip";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

function SelectFieldLabel({
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

function createSelectChangeEvent(value: string) {
  return {
    target: { value },
    currentTarget: { value },
  } as ChangeEvent<HTMLSelectElement>;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      tooltip,
      tooltipLabel,
      error,
      helperText,
      options,
      placeholder,
      value,
      defaultValue,
      onChange,
      id,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const selectId =
      id || label?.toLowerCase().replace(/\s+/g, "-") || `select-${generatedId}`;
    const helperId = helperText && !error ? `${selectId}-helper` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const tooltipDescriptionId = tooltip
      ? `${selectId}-tooltip-description`
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
          <SelectFieldLabel
            label={label}
            tooltip={tooltip}
            tooltipLabel={tooltipLabel}
            tooltipDescriptionId={tooltipDescriptionId}
          />
        ) : null}
        <PrototyperSelect
          items={options}
          id={selectId}
          name={props.name}
          autoComplete={props.autoComplete}
          required={props.required}
          disabled={props.disabled}
          value={typeof value === "string" ? (value === "" ? null : value) : undefined}
          defaultValue={
            typeof defaultValue === "string"
              ? defaultValue === ""
                ? null
                : defaultValue
              : undefined
          }
          onValueChange={(nextValue) => {
            onChange?.(createSelectChangeEvent((nextValue ?? "") as string));
          }}
        >
          <SelectTrigger
            ref={ref}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            className={className}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </PrototyperSelect>
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

Select.displayName = "Select";
