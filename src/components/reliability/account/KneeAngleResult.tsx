import { Card } from "@/components/ui/Card";
import type { AccountReliabilityCopy } from "@/i18n/account/reliability";
import type { KneeAngleResult as KneeResult } from "../../../../shared/reliability/kneeAngle";
import { AccountAdvice } from "./AccountAdvice";

export function KneeAngleResult({ result, recordedAt, evaluationDueAt, copy, locale, repeatCount, unresolvedWarning }: {
  result: KneeResult;
  recordedAt: number;
  evaluationDueAt?: number;
  copy: AccountReliabilityCopy;
  locale: "nl" | "en";
  repeatCount?: number;
  unresolvedWarning?: boolean;
}) {
  const date = (value: number) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(value);
  const verdict = result.verdict === "in-window" ? copy.inWindow : result.verdict === "too-high" ? copy.tooStraight : copy.tooBent;
  return <>
    <Card className="space-y-2 p-6"><h2 className="font-mono text-3xl">{result.angleDegrees}°</h2><p>{verdict}</p><p className="text-sm text-muted-foreground">{copy.photoMeasured} · {date(recordedAt)}</p></Card>
    <AccountAdvice result={result.range} locale={locale} copy={copy} dashed={unresolvedWarning} basis={`${copy.inseam} ${new Intl.NumberFormat(locale).format(result.range.inseamMm / 10)} cm${repeatCount ? ` · ${repeatCount}×` : ""} · ${copy.photoMeasured} · ${result.angleDegrees}° · ${date(recordedAt)}`}>
      {unresolvedWarning && <p role="status">{copy.unresolved}</p>}
    </AccountAdvice>
    <Card className="space-y-4 p-6"><h2 className="text-xl font-bold">{copy.plan}</h2>
      <ol className="list-decimal space-y-3 pl-5">
        <li>{result.stepMm === 0 ? `${copy.keep} ${result.targetSaddleHeightMm} mm.` : `${result.stepMm > 0 ? copy.raise : copy.lower} ${Math.abs(result.stepMm)} mm. ${copy.target}: ${result.targetSaddleHeightMm} mm.`}</li>
        <li>{copy.rides}</li><li>{copy.evaluate}{evaluationDueAt && <span className="block font-medium">{copy.due}: {date(evaluationDueAt)}</span>}</li>
        <li>{result.inWindow ? copy.nextPart : copy.recheck}</li>
      </ol>
    </Card>
  </>;
}
