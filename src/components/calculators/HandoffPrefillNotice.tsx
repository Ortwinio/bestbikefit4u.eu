"use client";

import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { handoffMessages } from "@/i18n/calculators/handoff";
import type { HandoffCalculator, HandoffField } from "@/lib/handoff/store";

export function HandoffPrefillNotice({ calculator, locale, fields }: {
  calculator: HandoffCalculator;
  locale: Locale;
  /** Only fields actually applied by the calculator, after compatibility and bounds checks. */
  fields: readonly HandoffField[];
}) {
  const copy = handoffMessages[locale];
  const { retention } = usePublicHandoff(calculator);
  if (!fields.length) return null;
  const message = fields.length === 1 && fields[0] === "inseamCm" ? copy.prefillInseam
    : copy.prefill.replace("{fields}", fields.map((field) => copy.fields[field]).join(", "));
  return (
    <div role="status" className={
      "flex items-start gap-3 rounded-2xl bg-[var(--bbf-petrol-zacht)] p-4 text-[var(--bbf-inkt)]"
    }>
      <Check size={20} className="mt-0.5 shrink-0 text-[var(--bbf-petrol)]" aria-hidden="true" />
      <div><p className="font-semibold">{message}</p><p className="mt-1 text-sm">{retention === "persistent" ? copy.persistentRetention : copy.sessionOnly}</p></div>
    </div>
  );
}
