"use client";

import { forwardRef, type TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/utils/cn";
import { FieldLabel } from "./FieldLabel";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const textareaId =
      id || label?.toLowerCase().replace(/\s+/g, "-") || `textarea-${generatedId}`;
    const helperId = helperText && !error ? `${textareaId}-helper` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const tooltipDescriptionId = tooltip
      ? `${textareaId}-tooltip-description`
      : undefined;
    const describedBy = [ariaDescribedBy, tooltipDescriptionId, errorId, helperId]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full">
        {label ? (
          <FieldLabel
            label={label}
            htmlFor={textareaId}
            tooltip={tooltip}
            tooltipLabel={tooltipLabel}
            tooltipDescriptionId={tooltipDescriptionId}
          />
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full rounded-[var(--radius-md)] border bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--foreground)] transition-colors resize-none",
            "focus-field-ring",
            error
              ? "border-[color:var(--danger)] text-[color:var(--foreground)] invalid-field-ring"
              : "border-[color:var(--input)]",
            "placeholder:text-[color:var(--muted-foreground)] disabled:bg-[color:var(--muted)] disabled:text-[color:var(--muted-foreground)] disabled:cursor-not-allowed",
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

Textarea.displayName = "Textarea";
