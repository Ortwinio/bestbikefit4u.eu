"use client";

import type { ReportV2Payload } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { MetricTile, ResultsSection, StatusPill } from "./ResultsPrimitives";

type RiderProfileCardProps = {
  rider: ReportV2Payload["rider"];
  profile: ReportV2Payload["profile"];
  frameTargets: ReportV2Payload["frameTargets"];
  copy: ReportV2Copy;
};

export function RiderProfileCard({
  rider,
  profile,
  frameTargets,
  copy,
}: RiderProfileCardProps) {
  const overview = [
    [copy.profileFields.sessionId, profile.sessionId],
    [copy.profileFields.bikeType, profile.bikeType],
    [copy.profileFields.ridingStyle, profile.ridingStyle],
    [copy.profileFields.goal, profile.goal],
    [copy.profileFields.algorithmVersion, profile.algorithmVersion],
    [copy.profileFields.engineVersion, profile.engineVersion],
  ] as const;

  const measurements = [
    [copy.rider.height, rider.heightCm ? `${rider.heightCm} cm` : null],
    [copy.rider.inseam, rider.inseamCm ? `${rider.inseamCm} cm` : null],
    [copy.rider.torsoLength, rider.torsoLengthCm ? `${rider.torsoLengthCm} cm` : null],
    [copy.rider.armLength, rider.armLengthCm ? `${rider.armLengthCm} cm` : null],
    [copy.rider.shoulderWidth, rider.shoulderWidthCm ? `${rider.shoulderWidthCm} cm` : null],
    [copy.rider.weight, rider.weightKg ? `${rider.weightKg} kg` : null],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <ResultsSection
      eyebrow={copy.sections.profile}
      title={rider.name ?? copy.sections.profile}
      description={copy.introBody}
      tone="highlight"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <StatusPill tone={profile.dataQualityStatus === "complete" ? "success" : "warning"}>
            {profile.dataQualityStatus === "complete"
              ? copy.dataQuality.complete
              : copy.dataQuality.partial}
          </StatusPill>
          <StatusPill tone="primary">
            {copy.profileFields.confidence}: {profile.globalConfidence}%
          </StatusPill>
        </div>

        {profile.dataQualityStatus === "partial" ? (
          <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
            {copy.dataQuality.banner}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid gap-3 sm:grid-cols-2">
            {overview.map(([label, value]) => (
              <MetricTile key={label} label={label} value={value} />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {measurements.map(([label, value]) => (
              <MetricTile key={label} label={label} value={value} emphasis="primary" />
            ))}
            {rider.bmi !== null ? (
              <MetricTile
                label="BMI"
                value={rider.bmi.toFixed(1)}
                detail={
                  rider.bmiCategory
                    ? copy.rider.bmiCategories[rider.bmiCategory]
                    : undefined
                }
                emphasis="success"
              />
            ) : null}
            {rider.flexibilityScore !== null ? (
              <MetricTile
                label={copy.sections.flexibility}
                value={`${rider.flexibilityScore}/5`}
                detail={rider.flexibilityLabel ?? undefined}
              />
            ) : null}
            {rider.coreStabilityScore !== null ? (
              <MetricTile
                label={copy.sections.coreStability}
                value={`${rider.coreStabilityScore}/5`}
              />
            ) : null}
            {rider.comfortScore !== null ? (
              <MetricTile
                label={copy.sections.comfort}
                value={`${rider.comfortScore}/5`}
              />
            ) : null}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--primary)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_7%,var(--card)_93%)] px-5 py-5">
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {copy.sections.frameTargets}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetricTile
              label={copy.rider.frameStack}
              value={`${frameTargets.stackMm} mm`}
              emphasis="primary"
            />
            <MetricTile
              label={copy.rider.frameReach}
              value={`${frameTargets.reachMm} mm`}
              emphasis="primary"
            />
            <MetricTile
              label={copy.rider.frameEffectiveTopTube}
              value={`${frameTargets.effectiveTopTubeMm} mm`}
              emphasis="primary"
            />
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
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs text-[color:var(--muted-foreground)]"
                >
                  {copy.tirePressure.missingDataLabels[
                    item as keyof typeof copy.tirePressure.missingDataLabels
                  ] ?? item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ResultsSection>
  );
}
