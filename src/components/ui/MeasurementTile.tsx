import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type MeasurementTileProps = {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  status?: ReactNode;
  className?: string;
};

export function MeasurementTile({ label, value, unit, status, className }: MeasurementTileProps) {
  if (value === null || value === undefined) return null;

  return (
    <div className={cn("min-w-0 rounded-3xl border border-border bg-card p-5 text-card-foreground", className)}>
      <dl>
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-2 flex flex-wrap items-baseline gap-x-2 font-mono text-[2.125rem] font-medium leading-tight">
          <span className="break-words">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </dd>
      </dl>
      {status && <div className="mt-3 font-sans text-sm text-muted-foreground">{status}</div>}
    </div>
  );
}
