"use client";

import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toolsPressureMessages } from "@/i18n/account/toolsPressure";

export default function PressureError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useDashboardMessages();
  const copy = toolsPressureMessages[locale];
  return (
    <section role="alert" className="rounded-3xl border border-border bg-card p-6">
      <h1 className="font-display text-3xl font-bold">{copy.error}</h1>
      <p className="mt-3 text-muted-foreground">{copy.errorDescription}</p>
      <Button onClick={reset} className="mt-5">
        {copy.retry}
      </Button>
    </section>
  );
}
