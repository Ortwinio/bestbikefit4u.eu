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
    base: "min-h-11 rounded-2xl border-2 p-4 text-left",
    selected:
      "border-[var(--bbf-petrol)] bg-[var(--bbf-lime-zacht)] text-[var(--bbf-inkt)]",
    idle:
      "border-border bg-card text-foreground hover-only:hover:border-[var(--bbf-petrol)]",
    semantic:
      "min-h-11 rounded-2xl border-2 p-4 text-left transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98] data-checked:border-[var(--bbf-petrol)] data-checked:bg-[var(--bbf-lime-zacht)] data-checked:text-[var(--bbf-inkt)] data-unchecked:border-border data-unchecked:bg-card data-unchecked:text-foreground hover-only:hover:border-[var(--bbf-petrol)]",
  },
  pill: {
    base: "rounded-full px-4 py-2 text-sm",
    selected:
      "border border-primary bg-primary text-primary-foreground",
    idle:
      "border border-border bg-card text-foreground",
    semantic:
      "rounded-full px-4 py-2 text-sm transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98] data-checked:border data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-unchecked:border data-unchecked:border-border data-unchecked:bg-card data-unchecked:text-foreground",
  },
  segment: {
    base: "rounded-[var(--radius-md)] px-4 py-3 text-sm",
    selected:
      "border border-primary bg-primary text-primary-foreground",
    idle:
      "border border-border bg-secondary text-secondary-foreground",
    semantic:
      "rounded-[var(--radius-md)] px-4 py-3 text-sm transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98] data-checked:border data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-unchecked:border data-unchecked:border-border data-unchecked:bg-secondary data-unchecked:text-secondary-foreground",
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
          aria-hidden="true"
          className={cn(
            "h-5 w-5 shrink-0",
            semantic
              ? "text-[var(--bbf-petrol)] opacity-0 transition-opacity group-data-checked:opacity-100"
              : selected
                ? "text-[var(--bbf-petrol)]"
                : "text-primary opacity-0"
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
            <div
              className={cn(
                "mt-1 text-sm",
                semantic
                  ? variant === "card" ? "text-muted-foreground group-data-checked:text-[var(--bbf-tekst)]" : "text-muted-foreground group-data-checked:text-primary-foreground/80"
                  : selected
                    ? variant === "card" ? "text-[var(--bbf-tekst)]" : "text-primary-foreground/80"
                    : "text-muted-foreground"
              )}
            >
              {description}
            </div>
          ) : null}
          {children}
        </div>
        {resolvedTrailing}
      </div>
    );

    const sharedClassName = cn(
      "group min-h-11 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 no-highlight transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98]",
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
