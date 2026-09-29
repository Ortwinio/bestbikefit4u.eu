import { useId, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface StepCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  number: number;
  title: ReactNode;
  description?: ReactNode;
}

export function StepCard({ number, title, description, children, className, ...props }: StepCardProps) {
  const headingId = `step-${useId().replace(/:/g, "")}`;
  return (
    <section
      aria-labelledby={headingId}
      {...props}
      className={cn("rounded-3xl border border-border bg-card p-5 text-card-foreground sm:p-6", className)}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--bbf-lime)] font-mono text-base font-medium text-[var(--bbf-inkt)]">
          {number}
        </span>
        <h2 id={headingId} className="font-display text-2xl font-bold leading-tight">{title}</h2>
      </div>
      {description ? <p className="mb-5 text-sm text-muted-foreground">{description}</p> : null}
      <div className="space-y-5">{children}</div>
    </section>
  );
}
