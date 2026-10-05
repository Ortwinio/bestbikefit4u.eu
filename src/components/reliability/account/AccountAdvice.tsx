import { Card } from "@/components/ui/Card";
import { RangeBar } from "@/components/ui/RangeBar";
import type { AccountReliabilityCopy } from "@/i18n/account/reliability";
import type { SaddleHeightResult } from "../../../../shared/reliability/saddleHeight";

export function AccountAdvice({ result, locale, copy, dashed, basis, children }: {
  result: SaddleHeightResult;
  locale: "nl" | "en";
  copy: AccountReliabilityCopy;
  dashed?: boolean;
  basis: string;
  children?: React.ReactNode;
}) {
  return <Card className="space-y-6 p-6 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-2xl font-bold">{copy.advice}</h2><p className="mt-1 max-w-xs text-sm text-muted-foreground">{copy.reference}</p></div>
      <div className="font-mono"><p className="text-4xl">{result.adviceMm} <span className="text-base">mm</span></p><p>± {result.halfWidthMm} mm</p></div>
    </div>
    <RangeBar value={result.adviceMm} low={result.lowerMm} high={result.upperMm} min={result.scaleMinMm} max={result.scaleMaxMm} dashed={dashed} locale={locale} />
    <p className="text-sm text-muted-foreground">{copy.basis}: {basis}</p>
    {children}
  </Card>;
}
