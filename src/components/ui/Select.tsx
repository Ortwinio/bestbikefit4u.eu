import { forwardRef, type ChangeEvent, type SelectHTMLAttributes, useId } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
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
        <BaseSelect.Root
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
          <BaseSelect.Trigger
            ref={ref as never}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              "flex w-full items-center justify-between rounded-[var(--radius-md)] border bg-[color:var(--card)] px-3 py-2 text-left text-sm text-[color:var(--foreground)] transition-colors",
              "focus-field-ring",
              error
                ? "border-red-500 text-red-900 invalid-field-ring"
                : "border-[color:var(--input)]",
              "disabled:bg-[color:var(--muted)] disabled:text-[color:var(--muted-foreground)] disabled:cursor-not-allowed",
              className
            )}
          >
            <BaseSelect.Value placeholder={placeholder} />
            <BaseSelect.Icon className="text-[color:var(--muted-foreground)]">
              <ChevronDown className="h-4 w-4" />
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
          <BaseSelect.Portal>
            <BaseSelect.Positioner sideOffset={6} className="z-50 outline-none">
              <BaseSelect.Popup className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--popover)] p-1 text-[color:var(--popover-foreground)] shadow-xl">
                <BaseSelect.List className="max-h-64 overflow-y-auto no-scrollbar">
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      disabled={option.disabled}
                      className={({ disabled: itemDisabled, highlighted, selected }) =>
                        cn(
                          "flex cursor-default items-center justify-between gap-3 rounded-[calc(var(--radius-md)-2px)] px-3 py-2 text-sm outline-none",
                          highlighted && "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]",
                          selected && "font-medium",
                          itemDisabled && "status-disabled"
                        )
                      }
                    >
                      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                      <BaseSelect.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </BaseSelect.ItemIndicator>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
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
