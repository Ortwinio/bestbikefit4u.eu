import { cn } from "@/utils/cn";

type MeasurementTileProps = {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  className?: string;
};

export function MeasurementTile({ label, value, unit, className }: MeasurementTileProps) {
  if (value === null || value === undefined) return null;

  return (
    <div
      className={cn(
        "bg-[color:var(--surface-secondary)] rounded-[var(--radius-md)] px-4 py-3",
        className
      )}
    >
      <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-[color:var(--foreground)]">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-[color:var(--muted-foreground)]">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
