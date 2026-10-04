import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { reportAccessCopy } from "@/i18n/account/reportAccess";

export function ReportAccessPanel({ locale, bikeId }: { locale: Locale; bikeId?: string }) {
  const copy = reportAccessCopy[locale];
  const query = new URLSearchParams({ product: "single" });
  if (bikeId) query.set("bikeId", bikeId);

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-primary-soft p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <LockKeyhole className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold">{copy.unlockTitle}</h2>
      </div>
      <p>{copy.unlockBody}</p>
      <p className="text-sm text-muted-foreground">{copy.annual}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Button nativeButton={false} role="link"
          render={<Link href={withLocalePrefix(`/checkout?${query}`, locale)} />}>
          {copy.singleCta}
        </Button>
        <Link className="inline-flex min-h-11 items-center rounded-lg font-bold text-primary underline
          underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          href={withLocalePrefix("/checkout?product=annual", locale)}>
          {copy.annualCta}
        </Link>
      </div>
    </section>
  );
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
