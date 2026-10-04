import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { withLocalePrefix } from "@/i18n/navigation";

export function ProfileAccessNotice({ locale, capped, bike = false, inverse = false }: { locale: Locale; capped: boolean; bike?: boolean; inverse?: boolean }) {
  const copy = getPricingAccessCopy(locale);
  return <div className="space-y-2 text-sm">
    <span className="inline-flex rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
      {capped ? copy.basicAccuracy : copy.refinedAccuracy}
    </span>
    <p className={inverse ? "text-[var(--bbf-op-donker)]" : "text-muted-foreground"}>{capped ? copy.cap : bike ? copy.bikeUncapped : copy.uncapped}</p>
    {capped && <Link className={`inline-flex min-h-11 items-center font-semibold underline focus-visible:focus-ring ${inverse ? "text-[var(--bbf-lime)]" : "text-primary"}`}
      href={withLocalePrefix("/pricing", locale)}>{copy.options}</Link>}
  </div>;
}
