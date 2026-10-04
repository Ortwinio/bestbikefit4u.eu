import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { withLocalePrefix } from "@/i18n/navigation";

export function BikeAccessNotice({ locale, atLimit = false }: { locale: Locale; atLimit?: boolean }) {
  const copy = getPricingAccessCopy(locale);
  return <section className="rounded-2xl border border-border bg-secondary p-5 text-secondary-foreground">
    <p>{atLimit ? copy.bikeLimit : copy.oneBike}</p>
    <Link className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring"
      href={withLocalePrefix("/checkout?product=annual", locale)}>{copy.annual}</Link>
  </section>;
}
