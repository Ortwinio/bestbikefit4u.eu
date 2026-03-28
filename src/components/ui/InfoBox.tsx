import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type InfoBoxVariant = "primary" | "warning" | "success" | "danger" | "secondary";

const variantStyles: Record<InfoBoxVariant, string> = {
  primary:
    "border-[color:color-mix(in_oklch,var(--primary)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card)_92%)]",
  warning:
    "border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)]",
  success:
    "border-[color:color-mix(in_oklch,var(--success)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_8%,var(--card)_92%)]",
  danger:
    "border-[color:color-mix(in_oklch,var(--danger)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_8%,var(--card)_92%)]",
  secondary:
    "border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_88%,var(--background)_12%)]",
};

type InfoBoxProps = {
  variant?: InfoBoxVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function InfoBox({ variant = "primary", icon, children, className }: InfoBoxProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border p-4 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {icon ? (
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>
          <div className="text-[color:var(--foreground)]">{children}</div>
        </div>
      ) : (
        <div className="text-[color:var(--foreground)]">{children}</div>
      )}
    </div>
  );
}
