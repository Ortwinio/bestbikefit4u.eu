"use client";

import { Button } from "@/components/ui";
import { advicePageCopy } from "@/i18n/account/advicePage";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function AdviceError({ reset }: { reset: () => void }) {
  const { locale } = useDashboardMessages();
  const copy = advicePageCopy[locale];
  return <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
    <h1 className="font-display text-3xl font-bold">{copy.title}</h1>
    <p role="alert">{copy.error}</p><Button onClick={reset}>{copy.retry}</Button>
  </section>;
}
