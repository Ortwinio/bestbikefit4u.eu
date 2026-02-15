import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@/utils/cn";
import { FieldLabel } from "./FieldLabel";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
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
      <div className="w-full">
        {label && (
          <FieldLabel
            label={label}
            htmlFor={inputId}
            tooltip={tooltip}
            tooltipLabel={tooltipLabel}
            tooltipDescriptionId={tooltipDescriptionId}
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={describedBy || undefined}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
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

Input.displayName = "Input";
