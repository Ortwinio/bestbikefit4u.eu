import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SectionHeaderProps = {
  icon?: ReactNode;        // e.g. <User className="h-5 w-5 text-[color:var(--primary)]" />
  title: string;
  action?: ReactNode;      // e.g. an Edit button
  className?: string;
  border?: boolean;        // adds border-b (default true)
};

export function SectionHeader({
  icon,
  title,
  action,
  className,
  border = true,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-4",
        border && "border-b border-[color:var(--border)]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-[color:var(--foreground)]">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
