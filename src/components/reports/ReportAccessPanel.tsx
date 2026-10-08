import type { Locale } from "@/i18n/config";
import { PaidBoundary } from "@/components/billing/PaidBoundary";
import { reportAccessCopy } from "@/i18n/account/reportAccess";
import { TransitionOffer } from "@/components/billing/TransitionOffer";

export function ReportAccessPanel({ locale, bikeId }: { locale: Locale; bikeId?: string }) {
  return <div className="space-y-4">
    {bikeId && <TransitionOffer locale={locale} bikeId={bikeId} />}
    <PaidBoundary locale={locale} boundary="report" bikeId={bikeId} />
  </div>;
}

export function ReportSafetyNote({ locale }: { locale: Locale }) {
  const copy = reportAccessCopy[locale];
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-bold">{copy.safetyTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.safety}</p>
    </section>
  );
}
