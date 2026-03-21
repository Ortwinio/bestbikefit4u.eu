"use client";

import { forwardRef, type TextareaHTMLAttributes, useId } from "react";
import { Tooltip } from "./Tooltip";
import { Field } from "./Field";
import { cn } from "@/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
  error?: string;
  helperText?: string;
}

function TextareaFieldLabel({
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
      <Field.Label
        className="flex items-center gap-2 text-sm font-medium leading-none text-[color:var(--foreground)] data-[disabled]:status-disabled data-[invalid]:text-[color:var(--danger)] select-none"
      >
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
      <Field.Root
        data-slot="field"
        className="w-full"
        disabled={props.disabled}
        invalid={Boolean(error)}
        name={props.name}
      >
        {label ? (
          <TextareaFieldLabel
            label={label}
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

Textarea.displayName = "Textarea";
