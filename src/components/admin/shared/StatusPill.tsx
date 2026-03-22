"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClassMap: Record<StatusTone, string> = {
  neutral:
    "bg-[color:color-mix(in_oklch,var(--secondary)_70%,var(--foreground)_6%)] text-[color:var(--secondary-foreground)]",
  success:
    "bg-[color:color-mix(in_oklch,var(--success)_16%,var(--secondary))] text-[color:var(--success)]",
  warning:
    "bg-[color:color-mix(in_oklch,var(--warning)_18%,var(--secondary))] text-[color:var(--warning)]",
  danger:
    "bg-[color:color-mix(in_oklch,var(--danger)_14%,var(--secondary))] text-[color:var(--danger)]",
  info:
    "bg-[color:color-mix(in_oklch,var(--primary)_14%,var(--secondary))] text-[color:var(--primary)]",
};

export function StatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        toneClassMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
