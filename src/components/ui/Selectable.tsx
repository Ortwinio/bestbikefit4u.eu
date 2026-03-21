"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { CheckboxGroupItem } from "./CheckboxGroup";
import { RadioGroupItem } from "./RadioGroup";

type SelectableMode = "button" | "radio" | "checkbox";

export interface SelectableProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: "card" | "pill" | "segment";
  mode?: SelectableMode;
  value?: string | number;
  label?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  trailing?: ReactNode;
  fullWidth?: boolean;
}

const variantClassMap = {
  card: {
    base: "rounded-[var(--radius-lg)] border-2 p-4 text-left",
    selected:
      "border-[color:var(--primary)] bg-[color:color-mix(in_oklch,var(--card)_86%,var(--primary)_14%)] text-[color:var(--foreground)]",
    idle:
      "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover-only:hover:border-[color:color-mix(in_oklch,var(--border)_70%,var(--foreground)_30%)] hover-only:hover:bg-[color:var(--accent)]",
    semantic:
      "rounded-[var(--radius-lg)] border-2 p-4 text-left transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98] data-checked:border-[color:var(--primary)] data-checked:bg-[color:color-mix(in_oklch,var(--card)_86%,var(--primary)_14%)] data-checked:text-[color:var(--foreground)] data-unchecked:border-[color:var(--border)] data-unchecked:bg-[color:var(--card)] data-unchecked:text-[color:var(--foreground)] hover-only:hover:border-[color:color-mix(in_oklch,var(--border)_70%,var(--foreground)_30%)] hover-only:hover:bg-[color:var(--accent)]",
  },
  pill: {
    base: "rounded-full px-4 py-2 text-sm",
    selected:
      "border border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
    idle:
      "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover-only:hover:bg-[color:var(--accent)]",
    semantic:
      "rounded-full px-4 py-2 text-sm transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98] data-checked:border data-checked:border-[color:var(--primary)] data-checked:bg-[color:var(--primary)] data-checked:text-[color:var(--primary-foreground)] data-unchecked:border data-unchecked:border-[color:var(--border)] data-unchecked:bg-[color:var(--card)] data-unchecked:text-[color:var(--foreground)] hover-only:hover:bg-[color:var(--accent)]",
  },
  segment: {
    base: "rounded-[var(--radius-md)] px-4 py-3 text-sm",
    selected:
      "border border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
    idle:
      "border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover-only:hover:bg-[color:var(--accent)]",
    semantic:
      "rounded-[var(--radius-md)] px-4 py-3 text-sm transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98] data-checked:border data-checked:border-[color:var(--primary)] data-checked:bg-[color:var(--primary)] data-checked:text-[color:var(--primary-foreground)] data-unchecked:border data-unchecked:border-[color:var(--border)] data-unchecked:bg-[color:var(--secondary)] data-unchecked:text-[color:var(--secondary-foreground)] hover-only:hover:bg-[color:var(--accent)]",
  },
} as const;

export const Selectable = forwardRef<HTMLButtonElement, SelectableProps>(
  (
    {
      className,
      selected = false,
      variant = "card",
      mode = "button",
      value,
      label,
      description,
      badge,
      trailing,
      fullWidth = true,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantClasses = variantClassMap[variant];
    const semantic = mode !== "button";
    const resolvedTrailing =
      trailing ??
      (variant === "card" ? (
        <Check
          className={cn(
            "h-5 w-5 shrink-0 text-[color:var(--primary)]",
            semantic ? "opacity-0 transition-opacity group-data-checked:opacity-100" : ""
          )}
        />
      ) : null);
    const content = (
      <div
        className="flex items-start justify-between gap-3"
        data-slot="selectable-content"
      >
        <div className="min-w-0">
          {label ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{label}</span>
              {badge}
            </div>
          ) : null}
          {description ? (
            <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              {description}
            </div>
          ) : null}
          {children}
        </div>
        {resolvedTrailing}
      </div>
    );

    const sharedClassName = cn(
      "group no-highlight transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98]",
      fullWidth ? "w-full" : "",
      semantic
        ? variantClasses.semantic
        : variantClasses.base,
      semantic
        ? ""
        : selected
          ? variantClasses.selected
          : variantClasses.idle,
      !semantic && label ? "text-left" : "",
      !semantic && !label ? "font-medium" : "",
      className
    );

    if (mode === "radio" && value !== undefined) {
      const { value: _value, ...radioProps } =
        props as ComponentPropsWithoutRef<typeof RadioGroupItem>;

      return (
        <RadioGroupItem
          ref={ref as never}
          value={String(value)}
          className={sharedClassName}
          data-slot="selectable"
          {...radioProps}
        >
          {content}
        </RadioGroupItem>
      );
    }

    if (mode === "checkbox" && value !== undefined) {
      const { value: _value, ...checkboxProps } =
        props as ComponentPropsWithoutRef<typeof CheckboxGroupItem>;

      return (
        <CheckboxGroupItem
          ref={ref as never}
          value={String(value)}
          className={sharedClassName}
          data-slot="selectable"
          {...checkboxProps}
        >
          {content}
        </CheckboxGroupItem>
      );
    }

    if (label || description || badge || resolvedTrailing) {
      return (
        <button
          ref={ref}
          type={type}
          aria-pressed={selected}
          className={sharedClassName}
          data-slot="selectable"
          {...props}
        >
          {content}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={sharedClassName}
        data-slot="selectable"
        {...props}
      >
        {children}
      </button>
    );
  }
);

Selectable.displayName = "Selectable";
