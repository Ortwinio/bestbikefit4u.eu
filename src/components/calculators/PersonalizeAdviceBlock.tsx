"use client";

import Link from "next/link";
import { useId } from "react";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { handoffMessages } from "@/i18n/calculators/handoff";
import type { HandoffCalculator, HandoffEntry } from "@/lib/handoff/store";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";

export function handoffLoginHref(calculator: HandoffCalculator, locale: Locale) {
  const query = new URLSearchParams({ src: calculator, handoff: "1" });
  return withLocalePrefix(`/login?${query}`, locale);
}

function entryValue(entry: HandoffEntry, locale: Locale) {
  const copy = handoffMessages[locale];
  if (typeof entry.value === "string") {
    return (copy.values as Record<string, string>)[entry.value] ?? entry.value;
  }
  const value = new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    maximumFractionDigits: 2,
  }).format(entry.value);
  const unit = entry.unit === "none" || entry.unit === "score" ? "" : entry.unit === "teeth" ? "T" : entry.unit;
  return unit ? `${value} ${unit}` : value;
}

export function PersonalizeAdviceBlock({ calculator, locale }: {
  calculator: HandoffCalculator;
  locale: Locale;
}) {
  const copy = handoffMessages[locale];
  const specific = copy.calculators[calculator];
  const { entries, retention } = usePublicHandoff(calculator);
  const titleId = useId();
  const benefits = [
    [copy.benefits.savedTitle, copy.benefits.savedBody],
    [copy.benefits.betterTitle, specific.betterBody],
    [specific.nextTitle, specific.nextBody],
  ];
  return (
    <section
      aria-labelledby={titleId}
      data-slot="personalize-advice"
      className="grid min-w-0 overflow-hidden rounded-[32px] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
    >
      <div className="flex min-w-0 flex-col gap-[18px] bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)] sm:p-9">
        <p className="text-sm font-bold tracking-[0.08em] text-[var(--bbf-lime)] uppercase">{copy.eyebrow}</p>
        <h2 id={titleId} className="font-display text-3xl font-bold leading-tight text-[var(--bbf-wit)]">
          {copy.title}
        </h2>
        <p className="text-lg leading-relaxed text-[var(--bbf-op-donker)]">{specific.headline}</p>
        <ul className="flex flex-col gap-3">
          {benefits.map(([title, body]) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--bbf-lime)]">
                <Check size={14} strokeWidth={3} className="text-[var(--bbf-inkt)]" aria-hidden="true" />
              </span>
              <span><strong>{title}</strong>{" "}<span className="text-[var(--bbf-op-donker)]">{body}</span></span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex min-w-0 flex-col gap-4 bg-[var(--bbf-lime-zacht)] p-6 text-[var(--bbf-inkt)] sm:p-9">
        <h3 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]" aria-live="polite">
          {entries.length >= 3 ? copy.count.replace("{count}", String(entries.length)) : copy.carryTitle}
        </h3>
        {entries.length ? (
          <ul className="flex min-w-0 flex-col gap-2">
            {entries.map((entry) => {
              const unknown = entry.method === "declared"
                && ["heightCm", "inseamCm", "sitBoneWidthMm"].includes(entry.field);
              const method = unknown ? "unknown" : entry.method;
              return (
                <li key={entry.field} className={
                  "flex flex-wrap items-center justify-between gap-2 rounded-[14px] " +
                  "bg-[var(--bbf-wit)] px-4 py-3"
                }>
                  <span className="min-w-0 break-words">
                    {copy.fields[entry.field]}{entry.calculator !== calculator ? ` (${copy.previous})` : ""}
                  </span>
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="break-words font-mono">{entryValue(entry, locale)}</span>
                    <span className={
                      "rounded-full px-2 py-1 text-xs font-semibold text-[var(--bbf-inkt)] " +
                      (method === "estimated" || method === "unknown"
                        ? "bg-[var(--bbf-warning)]" : "bg-[var(--bbf-petrol-zacht)]")
                    }>{copy.methods[method]}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <p className="rounded-[14px] bg-[var(--bbf-wit)] px-4 py-3">{copy.empty}</p>}
        <Link
          href={handoffLoginHref(calculator, locale)}
          className={
            "inline-flex min-h-13 items-center justify-center self-start rounded-full bg-[var(--bbf-inkt)] " +
            "px-5 py-3 text-center font-bold text-[var(--bbf-wit)] focus-visible:focus-ring"
          }
        >{copy.cta}</Link>
        <p className="text-sm leading-relaxed">{copy.reassurance}</p>
        <p className="text-sm leading-relaxed" aria-live="polite">
          {retention === "persistent" ? copy.persistentRetention : copy.sessionOnly}
        </p>
      </div>
    </section>
  );
}
