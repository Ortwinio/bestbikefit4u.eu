import type { PublicCalculatorId } from "@/lib/public-calculators";
import { cn } from "@/utils/cn";

type CalculatorLogoProps = {
  calculatorId: PublicCalculatorId;
  className?: string;
};

const blueToneClassName =
  "bg-[color:color-mix(in_oklch,var(--primary)_16%,white_84%)] text-[color:color-mix(in_oklch,var(--primary)_92%,black_8%)]";

const toneClassNames: Record<PublicCalculatorId, string> = {
  "bike-fit": blueToneClassName,
  "saddle-height": blueToneClassName,
  "saddle-width": blueToneClassName,
  "frame-size": blueToneClassName,
  "crank-length": blueToneClassName,
  gearing: blueToneClassName,
  "tire-pressure": blueToneClassName,
};

function glyphForCalculator(calculatorId: PublicCalculatorId) {
  switch (calculatorId) {
    case "bike-fit":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="6" cy="17" r="2.6" />
          <circle cx="18" cy="17" r="2.6" />
          <path d="M8.2 17l3.3-7h3.1l2.3 7" />
          <path d="M10.2 10H7.6" />
          <path d="M12.5 10l2.4-2.2" />
          <path d="M10.8 7.2l.8-1.7" />
          <path d="M16.8 6.2h2.6" />
          <path d="M18.1 4.8v2.8" />
        </svg>
      );
    case "saddle-height":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 6.8c1.2-1.3 2.6-1.9 4.8-1.9 1.8 0 3.4.5 4.8 1.5-.8 1.4-2.1 2.1-4 2.1H8z" />
          <path d="M11 8.7v9.1" />
          <path d="M11 17.8H7.8" />
          <path d="M11 10.4h3.6" />
          <path d="M6.2 20.2h9.6" />
          <path d="M16.8 8.6v4.7" />
        </svg>
      );
    case "saddle-width":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4.5c3.8 0 6.7 2.2 6.7 5.2 0 2.3-1.4 4.4-3.7 6.1L12 20l-3-4.2c-2.3-1.7-3.7-3.8-3.7-6.1 0-3 2.9-5.2 6.7-5.2z" />
          <path d="M9.2 9.3c.8.8 1.7 1.1 2.8 1.1s2-.3 2.8-1.1" />
          <path d="M10.1 14.2h3.8" />
        </svg>
      );
    case "frame-size":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 17.8l5.3-9h3.7l3 9z" />
          <path d="M11.3 8.8L8.8 6.4" />
          <path d="M15 8.8l3.4-2.4" />
          <path d="M9 16.3l6-7.5" />
          <path d="M6.2 6.2l1.4-1.4" />
          <path d="M16.5 15.3l1.5 1.5" />
        </svg>
      );
    case "crank-length":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="12" r="3.4" />
          <path d="M11.5 14.5l4.9 4.9" />
          <path d="M16.4 19.4h2.9" />
          <path d="M9 8.6V4.8" />
          <path d="M7.1 12H4.5" />
          <path d="M13.6 12h2.1" />
        </svg>
      );
    case "tire-pressure":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6.4 16.8a6.7 6.7 0 1 1 11.2 0" />
          <path d="M12 10.2v3.3l2.2 1.3" />
          <path d="M17.6 16.8h2" />
          <path d="M4.4 16.8h2" />
          <path d="M12 7.3V5.1" />
          <path d="M8 20.1h8" />
        </svg>
      );
    case "gearing":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11.5" cy="12" r="3.2" />
          <path d="M11.5 4.5v2.2" />
          <path d="M11.5 17.3v2.2" />
          <path d="M4.8 12h2.3" />
          <path d="M15.8 12h2.4" />
          <path d="M6.9 7.1l1.6 1.6" />
          <path d="M14.6 14.8l1.6 1.6" />
          <path d="M16.2 7.2l-1.6 1.6" />
          <path d="M8.5 14.8l-1.6 1.6" />
          <path d="M18.8 8.1v7.8l-1.8 1.6" />
        </svg>
      );
  }
}

export function getCalculatorLogoToneClassName(calculatorId: PublicCalculatorId) {
  return toneClassNames[calculatorId];
}

export function CalculatorLogo({ calculatorId, className }: CalculatorLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border border-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_24px_-18px_rgba(15,23,42,0.45)]",
        toneClassNames[calculatorId],
        className
      )}
    >
      {glyphForCalculator(calculatorId)}
    </span>
  );
}
