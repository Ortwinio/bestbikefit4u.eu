import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ResultHeroProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: ReactNode;
  variant?: "lime" | "ink";
  children?: ReactNode;
  className?: string;
}

export function ResultHero({ label, value, unit, subtext, variant = "lime", children, className }: ResultHeroProps) {
  const dark = variant === "ink";
  return (
    <section
      aria-label={label}
      className={cn(
        "min-w-0 rounded-[2rem] p-6 sm:p-8",
        dark
          ? "bg-[var(--bbf-inkt)] text-[var(--bbf-wit)] [--gauge-accent:var(--bbf-lime)]"
          : "bg-[var(--bbf-lime)] text-[var(--bbf-inkt)] [--gauge-accent:var(--bbf-petrol)]",
        className,
      )}
    >
      <dl>
        <dt className="font-sans text-base font-bold">{label}</dt>
        <dd
          className={cn(
            "mt-2 flex flex-wrap items-baseline gap-x-3 font-mono text-[clamp(3rem,7vw,6rem)] " +
              "font-medium leading-none tracking-[-0.035em]",
            dark && "text-[var(--bbf-lime)]",
          )}
        >
          <span className="min-w-0 break-words">{value}</span>
          {unit && (
            <span
              className={cn(
                "text-2xl tracking-normal",
                dark ? "text-[var(--bbf-op-donker)]" : "text-[var(--bbf-tekst)]",
              )}
            >
              {unit}
            </span>
          )}
        </dd>
      </dl>
      {subtext && (
        <div
          className={cn(
            "mt-4 font-sans text-base leading-relaxed",
            dark ? "text-[var(--bbf-op-donker)]" : "text-[var(--bbf-tekst)]",
          )}
        >
          {subtext}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
