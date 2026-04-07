"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SelectableProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: "card" | "pill" | "segment";
  mode?: "button";
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
    selected: "border-primary bg-primary text-primary-foreground",
    idle:
      "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover-only:hover:border-[color:color-mix(in_oklch,var(--border)_70%,var(--foreground)_30%)] hover-only:hover:bg-[color:var(--accent)]",
  },
  pill: {
    base: "rounded-full px-4 py-2 text-sm",
    selected:
      "border border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
    idle:
      "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover-only:hover:bg-[color:var(--accent)]",
  },
  segment: {
    base: "rounded-[var(--radius-md)] px-4 py-3 text-sm",
    selected:
      "border border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
    idle:
      "border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover-only:hover:bg-[color:var(--accent)]",
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
      trailing ??
      (variant === "card" ? (
        <Check
          className={cn(
            "h-5 w-5 shrink-0",
            selected ? "text-primary-foreground" : "text-[color:var(--primary)]"
          )}
        />
      ) : null);

    const content = (
      <div className="flex items-start justify-between gap-3" data-slot="selectable-content">
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
                selected
                  ? "text-primary-foreground/80"
                  : "text-[color:var(--muted-foreground)]"
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

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
          "group no-highlight transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98]",
          fullWidth ? "w-full" : "",
          variantClasses.base,
          selected ? variantClasses.selected : variantClasses.idle,
          label ? "text-left" : "font-medium",
          className
        )}
        data-slot="selectable"
        {...props}
      >
        {content}
      </button>
    );
  }
);

Selectable.displayName = "Selectable";
