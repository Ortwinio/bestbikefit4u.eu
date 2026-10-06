import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { calculatorPaidMessages } from "@/i18n/calculators/calculatorPaid";
import { PRODUCTS } from "../../../shared/pricing/products";

export function CalculatorPaidChip({ locale }: { locale: Locale }) {
  return <Link href={`/${locale}/pricing`} data-usability="paid-presentation" data-presentation="range-chip"
    className={"inline-flex min-h-11 items-center rounded-full border border-border bg-muted px-3 py-2 " +
      "text-xs font-semibold text-foreground focus-visible:focus-ring"}>
    {calculatorPaidMessages[locale].chip}
  </Link>;
}

export function CalculatorAdviceLadder({ locale, currentRange }: { locale: Locale; currentRange?: string }) {
  const copy = calculatorPaidMessages[locale];
  const price = (cents: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(cents / 100);
  return <section data-usability="paid-presentation" data-presentation="ladder" aria-label={copy.title}
    className="mt-3 overflow-hidden rounded-2xl border border-border text-sm">
    <dl>
      <div className="flex flex-wrap justify-between gap-2 bg-muted px-4 py-3 text-foreground">
        <dt className="font-semibold">{copy.now}</dt><dd className={currentRange ? "font-mono" : ""}>{currentRange ?? copy.current}</dd>
      </div>
      <div className="bg-[var(--bbf-lime-zacht)] px-4 py-3 text-[var(--bbf-inkt)]">
        <dt className="font-semibold">{copy.free}</dt><dd>{copy.saved}</dd>
      </div>
      <div className="space-y-1 bg-[var(--bbf-inkt)] px-4 py-3 text-[var(--bbf-wit)]">
        <dt className="font-semibold">{copy.paid}</dt><dd>{copy.report}</dd>
        <dd className="font-mono text-[var(--bbf-lime)]">{copy.single.replace("{price}", price(PRODUCTS.single.priceCents))}
          {" · "}{copy.annual.replace("{price}", price(PRODUCTS.annual.priceCents))}</dd>
        <dd><Link href={`/${locale}/pricing`} className="inline-flex min-h-11 items-center font-semibold underline focus-visible:focus-ring">
          {copy.action}
        </Link></dd>
      </div>
    </dl>
    <p className="bg-card px-4 py-3 text-xs text-muted-foreground">{copy.evidence}</p>
  </section>;
}
