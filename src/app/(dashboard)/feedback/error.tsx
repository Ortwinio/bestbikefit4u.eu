"use client";
import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toolsFeedback } from "@/i18n/account/toolsFeedback";

export default function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useDashboardMessages();
  const copy = toolsFeedback[locale];
  return (
    <section role="alert" className="space-y-5 rounded-3xl border border-border bg-card p-6">
      <h1 className="font-display text-3xl font-bold">{copy.error}</h1>
      <Button onClick={reset}>{copy.retry}</Button>
    </section>
  );
}
