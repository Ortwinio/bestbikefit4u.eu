"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { journeyMessages } from "@/i18n/calculators/journey";
import { handoffMessages } from "@/i18n/calculators/handoff";
import type { HandoffCalculator } from "@/lib/handoff/store";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { CalculatorJourneyNext } from "./CalculatorJourney";

export const SHOWN_REASONS_KEY = "bbf.calculator-reasons.v1";
const noSubscribe = () => () => undefined;
const serverVisible = () => true;

export function handoffLoginHref(calculator: HandoffCalculator, locale: Locale) {
  const query = new URLSearchParams({ src: calculator, handoff: "1" });
  return withLocalePrefix(`/login?${query}`, locale);
}

function shownReasons(): string[] {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(SHOWN_REASONS_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}

export function PersonalizeAdviceBlock({ calculator, locale, onSave, reasonValue }: {
  calculator: HandoffCalculator;
  locale: Locale;
  onSave?: () => void;
  reasonValue?: string;
}) {
  const copy = journeyMessages[locale];
  const reason = copy.reasons[calculator];
  const { source, ready } = usePublicHandoff(calculator);
  const section = useRef<HTMLElement>(null);
  const getSnapshot = useMemo(() => {
    let visible: boolean | undefined;
    return () => visible ??= !shownReasons().includes(calculator);
  }, [calculator]);
  const visible = useSyncExternalStore(noSubscribe, getSnapshot, serverVisible);

  useEffect(() => {
    const element = section.current;
    if (!ready || !visible || !getSnapshot() || !element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      try { sessionStorage.setItem(SHOWN_REASONS_KEY, JSON.stringify([...new Set([...shownReasons(), calculator])])); }
      catch { return; }
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [calculator, visible, ready, getSnapshot]);

  return <div className="mt-4 space-y-3" data-slot="personalize-advice">
    {visible && <section ref={section} data-usability="account-reason" data-reason-id={calculator}
      aria-label={copy.reasonTitle}
      className="space-y-3 rounded-2xl bg-[var(--bbf-lime-zacht)] p-4 text-[var(--bbf-inkt)]">
      <p className="text-xs font-bold uppercase tracking-wide">{copy.account}</p>
      <p className="font-semibold leading-snug">
        {reasonValue && <>{copy.currentRange.replace("{range}", reasonValue)}{" "}</>}{reason.text}
      </p>
      <Link href={handoffLoginHref(calculator, locale)} onClick={onSave} className={
        "inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--bbf-inkt)] px-5 py-3 " +
        "text-center font-bold text-[var(--bbf-wit)] focus-visible:focus-ring"
      }>{reason.cta}</Link>
      <p className="text-sm">{copy.carry}</p>
      {source === "session" && <p className="text-xs">{handoffMessages[locale].sessionOnly}</p>}
    </section>}
    <CalculatorJourneyNext calculator={calculator} locale={locale} />
  </div>;
}
