import { cn } from "@/utils/cn";

type StatRowProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

export function StatRow({ label, value, className }: StatRowProps) {
  if (value === null || value === undefined) return null;

  return (
    <div className={cn("flex items-center justify-between gap-4 py-1.5", className)}>
      <dt className="text-xs text-[color:var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[color:var(--foreground)]">{value}</dd>
    </div>
  );
}
