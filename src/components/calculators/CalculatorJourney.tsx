"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import { journeyMessages } from "@/i18n/calculators/journey";
import type { HandoffCalculator } from "@/lib/handoff/store";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";

export const calculatorJourneys: Record<"posture" | "ride", readonly HandoffCalculator[]> = {
  posture: ["saddle-height", "frame-size", "crank-length", "saddle-width", "bike-fit"],
  ride: ["tire-pressure", "gearing", "climb-planner", "power-speed", "ftp-wkg", "fuel-hydration"],
};

export function publicCalculatorHref(calculator: HandoffCalculator, locale: Locale) {
  return `/${locale}${calculator === "tire-pressure"
    ? locale === "nl" ? "/bandenspanning-calculator" : "/tire-pressure-calculator"
    : `/calculators/${calculator}`}`;
}

export function calculatorJourney(calculator: HandoffCalculator) {
  const route: "posture" | "ride" = calculatorJourneys.posture.includes(calculator) ? "posture" : "ride";
  const steps = calculatorJourneys[route];
  const index = steps.indexOf(calculator);
  return { route, steps, index, last: index === steps.length - 1,
    next: steps[index + 1] ?? calculatorJourneys[route === "posture" ? "ride" : "posture"][0] };
}

export function CalculatorJourneyHeader({ calculator, locale }: { calculator: HandoffCalculator; locale: Locale }) {
  const copy = journeyMessages[locale];
  const { entries } = usePublicHandoff(calculator);
  const { route, steps, index } = calculatorJourney(calculator);
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !active) return;
    const bounds = list.getBoundingClientRect();
    const target = active.getBoundingClientRect();
    list.scrollLeft = Math.max(0, list.scrollLeft + target.left - bounds.left - (bounds.width - target.width) / 2);
  }, [calculator, locale]);
  const label = copy.progress.replace("{route}", copy[route]).replace("{step}", String(index + 1))
    .replace("{total}", String(steps.length));
  return <nav aria-label={label} data-usability="route-progress" className="mt-4 min-w-0 space-y-2">
    <p className="text-sm font-semibold text-primary">{label}</p>
    <ol ref={listRef} className="flex max-w-full gap-2 overflow-x-auto pb-2">
      {steps.map((step, position) => <li key={step} className="shrink-0">
        <Link href={publicCalculatorHref(step, locale)} aria-current={step === calculator ? "step" : undefined}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold focus-visible:focus-ring ${
            step === calculator ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-card-foreground"}`}>
          <span aria-hidden="true" className="font-mono">{entries.some(entry => entry.calculator === step)
            ? "✓" : position + 1}</span>{copy.titles[step]}
        </Link>
      </li>)}
    </ol>
  </nav>;
}

export function CalculatorJourneyNext({ calculator, locale }: { calculator: HandoffCalculator; locale: Locale }) {
  const copy = journeyMessages[locale];
  const { next, last } = calculatorJourney(calculator);
  return <section data-usability="next-step" aria-label={copy.next}
    className="space-y-2 rounded-2xl border border-border bg-card p-4 text-card-foreground">
    <p className="text-xs font-bold uppercase tracking-wide text-primary">{last ? copy.complete : copy.next}</p>
    <h2 className="font-display text-xl font-bold">{copy.titles[next]}</h2>
    <p className="text-sm text-muted-foreground">{copy.nextHint}</p>
    <Link href={publicCalculatorHref(next, locale)} className={
      "inline-flex min-h-11 items-center rounded-full border-2 border-foreground px-4 py-2 " +
      "text-sm font-bold focus-visible:focus-ring"
    }>{copy.go.replace("{calculator}", copy.titles[next])}<span aria-hidden="true" className="ml-2">→</span></Link>
  </section>;
}
