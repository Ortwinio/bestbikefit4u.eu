"use client";

import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { handoffMessages } from "@/i18n/calculators/handoff";
import { dataReuseMessages } from "@/i18n/calculators/dataReuse";
import { journeyMessages } from "@/i18n/calculators/journey";
import { isProfileCalculatorField } from "../../../shared/calculatorDataScope";
import type { HandoffCalculator, HandoffField } from "@/lib/handoff/store";

export function HandoffPrefillNotice({ calculator, locale, fields }: {
  calculator: HandoffCalculator;
  locale: Locale;
  /** Only fields actually applied by the calculator, after compatibility and bounds checks. */
  fields: readonly HandoffField[];
}) {
  const copy = handoffMessages[locale];
  const { source, entries } = usePublicHandoff(calculator);
  const journey = journeyMessages[locale];
  if (!fields.length) return null;
  const profileCount = fields.filter(isProfileCalculatorField).length;
  const profileLabel = profileCount === 0 ? "lastUsed" : profileCount === fields.length ? "profile" : "profileAndLastUsed";
  const message = fields.length === 1 && fields[0] === "inseamCm" ? copy.prefillInseam
    : copy.prefill.replace("{fields}", fields.map((field) => copy.fields[field]).join(", "));
  return (
    <div role="status" data-usability="known-values" className={
      "flex items-start gap-3 rounded-2xl bg-[var(--bbf-petrol-zacht)] p-4 text-[var(--bbf-inkt)]"
    }>
      <Check size={20} className="mt-0.5 shrink-0 text-[var(--bbf-petrol)]" aria-hidden="true" />
      <div>
        <p className="font-semibold">{source === "profile" ? dataReuseMessages[locale][profileLabel] : journey.reused}</p>
        <p className="text-sm"><strong>{journey.known}: </strong>{fields.map(field => {
          const entry = entries.find(item => item.field === field);
          const value = entry?.value;
          const formatted = typeof value === "number" ? new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)
            : typeof value === "string" ? copy.values[value] ?? value : "";
          const unit = entry && !["none", "score"].includes(entry.unit)
            ? ` ${entry.unit === "teeth" ? "T" : entry.unit}` : "";
          return `${copy.fields[field]}${formatted ? ` ${formatted}${unit}` : ""}`;
        }).join(" · ")}</p>
        <button type="button" className="inline-flex min-h-11 min-w-11 items-center font-semibold underline focus-visible:focus-ring"
          onClick={event => {
            const container = event.currentTarget.closest('[data-reliability-calculator], [data-slot="configurator-layout"], main');
            const control = container?.querySelector<HTMLElement>('input[type="range"], [role="slider"], select');
            control?.focus();
            control?.scrollIntoView({ block: "center" });
          }}>{journey.edit}</button>
        <p className="mt-1 text-sm">{source === "profile"
          ? fields.map(field => copy.fields[field]).join(", ") : message}</p>
        {source === "session" && <p className="mt-1 text-sm">{copy.sessionOnly}</p>}
      </div>
    </div>
  );
}
