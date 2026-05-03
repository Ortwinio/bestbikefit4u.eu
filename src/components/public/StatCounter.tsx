import { cn } from "@/utils/cn";

type StatCounterProps = {
  value: string;
  label: string;
  align?: "center" | "start";
  className?: string;
};

export function StatCounter({ value, label, align = "center", className }: StatCounterProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      <span className="text-3xl font-bold tracking-tight text-[color:var(--primary)]">
        {value}
      </span>
      <span className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
        {label}
      </span>
    </div>
  );
}
