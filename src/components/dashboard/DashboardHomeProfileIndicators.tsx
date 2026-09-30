import type { Doc } from "../../../convex/_generated/dataModel";
import type { Locale } from "@/i18n/config";
import type { DashboardMessages } from "@/i18n/dashboardMessages";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { deriveComfortScore, flexibilityTests } from "@/lib/validations/profile";
import { getDashboardReportCopy } from "@/i18n/account/dashboardReport";
import { DashboardNumber } from "./DashboardNumber";

export function DashboardHomeProfileIndicators({ profile, locale }: {
  profile: Pick<Doc<"profiles">, "flexibilityScore" | "coreStabilityScore" | "hasPain" | "painSeverity">;
  locale: Locale;
  messages: DashboardMessages;
}) {
  const copy = getReportV2Copy(locale);
  const indicators = [
    { key: "flexibility" as const,
      score: flexibilityTests.findIndex((test) => test.score === profile.flexibilityScore) + 1 },
    { key: "coreStability" as const, score: profile.coreStabilityScore },
    { key: "comfort" as const, score: profile.hasPain === undefined && profile.painSeverity === undefined
      ? null : deriveComfortScore(profile.hasPain, profile.painSeverity) },
  ];

  return <div className="grid gap-6 pt-2 md:grid-cols-3">
    {indicators.map(({ key, score }) => {
      const meta = copy.scoreMeta[key];
      const title = key === "coreStability" ? getDashboardReportCopy(locale).coreStability : meta.title;
      const validScore = score != null && score >= 1 && score <= 5 ? score as 1 | 2 | 3 | 4 | 5 : null;
      return <section key={key} aria-label={title} className="min-w-0 space-y-3">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        {validScore ? <>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">{meta.labels[validScore]}</p>
            <span className="text-sm"><DashboardNumber value={`${validScore}/5`} /></span>
          </div>
          <div role="meter" aria-label={title} aria-valuenow={validScore}
            aria-valuemin={1} aria-valuemax={5} className="flex gap-2">
            {[1, 2, 3, 4, 5].map((segment) => <span key={segment}
              className={`h-2.5 flex-1 rounded-sm ${segment <= validScore ? "bg-primary" : "border border-border"}`} />)}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{meta.descriptions[validScore]}</p>
        </> : <p className="text-sm text-muted-foreground">{getDashboardReportCopy(locale).missing}</p>}
      </section>;
    })}
  </div>;
}
