"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { ReportV2Payload } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";

type RiderProfileCardProps = {
  profile: ReportV2Payload["profile"];
  frameTargets: ReportV2Payload["frameTargets"];
  copy: ReportV2Copy;
};

export function RiderProfileCard({
  profile,
  frameTargets,
  copy,
}: RiderProfileCardProps) {
  const info = [
    [copy.profileFields.sessionId, profile.sessionId],
    [copy.profileFields.bikeType, profile.bikeType],
    [copy.profileFields.ridingStyle, profile.ridingStyle],
    [copy.profileFields.goal, profile.goal],
    [copy.profileFields.algorithmVersion, profile.algorithmVersion],
    [copy.profileFields.engineVersion, profile.engineVersion],
    [copy.profileFields.confidence, `${profile.globalConfidence}%`],
    [
      copy.profileFields.dataQuality,
      profile.dataQualityStatus === "complete"
        ? copy.dataQuality.complete
        : copy.dataQuality.partial,
    ],
  ] as const;

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>{copy.sections.profile}</CardTitle>
        <CardDescription>{copy.introBody}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {profile.dataQualityStatus === "partial" ? (
          <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {copy.dataQuality.banner}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {info.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {label}
              </p>
              <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-4">
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {copy.sections.frameTargets}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Stack
              </p>
              <p className="mt-1 text-sm font-medium">{frameTargets.stackMm} mm</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Reach
              </p>
              <p className="mt-1 text-sm font-medium">{frameTargets.reachMm} mm</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                ETT
              </p>
              <p className="mt-1 text-sm font-medium">
                {frameTargets.effectiveTopTubeMm} mm
              </p>
            </div>
          </div>
          {frameTargets.recommendedFrameLabel ? (
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              {frameTargets.recommendedFrameLabel}
            </p>
          ) : null}
        </div>

        {profile.missingData.length ? (
          <div>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {copy.profileFields.missingData}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.missingData.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--muted-foreground)]"
                >
                  {copy.tirePressure.missingDataLabels[
                    item as keyof typeof copy.tirePressure.missingDataLabels
                  ] ?? item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

