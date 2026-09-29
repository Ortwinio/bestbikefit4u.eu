import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type InfoBoxVariant = "primary" | "warning" | "success" | "danger" | "secondary";

const variantStyles: Record<InfoBoxVariant, string> = {
  primary:
    "border-[color:color-mix(in_oklch,oklch(var(--primary))_20%,oklch(var(--border)))] " +
    "bg-[color:color-mix(in_oklch,oklch(var(--primary))_8%,oklch(var(--card))_92%)]",
  warning:
    "border-[color:color-mix(in_oklch,oklch(var(--warning))_30%,oklch(var(--border)))] " +
    "bg-[color:color-mix(in_oklch,oklch(var(--warning))_12%,oklch(var(--card))_88%)]",
  success:
    "border-[color:color-mix(in_oklch,oklch(var(--success))_20%,oklch(var(--border)))] " +
    "bg-[color:color-mix(in_oklch,oklch(var(--success))_8%,oklch(var(--card))_92%)]",
  danger:
    "border-[color:color-mix(in_oklch,oklch(var(--danger))_20%,oklch(var(--border)))] " +
    "bg-[color:color-mix(in_oklch,oklch(var(--danger))_8%,oklch(var(--card))_92%)]",
  secondary: "border-border bg-[color:color-mix(in_oklch,oklch(var(--secondary))_88%,oklch(var(--background))_12%)]",
};

type InfoBoxProps = {
  variant?: InfoBoxVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function InfoBox({ variant = "primary", icon, children, className }: InfoBoxProps) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border p-4 text-sm", variantStyles[variant], className)}>
      {icon ? (
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>
          <div className="text-foreground">{children}</div>
        </div>
      ) : (
        <div className="text-foreground">{children}</div>
      )}
    </div>
  );
}
