import { forwardRef, type ChangeEvent, type SelectHTMLAttributes, useId } from "react";
import {
  Select as PrototyperSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/prototyper-ui/ui/select";
import { cn } from "@/utils/cn";
import { FieldLabel } from "./FieldLabel";

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

function createSelectChangeEvent(value: string) {
  return {
    target: { value },
    currentTarget: { value },
  } as ChangeEvent<HTMLSelectElement>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
      <div className="w-full">
        {label && (
          <FieldLabel
            label={label}
            htmlFor={selectId}
            tooltip={tooltip}
            tooltipLabel={tooltipLabel}
            tooltipDescriptionId={tooltipDescriptionId}
          />
        )}
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
            ref={ref as never}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              "flex w-full items-center justify-between rounded-[var(--radius-md)] border bg-[color:var(--card)] px-3 py-2 text-left text-sm text-[color:var(--foreground)] transition-colors",
              "focus-field-ring",
              error
                ? "border-[color:var(--danger)] text-[color:var(--foreground)] invalid-field-ring"
                : "border-[color:var(--input)]",
              "disabled:bg-[color:var(--muted)] disabled:text-[color:var(--muted-foreground)] disabled:cursor-not-allowed",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            sideOffset={6}
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--popover)] p-1 text-[color:var(--popover-foreground)] shadow-xl"
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="flex cursor-default items-center justify-between gap-3 rounded-[calc(var(--radius-md)-2px)] px-3 py-2 text-sm outline-none data-highlighted:bg-[color:var(--accent)] data-highlighted:text-[color:var(--accent-foreground)] data-disabled:status-disabled"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </PrototyperSelect>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-[color:var(--danger)]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
