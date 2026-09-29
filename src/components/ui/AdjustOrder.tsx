import { useId, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface AdjustOrderProps {
  title?: string;
  steps: readonly { title: ReactNode; description?: ReactNode }[];
  className?: string;
}

export function AdjustOrder({ title = "Pas in deze volgorde aan", steps, className }: AdjustOrderProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cn("rounded-3xl border border-border bg-card p-6 text-card-foreground", className)}>
      <h2 id={titleId} className="font-display text-2xl font-bold">{title}</h2>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => <li key={index} className="flex items-start gap-3">
          <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--bbf-petrol-zacht)] font-mono text-sm text-[var(--bbf-petrol-hover)]">{index + 1}</span>
          <div className="min-w-0 font-sans text-base leading-relaxed">
            <div>{step.title}</div>
            {step.description && <div className="mt-1 text-sm text-muted-foreground">{step.description}</div>}
          </div>
        </li>)}
      </ol>
    </section>
  );
}
