import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PublicMetricPanelProps = {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  accent?: "primary" | "success" | "warning";
  className?: string;
};

const accentStyles = {
  primary:
    "border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card)_92%)]",
  success:
    "border-[color:color-mix(in_oklch,var(--success)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_8%,var(--card)_92%)]",
  warning:
    "border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)]",
} as const;

export function PublicMetricPanel({
  label,
  value,
  description,
  icon,
  accent = "primary",
  className,
}: PublicMetricPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border p-4 sm:p-5",
        accentStyles[accent],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
            {label}
          </p>
          <div className="text-balance text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2rem]">
            {value}
          </div>
          {description ? (
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--background)_40%,transparent)] text-[color:var(--primary)]">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
