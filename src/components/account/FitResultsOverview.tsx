import { Card } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { getFitResultsCopy } from "@/i18n/account/fitResults";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import type { ReportV2Payload } from "@/lib/reports/reportV2Types";
import { FitResultsValue, formatFitResultsNumber } from "./FitResultsValue";
import { getUsabilityPaidCopy } from "@/i18n/account/usabilityPaid";
import { reportAccessCopy } from "@/i18n/account/reportAccess";

type FitResultsOverviewProps = {
  locale: Locale;
  copy: ReportV2Copy;
  report: ReportV2Payload;
  fit: { saddleHeightMm: number; handlebarReachMm: number; handlebarDropMm: number };
  profileLabel: string;
  hasPaidAccess: boolean;
  showAccessLabel?: boolean;
};

export function FitResultsOverview({
  locale, copy, report, fit, profileLabel, hasPaidAccess, showAccessLabel = false,
}: FitResultsOverviewProps) {
  const text = getFitResultsCopy(locale);
  const saddleLength = fit.saddleHeightMm * 0.26;
  const saddleX = 250 - 0.292 * saddleLength;
  const saddleY = 287 - 0.956 * saddleLength;
  const barX = saddleX + fit.handlebarReachMm * 0.36;
  const barY = saddleY + fit.handlebarDropMm * 0.36;
  const seatX = 250 - 0.292 * saddleLength * 0.72;
  const seatY = 287 - 0.956 * saddleLength * 0.72;
  const currentLabel = report.detailedFit.find((row) => row.key === "saddleHeight")?.currentLabel;
  const currentHeight = currentLabel ? Number.parseFloat(currentLabel) : NaN;
  const showCurrent = hasPaidAccess && Number.isFinite(currentHeight);
  const currentX = 250 - 0.292 * currentHeight * 0.26;
  const currentY = 287 - 0.956 * currentHeight * 0.26;

  return <div className="space-y-6">
    <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_1fr]">
      <Card className="gap-4 rounded-3xl bg-primary-soft p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">{text.positionTitle}</h2>
          <span className="rounded-full bg-card px-3 py-2 text-sm font-bold">{profileLabel}</span>
        </div>
        <svg className="h-auto w-full text-foreground" viewBox="0 0 600 380" fill="none" role="img" aria-label={text.positionDescription}>
          <path d="M20 346H580" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
          <circle cx="120" cy="264" r="82" stroke="currentColor" strokeWidth="7" />
          <circle cx={barX + 42} cy="264" r="82" stroke="currentColor" strokeWidth="7" />
          <path d={`M120 264L250 287L${seatX} ${seatY}L120 264M${seatX} ${seatY}L${barX - 32} ${barY + 14}M250 287L${barX - 20} ${barY + 62}M${barX - 32} ${barY + 14}L${barX - 20} ${barY + 62}L${barX + 42} 264M${seatX} ${seatY}L${saddleX} ${saddleY + 4}`} stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${barX - 32} ${barY + 14}L${barX} ${barY}q24 0 24 22q0 18-16 20`} stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <path d={`M${saddleX - 24} ${saddleY}H${saddleX + 30}`} stroke="var(--color-primary)" strokeWidth="10" strokeLinecap="round" />
          <circle cx="250" cy="287" r="13" stroke="currentColor" strokeWidth="6" />
          <path d="M250 287L268 320" stroke="currentColor" strokeWidth="7" />
          {showCurrent && <path data-current-saddle="" d={`M${currentX - 24} ${currentY}H${currentX + 30}`} stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" />}
          <path d={`M232 287L${saddleX - 18} ${saddleY}`} stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="7 7" />
          <rect x="30" y="155" width="140" height="38" rx="10" fill="var(--color-primary)" />
          <text x="100" y="181" fill="var(--color-primary-foreground)" textAnchor="middle" className="font-mono" fontSize="20">{formatFitResultsNumber(fit.saddleHeightMm, locale)} mm</text>
        </svg>
        <p className="text-sm leading-relaxed text-muted-foreground">{showCurrent ? text.drawingWithCurrent : text.drawingNote}</p>
      </Card>
      <Card className="gap-3 rounded-3xl p-5 sm:p-6">
        <h2 className="font-display text-2xl font-bold">{text.prioritiesTitle}</h2>
        {showAccessLabel && <div>
          <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
            {hasPaidAccess ? reportAccessCopy[locale].refined : reportAccessCopy[locale].basic}
          </span>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasPaidAccess ? reportAccessCopy[locale].refinedNote : reportAccessCopy[locale].basicNote}
          </p>
        </div>}
        <p className="text-sm leading-relaxed text-muted-foreground">{text.prioritiesDescription}</p>
        <ol className="divide-y divide-border">
          {report.prioritySummary.slice(0, 4).map((row, index) => <li key={row.key} className="flex flex-wrap items-center gap-3 py-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--bbf-lime)] font-mono text-[var(--bbf-inkt)]">{formatFitResultsNumber(index + 1, locale)}</span>
            <div className="min-w-0 flex-1 basis-36"><h3 className="font-bold">{copy.parameters[row.key].label}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.parameters[row.key].measurementReference}</p></div>
            <div className="space-y-1 text-right">
              <p className="text-xl font-semibold"><FitResultsValue value={row.targetLabel} locale={locale} /></p>
              {hasPaidAccess && showAccessLabel && (() => {
                const range = report.detailedFit.find(detail => detail.key === row.key)?.reliability95;
                return range && range.kind === "continuous" ? <span data-usability="paid-presentation"
                  data-presentation="range-chip"
                  className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                  {getUsabilityPaidCopy(locale).paid} ± {formatFitResultsNumber(range.halfWidth, locale)} mm
                </span> : null;
              })()}
            </div>
          </li>)}
        </ol>
      </Card>
    </div>
    {hasPaidAccess && <Card className="gap-4 rounded-3xl p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold">{text.comparisonTitle}</h2>
      <div className="space-y-3">
        {report.detailedFit.map((row) => <div key={row.key} className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_2fr]">
          <h3 className="font-bold">{copy.parameters[row.key].label}</h3>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div><dt className="text-muted-foreground">{text.current}</dt><dd className="mt-1 break-words">{row.currentLabel ? <FitResultsValue value={row.currentLabel} locale={locale} /> : text.unknown}</dd></div>
            <div><dt className="text-muted-foreground">{text.target}</dt><dd className="mt-1 break-words"><FitResultsValue value={row.targetLabel} locale={locale} /></dd></div>
            <div><dt className="text-muted-foreground">{text.difference}</dt><dd className="mt-1 break-words">{row.currentLabel && row.delta ? <FitResultsValue locale={locale} value={`${row.delta.direction === "decrease" ? "−" : row.delta.direction === "increase" ? "+" : ""}${row.delta.amountMm} mm`} /> : text.noDifference}</dd></div>
          </dl>
        </div>)}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{text.comparisonDescription}</p>
    </Card>}
  </div>;
}
