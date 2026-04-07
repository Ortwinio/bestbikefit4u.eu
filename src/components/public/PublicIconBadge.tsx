import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PublicIconBadgeProps = {
  children: ReactNode;
  className?: string;
  size?: "md" | "lg";
};

const sizeClassName = {
  md: "h-10 w-10 rounded-full [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-14 w-14 rounded-[var(--radius-xl)] [&_svg]:h-6 [&_svg]:w-6",
};

export function PublicIconBadge({
  children,
  className,
  size = "md",
}: PublicIconBadgeProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_80%,var(--background)_20%)] text-[color:var(--primary)] shadow-sm",
        sizeClassName[size],
        className
      )}
    >
      {children}
    </div>
  );
}
