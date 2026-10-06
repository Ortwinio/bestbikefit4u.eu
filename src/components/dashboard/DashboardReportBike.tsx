"use client";

import { PressureDisplay } from "@/components/features/pressure/PressureDisplay";

import Link from "next/link";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";
import { Button, Card, CardContent, SectionHeader, StatRow, LoadingState, InfoBox } from "@/components/ui";
import { FitReportActionGroup } from "@/components/reports";
import { LegacyReportBadge } from "@/components/bikes/LegacyReportBadge";
import { isPaidAccessEnforced } from "../../../shared/pricing/flags";
import type { BikeSessionEntry } from "@/components/bikes/BikeGarageOverview";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getDashboardReportCopy } from "@/i18n/account/dashboardReport";
import { getBikeUsageCopy } from "@/i18n/account/bikeUsage";
import { withLocalePrefix } from "@/i18n/navigation";
import { getBikeTypeLabel } from "@/lib/bikes";
import { getDashboardPressureCalculatorPath } from "@/lib/pressureRoutes";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
import { getReportV2Copy, PDF_SUMMARY_COPY } from "@/lib/reports/reportV2Copy";
import { localizePdfValue } from "@/lib/reports/pdfShared";
import { DashboardReliabilityReport } from "./DashboardReliabilityReport";
import { mapDashboardGreatestGain, mapDashboardReliabilityRows } from "./DashboardReportReliabilityMapping";

type BikeSummary = FunctionReturnType<typeof api.bikes.queries.listSummariesByUser>[number];
const linkClass = "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-primary " +
  "underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring";

export function DashboardReportBike({ bike, latestFit }: {
  bike: BikeSummary;
  latestFit: BikeSessionEntry | null;
}) {
  const { locale, messages } = useDashboardMessages();
  const copy = getDashboardReportCopy(locale);
  const reportCopy = getReportV2Copy(locale);
  const summaryCopy = PDF_SUMMARY_COPY[locale];
  const usage = getBikeUsageCopy(locale);
  const source = useQuery(api.recommendations.queries.getReportV2,
    latestFit ? { sessionId: latestFit.session._id } : "skip");
  const reliability = useQuery(api.reliability.queries.getDashboardReliability,
    latestFit ? { sessionId: latestFit.session._id } : "skip");
  const report = source?.recommendation ? mapReportV2Payload(source) : null;
  const photo = useResolvedImageUrl(bike.photoUrl);
  const tires = bike.activeTireSetupSummary;
  const rim = bike.activeWheelsetSummary?.rimType;
  const responses = latestFit?.responses ?? {};
  const questionnaire = report?.bike.questionnaire;
  const label = (labels: Record<string, string>, value: unknown) =>
    typeof value === "string" ? labels[value] ?? copy.missing : copy.missing;
  const fields = [
    ["experienceLevel", questionnaire?.experienceLevel ?? responses.experience_level],
    ["weeklyHours", questionnaire?.weeklyHours ?? responses.weekly_hours],
    ["rideLength", questionnaire?.rideLength ?? responses.typical_ride_length],
    ["positionPriority", questionnaire?.positionPriority ?? responses.position_priority],
    ["typeOfRiding", questionnaire?.typeOfRiding ?? responses.road_riding_type ?? responses.mtb_terrain],
  ] as const;
  const pressure = report?.tirePressure.status === "ready" ? report.tirePressure : null;
  const pressureValues = report ? pressure && {
    recommendedFrontBar: pressure.frontBar, recommendedRearBar: pressure.rearBar,
    recommendedFrontPsi: pressure.frontPsi, recommendedRearPsi: pressure.rearPsi,
  } : !latestFit ? bike.advisedPressureSummary : null;
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const fitHref = withLocalePrefix(`/fit?bikeId=${bike._id}`, locale);
  const noFit = <div className="space-y-3">
    <p className="font-semibold">{messages.bikeGarage.noFitYet}</p>
    <p className="text-sm text-muted-foreground">{messages.bikeGarage.noFitDescription}</p>
    <Link className={linkClass} href={fitHref}>{messages.fitHistory.startNewSession}</Link>
  </div>;

  return <div className="grid min-w-0 gap-4 xl:grid-cols-3">
    <Card variant="bordered" className="min-w-0">
      <SectionHeader title={bike.name} />
      <CardContent className="space-y-4">
        <div className="aspect-video rounded-xl bg-muted bg-contain bg-center bg-no-repeat"
          role="img" aria-label={photo ? bike.name : summaryCopy.diagramAlt}
          style={{ backgroundImage: `url(${JSON.stringify(photo ?? "/brand/report/bike-dimensions.png")})` }} />
        <p className="font-semibold">{[bike.brand, bike.model].filter(Boolean).join(" ")}</p>
        <p className="text-sm text-muted-foreground">{getBikeTypeLabel(bike.bikeType, messages)}</p>
        <dl className="divide-y divide-border">
          <StatRow label={reportCopy.bike.goal}
            value={localizePdfValue(report?.bike.goal ?? bike.primaryGoal, reportCopy, "goal") || copy.missing} />
          <StatRow label={copy.frame} value={bike.currentGeometry?.frameSize ?? copy.missing} />
          <StatRow label={copy.tires} value={tires
            ? `${tires.widthFrontMm}/${tires.widthRearMm} mm · ${label(copy.tube, tires.tubeType)}` : copy.missing} />
          <StatRow label={copy.rim} value={label(copy.rims, rim)} />
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" nativeButton={false} role="link"
            render={<Link href={withLocalePrefix(`/bikes/${bike._id}`, locale)} />}>
            {messages.dashboardHome.viewBike}
          </Button>
          <Button nativeButton={false} role="link" render={<Link href={fitHref} />}>
            {messages.dashboardHome.startFit}
          </Button>
        </div>
      </CardContent>
    </Card>
    <Card variant="bordered" className="min-w-0">
      <SectionHeader title={messages.bikeGarage.bikeUsageTitle} />
      <CardContent className="space-y-4">
        {latestFit ? <>
          {report && <p className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold
            text-accent-foreground">{copy.adviceAvailable}</p>}
          <dl className="divide-y divide-border">
            {fields.map(([group, value]) => <StatRow key={group} label={reportCopy.bike[group]}
              value={locale === "nl" && group === "typeOfRiding" && value === "casual"
                ? usage.roadRiding.casual
                : typeof value === "string" ? localizePdfValue(value, reportCopy, group) : copy.missing} />)}
          </dl>
          {responses.has_pain === "yes" && Array.isArray(responses.pain_areas) &&
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{messages.bikeGarage.reportedDiscomfort}</h3>
              <ul className="flex flex-wrap gap-2 text-sm">
                {responses.pain_areas.map((area) => <li key={area}
                  className="rounded-full border border-border px-3 py-1 font-semibold">
                  {usage.painAreas[area] ?? usage.otherDiscomfort}
                </li>)}
              </ul>
            </div>}
          <FitReportActionGroup sessionId={latestFit.session._id} pagePath={withLocalePrefix("/dashboard", locale)} />
          {isPaidAccessEnforced() && <LegacyReportBadge sessionId={latestFit.session._id} locale={locale} />}
          <Link className={linkClass} href={fitHref}>{messages.bikeGarage.recalculateFit}</Link>
        </> : noFit}
      </CardContent>
    </Card>
    <Card variant="bordered" className="min-w-0">
      <SectionHeader title={messages.bikeGarage.fitAdviseTitle} />
      <CardContent className="space-y-5">
        {latestFit && source === undefined ? <LoadingState label={messages.layout.loading} /> :
          report ? <>
            {reliability === undefined ? <LoadingState label={messages.layout.loading} /> :
              <DashboardReliabilityReport locale={locale}
                rows={mapDashboardReliabilityRows(reliability?.rows.flatMap(row => row.range ? [row.range] : []) ?? [], locale)}
                greatestGain={mapDashboardGreatestGain(reliability?.largestGain ?? null, locale)} />}
            {source?.recommendation?.climbingCalculatedFit && <InfoBox variant="success">
              <p className="font-semibold">{messages.bikeGarage.climbingProfileIncluded}</p>
              <p className="mt-2 font-mono text-sm">
                {source.recommendation.climbingCalculatedFit.saddleHeightMm} /{" "}
                {source.recommendation.climbingCalculatedFit.handlebarDropMm} /{" "}
                {source.recommendation.climbingCalculatedFit.handlebarReachMm} mm
              </p>
            </InfoBox>}
          </> : latestFit ? <p className="text-sm text-muted-foreground">{copy.reportMissing}</p> : noFit}
        <section className="space-y-3 border-t border-border pt-4" aria-label={reportCopy.sections.tirePressure}>
          <h3 className="font-display text-lg font-bold">{reportCopy.sections.tirePressure}</h3>
          {pressureValues ? <>
            <PressureDisplay locale={locale} compact
              frontBar={pressureValues.recommendedFrontBar} rearBar={pressureValues.recommendedRearBar}
              frontPsi={pressureValues.recommendedFrontPsi} rearPsi={pressureValues.recommendedRearPsi} />
            {(["front", "rear"] as const).map(side => {
              const current = source?.latestPressureCalculation ?? bike.advisedPressureSummary;
              const value = side === "front" ? current?.currentFrontBar : current?.currentRearBar;
              return value == null ? null : <p key={side} className="text-sm text-muted-foreground">
                {reportCopy.tirePressure[side]} · {reportCopy.table.current}: {number(value)} bar
              </p>;
            })}
            {!rim && <p className="rounded-xl border border-border p-3 text-sm">
              {copy.rimUnknown}
            </p>}
          </> : <p className="text-sm text-muted-foreground">{messages.pressure.overview.noCalculation}</p>}
          {bike.pressureStateSummary.isStale && <InfoBox variant="warning">
            {messages.dashboardHome.pressureStale}
          </InfoBox>}
          <Link className={linkClass} href={withLocalePrefix(getDashboardPressureCalculatorPath(bike._id), locale)}>
            {pressureValues ? messages.bikeGarage.recalculatePressure : messages.pressure.overview.noCalculationCta}
          </Link>
        </section>
      </CardContent>
    </Card>
  </div>;
}
