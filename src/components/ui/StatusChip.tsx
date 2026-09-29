import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface StatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  status: "ok" | "warn" | "deviation";
}

const statusStyles = {
  ok: "bg-[var(--bbf-lime)]",
  warn: "bg-[var(--bbf-warning)]",
  deviation: "bg-[var(--bbf-destructive)]",
};

export function StatusChip({ status, children, className, ...props }: StatusChipProps) {
  return <span {...props} data-status={status} className={cn("inline-flex max-w-full items-center rounded-full px-3 py-1.5 font-sans text-sm font-semibold text-[var(--bbf-inkt)]", statusStyles[status], className)}>{children}</span>;
}
