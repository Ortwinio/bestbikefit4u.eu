"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SelectableProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: "card" | "pill" | "segment";
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
      "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:border-[color:color-mix(in_oklch,var(--border)_70%,var(--foreground)_30%)] hover:bg-[color:var(--accent)]",
  },
  pill: {
    base: "rounded-full px-4 py-2 text-sm",
    selected:
      "border border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
    idle:
      "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--accent)]",
  },
  segment: {
    base: "rounded-[var(--radius-md)] px-4 py-3 text-sm",
    selected:
      "border border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
    idle:
      "border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--accent)]",
  },
} as const;

export const Selectable = forwardRef<HTMLButtonElement, SelectableProps>(
  (
    {
      className,
      selected = false,
      variant = "card",
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
    const resolvedTrailing =
      trailing ?? (selected && variant === "card" ? <Check className="h-5 w-5 shrink-0 text-[color:var(--primary)]" /> : null);

    if (label || description || badge || resolvedTrailing) {
      return (
        <button
          ref={ref}
          type={type}
          aria-pressed={selected}
          className={cn(
            "transition-colors",
            fullWidth ? "w-full" : "",
            variantClasses.base,
            selected ? variantClasses.selected : variantClasses.idle,
            className
          )}
          {...props}
        >
          <div className="flex items-start justify-between gap-3">
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
        </button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
          "font-medium transition-colors",
          fullWidth ? "w-full" : "",
          variantClasses.base,
          selected ? variantClasses.selected : variantClasses.idle,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Selectable.displayName = "Selectable";
