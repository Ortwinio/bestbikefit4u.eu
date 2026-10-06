import type { Locale } from "@/i18n/config";
import { getUsabilityPaidCopy } from "@/i18n/account/usabilityPaid";
import { PaidBoundary } from "@/components/billing/PaidBoundary";

export function BikeAccessNotice({ locale, pageHeading = false }: { locale: Locale; atLimit?: boolean; pageHeading?: boolean }) {
  return <div className="space-y-5">
    {pageHeading && <h1 className="font-display text-3xl font-bold">
      {getUsabilityPaidCopy(locale).boundaries["second-bike"].title}
    </h1>}
    <PaidBoundary locale={locale} boundary="second-bike" />
  </div>;
}
