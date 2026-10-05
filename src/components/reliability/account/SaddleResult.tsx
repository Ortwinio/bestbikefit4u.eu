import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { AccountReliabilityCopy } from "@/i18n/account/reliability";
import type { AccountSaddleResult } from "../../../../shared/reliability/accountSaddle";
import { calculateKneeAngle } from "../../../../shared/reliability/kneeAngle";
import { AccountAdvice } from "./AccountAdvice";

export function SaddleResult({ result, copy, locale, basis, currentSaddleHeightMm, hasBikeAndGoal, bikeId, showNextStep = true }: {
  result: AccountSaddleResult;
  copy: AccountReliabilityCopy;
  locale: "nl" | "en";
  basis: string;
  currentSaddleHeightMm?: number;
  hasBikeAndGoal: boolean;
  bikeId?: string;
  showNextStep?: boolean;
}) {
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, signDisplay: "exceptZero" });
  const projected = result.canCheckKneeAngle ? calculateKneeAngle({ angleDegrees: 30, currentSaddleHeightMm: result.adviceMm, inseamCm: result.meanInseamCm, provenance: result.provenance }).range.halfWidthMm : null;
  const breakdown = [[copy.base, result.breakdown.baseMm], [copy.flexibility, result.breakdown.flexibilityMm], [copy.core, result.breakdown.coreMm], [copy.goal, result.breakdown.goalMm], [copy.climbing, result.breakdown.climbingMm], [copy.total, result.adviceMm]] as const;
  return <div className="space-y-4">
    <AccountAdvice result={result} locale={locale} copy={copy} basis={basis} dashed={result.provenance.unresolvedWarning}>
      {result.provenance.unresolvedWarning && <p role="status">{copy.unresolved}</p>}
      <details><summary className="min-h-11 cursor-pointer font-semibold">{copy.breakdown} {result.adviceMm} mm</summary><dl>{breakdown.map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-border py-2"><dt>{label}</dt><dd className="font-mono">{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} mm</dd></div>)}</dl></details>
      {currentSaddleHeightMm !== undefined && <p>{copy.difference}: <span className="font-mono">{format.format(result.adviceMm - currentSaddleHeightMm)} mm</span></p>}
      {showNextStep && !(result.canCheckKneeAngle && hasBikeAndGoal) && <p className="rounded-xl bg-muted p-4 font-medium">{!result.canCheckKneeAngle ? copy.repeatNext : copy.chooseNext}</p>}
    </AccountAdvice>
    {result.canCheckKneeAngle && hasBikeAndGoal && <Card className="space-y-3 p-6"><h2 className="text-xl font-bold">{copy.teaser}</h2><p>{copy.teaserBody}</p><p>{copy.kneeProjection}: <span className="font-mono">± {projected} mm</span></p><Link className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4" href={`/${locale}/tools/knee-angle${bikeId ? `?bikeId=${encodeURIComponent(bikeId)}` : ""}`}>{copy.kneeLink}</Link></Card>}
  </div>;
}
