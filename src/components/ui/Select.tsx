import { forwardRef, type SelectHTMLAttributes, useId } from "react";
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
        <select
          ref={ref}
          id={selectId}
          aria-describedby={describedBy || undefined}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm transition-colors appearance-none bg-white",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
