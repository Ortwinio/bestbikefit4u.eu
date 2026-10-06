import { PaidBoundary } from "@/components/billing/PaidBoundary";
import type { Locale } from "@/i18n/config";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";


export function ProfileAccessNotice({ locale, capped, bike = false, inverse = false }: { locale: Locale; capped: boolean; bike?: boolean; inverse?: boolean }) {
  const copy = getPricingAccessCopy(locale);
  return <div className="space-y-2 text-sm">
    <span className="inline-flex rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
      {capped ? copy.basicAccuracy : copy.refinedAccuracy}
    </span>
    <p className={inverse ? "text-[var(--bbf-op-donker)]" : "text-muted-foreground"}>{capped ? copy.cap : bike ? copy.bikeUncapped : copy.uncapped}</p>
    {capped && <PaidBoundary locale={locale} boundary="profile-score" />}
  </div>;
}
