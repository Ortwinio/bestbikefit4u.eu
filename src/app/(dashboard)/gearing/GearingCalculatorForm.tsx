"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import {
  AdjustOrder,
  Button,
  Input,
  OptionCard,
  ResultTile,
  SegmentedControl,
  SegmentedControlItem,
  StatusChip,
  StepCard,
} from "@/components/ui";
import { toolsGearingMessages } from "@/i18n/account/toolsGearing";
import { CassetteEditor, GearLadder, ValueSlider } from "./GearingControls";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { calculateGearingAnalysis } from "@/lib/gearing-engine";
import {
  classifyGearingSuitability,
  computeGearingMetrics,
  parseCommaSeparatedNumbers,
  formatGearingLabel,
  summarizeCompleteness,
  type GearingData,
  type GearingDrivetrainType,
} from "./gearingMath";

function parseWheelCircumference(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function buildBikeLabel(
  bike: { name: string; brand?: string | null; model?: string | null } | undefined,
  fallback: string,
) {
  if (!bike) return fallback;
  return [bike.name, bike.brand, bike.model].filter(Boolean).join(" - ");
}

function buildGearingData({
  drivetrainType,
  frontChainring,
  innerChainring,
  cassetteCsv,
  wheelCircumferenceMm,
  crankLengthMm,
  groupsetName,
  derailleurMaxCog,
}: {
  drivetrainType: GearingDrivetrainType | "";
  frontChainring: string;
  innerChainring: string;
  cassetteCsv: string;
  wheelCircumferenceMm: string;
  crankLengthMm?: number | null;
  groupsetName: string;
  derailleurMaxCog: string;
}): GearingData {
  const cassetteTeeth = parseCommaSeparatedNumbers(cassetteCsv);
  const outerRing = parsePositiveNumber(frontChainring);
  const innerRing = parsePositiveNumber(innerChainring);
  const chainrings =
    drivetrainType === "1x"
      ? [outerRing].filter((value): value is number => typeof value === "number")
      : [outerRing, innerRing].filter((value): value is number => typeof value === "number");

  return {
    drivetrainType: drivetrainType || undefined,
    chainrings,
    cassetteTeeth,
    wheelCircumferenceMm: parseWheelCircumference(wheelCircumferenceMm),
    crankLengthMm: crankLengthMm ?? undefined,
    groupsetName: groupsetName.trim() || undefined,
    derailleurMaxCog: parsePositiveNumber(derailleurMaxCog),
    completeness: summarizeCompleteness({
      drivetrainType: drivetrainType || undefined,
      chainrings,
      cassetteTeeth,
      wheelCircumferenceMm: parseWheelCircumference(wheelCircumferenceMm),
      crankLengthMm: crankLengthMm ?? undefined,
      groupsetName: groupsetName.trim() || undefined,
      derailleurMaxCog: parsePositiveNumber(derailleurMaxCog),
    }),
  };
}

export function GearingCalculatorForm() {
  const { locale } = useDashboardMessages();
  const isNl = locale === "nl";
  const copy = toolsGearingMessages[locale === "nl" ? "nl" : "en"];
  const searchParams = useSearchParams();
  const bikeIdParam = searchParams.get("bikeId") as Id<"bikes"> | null;
  const [selectedBikeIdOverride, setSelectedBikeIdOverride] = useState<string | null>(null);
  const selectedBikeId = selectedBikeIdOverride ?? bikeIdParam ?? "";
  const bikes = useQuery(api.bikes.queries.list, {});
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bike = useQuery(api.bikes.queries.get, selectedBikeId ? { bikeId: selectedBikeId as Id<"bikes"> } : "skip");
  const recentSessions = useQuery(api.gearing.queries.listGearingSessions, { limit: 5 });
  const saveSession = useMutation(api.gearing.mutations.createDashboardGearingSession);
  const [drivetrainType, setDrivetrainType] = useState<GearingDrivetrainType | "">("2x");
  const [frontChainring, setFrontChainring] = useState("");
  const [innerChainring, setInnerChainring] = useState("");
  const [cassetteCsv, setCassetteCsv] = useState("");
  const [wheelCircumferenceMm, setWheelCircumferenceMm] = useState("2105");
  const [groupsetName, setGroupsetName] = useState("");
  const [derailleurMaxCog, setDerailleurMaxCog] = useState("");
  const [riderWeightKg, setRiderWeightKg] = useState("");
  const [bikeWeightKg, setBikeWeightKg] = useState("");
  const [ftpW, setFtpW] = useState("");
  const [preferredCadenceRpm, setPreferredCadenceRpm] = useState("85");
  const [gradientPercent, setGradientPercent] = useState("8");
  const [climbMinutes, setClimbMinutes] = useState("30");
  const [eventType, setEventType] = useState("sportive");
  const [comparisonCassetteCsv, setComparisonCassetteCsv] = useState("");
  const savedSignatureRef = useRef<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [retryCount, setRetryCount] = useState(0);
  const [prefilledBikeId, setPrefilledBikeId] = useState("");

  useEffect(() => {
    if (!bike) return;
    const gearing = (bike as { gearing?: GearingData | null }).gearing ?? null;
    const currentSetup = bike.currentSetup ?? null;

    startTransition(() => {
      setPrefilledBikeId(String(bike._id));
      setDrivetrainType(
        gearing?.drivetrainType ?? (bike.bikeType === "gravel" || bike.bikeType === "mountain" ? "1x" : "2x"),
      );
      setFrontChainring(gearing?.chainrings?.[0]?.toString() ?? "");
      setInnerChainring(gearing?.chainrings?.[1]?.toString() ?? "");
      setCassetteCsv(gearing?.cassetteTeeth?.join(", ") ?? "");
      setWheelCircumferenceMm(gearing?.wheelCircumferenceMm?.toString() ?? "2105");
      setGroupsetName(gearing?.groupsetName ?? "");
      setDerailleurMaxCog(gearing?.derailleurMaxCog?.toString() ?? "");
      setBikeWeightKg(bike.bikeWeightKg?.toString() ?? "");
      setPreferredCadenceRpm("85");
      setFtpW("");
      setComparisonCassetteCsv("");
    });
    if (currentSetup?.crankLengthMm) {
      // Use the bike's crank length only as an assumption for gain-ratio-adjacent explanations.
      void currentSetup.crankLengthMm;
    }
  }, [bike]);

  useEffect(() => {
    const weightKg = profile?.weightKg;
    if (typeof weightKg === "number") {
      startTransition(() => {
        setRiderWeightKg(weightKg.toString());
      });
    }
  }, [profile]);

  const bikeOptions = useMemo(
    () =>
      (bikes ?? []).map((row) => ({
        value: String(row._id),
        label: [row.name, row.brand, row.model].filter(Boolean).join(" - ") || row.name,
      })),
    [bikes],
  );

  const currentData = useMemo(
    () =>
      buildGearingData({
        drivetrainType,
        frontChainring,
        innerChainring,
        cassetteCsv,
        wheelCircumferenceMm,
        crankLengthMm: bike?.currentSetup?.crankLengthMm ?? null,
        groupsetName,
        derailleurMaxCog,
      }),
    [
      drivetrainType,
      frontChainring,
      innerChainring,
      cassetteCsv,
      wheelCircumferenceMm,
      bike,
      groupsetName,
      derailleurMaxCog,
    ],
  );

  useEffect(() => {
    if (drivetrainType === "1x" && innerChainring) {
      startTransition(() => {
        setInnerChainring("");
      });
    }
  }, [drivetrainType, innerChainring]);

  const currentMetrics = useMemo(
    () => computeGearingMetrics(currentData, Number(preferredCadenceRpm) || 90),
    [currentData, preferredCadenceRpm],
  );

  const currentSuitability = useMemo(
    () =>
      classifyGearingSuitability({
        metrics: currentMetrics,
        ftpW: parsePositiveNumber(ftpW) ?? null,
        climbMinutes: parsePositiveNumber(climbMinutes) ?? null,
        totalMassKg:
          (parsePositiveNumber(riderWeightKg) ?? profile?.weightKg ?? null) &&
          (parsePositiveNumber(bikeWeightKg) ?? bike?.bikeWeightKg ?? null)
            ? (parsePositiveNumber(riderWeightKg) ?? profile?.weightKg ?? 0) +
              (parsePositiveNumber(bikeWeightKg) ?? bike?.bikeWeightKg ?? 0)
            : null,
        gradientPercent: parsePositiveNumber(gradientPercent) ?? null,
        bikeType: bike?.bikeType ?? null,
        preferredCadenceRpm: parsePositiveNumber(preferredCadenceRpm) ?? null,
      }),
    [
      bike,
      bikeWeightKg,
      climbMinutes,
      ftpW,
      gradientPercent,
      preferredCadenceRpm,
      profile?.weightKg,
      riderWeightKg,
      currentMetrics,
    ],
  );

  const comparisonMetrics = useMemo(() => {
    if (!comparisonCassetteCsv.trim()) return null;
    const comparisonData = buildGearingData({
      drivetrainType,
      frontChainring,
      innerChainring,
      cassetteCsv: comparisonCassetteCsv,
      wheelCircumferenceMm,
      crankLengthMm: bike?.currentSetup?.crankLengthMm ?? null,
      groupsetName,
      derailleurMaxCog,
    });
    return computeGearingMetrics(comparisonData, Number(preferredCadenceRpm) || 90);
  }, [
    bike?.currentSetup?.crankLengthMm,
    comparisonCassetteCsv,
    drivetrainType,
    frontChainring,
    innerChainring,
    preferredCadenceRpm,
    groupsetName,
    derailleurMaxCog,
    wheelCircumferenceMm,
  ]);

  const persistenceInput = useMemo(() => {
    if (summarizeCompleteness(currentData) !== "validated") {
      return null;
    }

    const drivetrainType = currentData.drivetrainType;
    const chainrings = currentData.chainrings;
    const cassetteTeeth = currentData.cassetteTeeth;
    const wheelCircumferenceMm = currentData.wheelCircumferenceMm;

    if (!drivetrainType || !chainrings || !cassetteTeeth || !wheelCircumferenceMm) {
      return null;
    }

    return {
      drivetrainType,
      chainrings,
      cassetteTeeth,
      wheelCircumferenceMm,
      crankLengthMm: currentData.crankLengthMm,
      cadenceRpm: parsePositiveNumber(preferredCadenceRpm) ?? 85,
      bikeType: bike?.bikeType,
      riderWeightKg: parsePositiveNumber(riderWeightKg) ?? profile?.weightKg ?? undefined,
      bikeWeightKg: parsePositiveNumber(bikeWeightKg) ?? bike?.bikeWeightKg ?? undefined,
      ftpWatts: parsePositiveNumber(ftpW) ?? undefined,
      preferredCadenceRpm: parsePositiveNumber(preferredCadenceRpm) ?? undefined,
      climbGradientPct: parsePositiveNumber(gradientPercent) ?? undefined,
      climbLengthKm: parsePositiveNumber(climbMinutes)
        ? ((currentMetrics.lowestGearSpeedAtCadenceKmh ?? 0) * (parsePositiveNumber(climbMinutes) ?? 0)) / 60
        : undefined,
      eventType,
      rideIntent:
        eventType === "alpine"
          ? "alpine_holiday"
          : eventType === "bikepacking"
            ? "bikepacking"
            : eventType === "race"
              ? "race"
              : "mountain_sportive",
      rearDerailleurMaxCog: currentData.derailleurMaxCog,
    } as const;
  }, [
    bike?.bikeType,
    bike?.bikeWeightKg,
    bikeWeightKg,
    climbMinutes,
    currentData,
    currentMetrics.lowestGearSpeedAtCadenceKmh,
    eventType,
    ftpW,
    gradientPercent,
    preferredCadenceRpm,
    profile?.weightKg,
    riderWeightKg,
  ]);

  const persistenceAnalysis = useMemo(() => {
    if (!persistenceInput) {
      return null;
    }

    try {
      return calculateGearingAnalysis(persistenceInput);
    } catch {
      return null;
    }
  }, [persistenceInput]);

  const history = useMemo(
    () =>
      (recentSessions ?? []).map((session) => ({
        createdAt: session.createdAt,
        bikeId: session.bikeId ? String(session.bikeId) : null,
        label:
          session.bikeId && bikes
            ? buildBikeLabel(
                bikes.find((row) => String(row._id) === String(session.bikeId)),
                copy.selectedBike,
              )
            : copy.manual,
        verdict: session.suitability.publicVerdict,
        confidence: session.suitability.confidence.level,
      })),
    [recentSessions, bikes, copy.manual, copy.selectedBike],
  );

  useEffect(() => {
    if (
      !persistenceInput ||
      !persistenceAnalysis ||
      (selectedBikeId && (!bike || prefilledBikeId !== selectedBikeId))
    ) {
      return;
    }

    const signature = JSON.stringify({
      bikeId: selectedBikeId,
      input: persistenceInput,
      recommendation: persistenceAnalysis.suitability.recommendationText,
      scenario: comparisonCassetteCsv,
    });
    if (savedSignatureRef.current === signature) {
      return;
    }
    savedSignatureRef.current = signature;

    startTransition(() => setSaveState("saving"));
    void saveSession({
      bikeId: selectedBikeId ? (selectedBikeId as Id<"bikes">) : undefined,
      scenarioName: comparisonCassetteCsv.trim() ? "comparison-cassette" : undefined,
      input: persistenceInput,
      math: persistenceAnalysis.math,
      suitability: persistenceAnalysis.suitability,
    })
      .then(() => {
        if (savedSignatureRef.current === signature) setSaveState("saved");
      })
      .catch(() => {
        if (savedSignatureRef.current === signature) {
          savedSignatureRef.current = null;
          setSaveState("error");
        }
      });
  }, [
    comparisonCassetteCsv,
    persistenceAnalysis,
    persistenceInput,
    saveSession,
    selectedBikeId,
    prefilledBikeId,
    bike,
    retryCount,
  ]);

  const completenessLabel = summarizeCompleteness(currentData);
  const bikeLabel = bike ? buildBikeLabel(bike, copy.selectedBike) : selectedBikeId ? copy.selectedBike : copy.manual;
  const format = (value: number | null, digits = 1) =>
    value === null
      ? "—"
      : new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  const hasGears = currentMetrics.lowestGearRatio !== null;
  const hasPower = currentSuitability.requiredPowerW !== null && currentSuitability.sustainablePowerW !== null;
  const recommendation = !hasGears
    ? copy.missingGears
    : !hasPower
      ? copy.missingPower
      : copy.recommendations[currentSuitability.label];
  const comparisonCogs = parseCommaSeparatedNumbers(comparisonCassetteCsv);
  const exceedsLimit = Boolean(
    Number(derailleurMaxCog) &&
    Math.max(...(currentData.cassetteTeeth ?? []), ...comparisonCogs) > Number(derailleurMaxCog),
  );
  const verdictStatus = !hasPower
    ? "warn"
    : currentSuitability.label === "good_match"
      ? "ok"
      : currentSuitability.label === "borderline"
        ? "warn"
        : "deviation";

  return (
    <div className="space-y-6">
      <section aria-label={copy.bike} className="space-y-6 rounded-3xl bg-[var(--bbf-petrol-zacht)] p-5 sm:p-6">
        <h2 className="text-2xl font-bold">{copy.bike}</h2>
        {bikes === undefined ? (
          <p role="status">{copy.loading}</p>
        ) : !bikes.length ? (
          <p className="text-sm">{copy.emptyBikes}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {bikeOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              selected={selectedBikeId === option.value}
              onClick={() => setSelectedBikeIdOverride(option.value)}
            />
          ))}
          <OptionCard label={copy.manual} selected={!selectedBikeId} onClick={() => setSelectedBikeIdOverride("")} />
        </div>
        {selectedBikeId && bike === undefined ? <p role="status">{copy.loading}</p> : null}
        {selectedBikeId && bike === null ? <p role="alert">{copy.unavailable}</p> : null}
        <p className="text-sm">{copy.profileNote}</p>
        <div className="grid gap-6 md:grid-cols-3">
          <ValueSlider
            label={copy.riderWeight}
            value={riderWeightKg}
            onChange={setRiderWeightKg}
            min={40}
            max={150}
            step={0.5}
            unit="kg"
            copy={copy}
          />
          <ValueSlider
            label={copy.bikeWeight}
            value={bikeWeightKg}
            onChange={setBikeWeightKg}
            min={3}
            max={20}
            step={0.5}
            unit="kg"
            copy={copy}
          />
          <ValueSlider
            label={copy.ftp}
            value={ftpW}
            onChange={setFtpW}
            min={80}
            max={500}
            step={5}
            unit="W"
            copy={copy}
            optional
          />
        </div>
      </section>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <StepCard number={1} title={copy.setup} description={copy.setupDescription}>
            <div className="space-y-6">
              <SegmentedControl
                aria-label={copy.drivetrain}
                value={drivetrainType}
                variant="strong"
                onValueChange={(value) => setDrivetrainType(value as GearingDrivetrainType)}
              >
                <SegmentedControlItem value="1x">1×</SegmentedControlItem>
                <SegmentedControlItem value="2x">2×</SegmentedControlItem>
              </SegmentedControl>
              <ValueSlider
                label={copy.outer}
                value={frontChainring}
                onChange={setFrontChainring}
                min={20}
                max={70}
                step={1}
                unit={copy.teeth}
                copy={copy}
              />
              {drivetrainType === "2x" ? (
                <ValueSlider
                  label={copy.inner}
                  value={innerChainring}
                  onChange={setInnerChainring}
                  min={20}
                  max={70}
                  step={1}
                  unit={copy.teeth}
                  copy={copy}
                />
              ) : null}
              <CassetteEditor label={copy.cassette} value={cassetteCsv} onChange={setCassetteCsv} copy={copy} />
            </div>
          </StepCard>
          <StepCard number={2} title={copy.climb}>
            <ValueSlider
              label={copy.gradient}
              value={gradientPercent}
              onChange={setGradientPercent}
              min={0}
              max={25}
              step={0.1}
              unit="%"
              copy={copy}
            />
          </StepCard>
          <StepCard number={3} title={copy.cadenceStep}>
            <ValueSlider
              label={copy.cadence}
              value={preferredCadenceRpm}
              onChange={setPreferredCadenceRpm}
              min={40}
              max={130}
              step={1}
              unit="rpm"
              copy={copy}
            />
          </StepCard>
          <details className="rounded-3xl border border-border bg-card p-6">
            <summary className="cursor-pointer text-lg font-semibold">{copy.refine}</summary>
            <div className="mt-6 space-y-6">
              <ValueSlider
                label={copy.wheel}
                value={wheelCircumferenceMm}
                onChange={setWheelCircumferenceMm}
                min={1500}
                max={2800}
                step={1}
                unit="mm"
                copy={copy}
              />
              <h2 className="text-xl font-semibold">{copy.ride}</h2>
              <ValueSlider
                label={copy.duration}
                value={climbMinutes}
                onChange={setClimbMinutes}
                min={1}
                max={180}
                step={1}
                unit="min"
                copy={copy}
              />
              <fieldset className="space-y-3">
                <legend className="mb-3 font-medium">{copy.event}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(copy.events).map(([value, label]) => (
                    <OptionCard
                      key={value}
                      label={label}
                      selected={eventType === value}
                      onClick={() => setEventType(value)}
                    />
                  ))}
                </div>
              </fieldset>
              <Input
                label={copy.groupset}
                value={groupsetName}
                onChange={(event) => setGroupsetName(event.target.value)}
              />
              <ValueSlider
                label={copy.maxCog}
                value={derailleurMaxCog}
                onChange={setDerailleurMaxCog}
                min={9}
                max={54}
                step={1}
                unit={copy.teeth}
                copy={copy}
                optional
              />
              <p className="text-sm text-muted-foreground">{copy.comparisonNote}</p>
              <CassetteEditor
                label={copy.alternative}
                value={comparisonCassetteCsv}
                onChange={setComparisonCassetteCsv}
                copy={copy}
              />
            </div>
          </details>
          <Button
            render={
              <Link
                role="link"
                href={withLocalePrefix(selectedBikeId ? `/bikes/${selectedBikeId}` : "/bikes", locale)}
              />
            }
          >
            {copy.back}
          </Button>
        </div>
        <div className="min-w-0 space-y-5">
          <section
            aria-label={copy.ladder}
            className="rounded-3xl bg-[var(--bbf-lime)] p-5 text-[var(--bbf-inkt)] sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-widest">{bikeLabel}</p>
            <h2 className="mt-2 text-3xl font-bold text-inherit">{copy.ladder}</h2>
            <GearLadder data={currentData} copy={copy} locale={locale} />
          </section>
          <div className="grid grid-cols-2 gap-3" aria-live="polite">
            <ResultTile label={copy.low} value={format(currentMetrics.lowestGearRatio, 2)} />
            <ResultTile label={copy.high} value={format(currentMetrics.highestGearRatio, 2)} />
            <ResultTile label={copy.lowSpeed} value={format(currentMetrics.lowestGearSpeedAtCadenceKmh)} unit="km/h" />
            <ResultTile
              label={copy.highSpeed}
              value={format(currentMetrics.highestGearSpeedAtCadenceKmh)}
              unit="km/h"
            />
          </div>
          <section aria-label={copy.check} className="space-y-5 rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">{copy.check}</h2>
              <StatusChip status={verdictStatus}>
                {hasPower ? copy.verdicts[currentSuitability.label] : copy.unset}
              </StatusChip>
            </div>
            <p className="text-sm text-muted-foreground">
              {copy.completeness}: {formatGearingLabel(completenessLabel, isNl)} ·{" "}
              {copy.confidence[currentSuitability.confidence]}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ResultTile label={copy.required} value={format(currentSuitability.requiredPowerW, 0)} unit="W" />
              <ResultTile label={copy.sustainable} value={format(currentSuitability.sustainablePowerW, 0)} unit="W" />
              <ResultTile
                label={copy.neededCadence}
                value={format(currentSuitability.cadenceNeededRpm, 0)}
                unit="rpm"
              />
            </div>
            <p role="status" className="font-medium">
              {recommendation}
            </p>
            {currentSuitability.warnings.length > 1 && hasPower ? (
              <p className="text-sm text-muted-foreground">
                {(currentSuitability.cadenceNeededRpm ?? 0) < 70 ? copy.warningCadence : copy.warningCassette}
              </p>
            ) : null}
            {exceedsLimit ? (
              <p role="alert" className="rounded-2xl bg-warning/20 p-4 text-sm">
                {copy.compatibility}
              </p>
            ) : null}
            {comparisonMetrics ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultTile label={copy.alternativeRatio} value={format(comparisonMetrics.lowestGearRatio, 2)} />
                <ResultTile
                  label={copy.alternativeSpeed}
                  value={format(comparisonMetrics.lowestGearSpeedAtCadenceKmh)}
                  unit="km/h"
                />
              </div>
            ) : null}
          </section>
          <AdjustOrder
            title={copy.next}
            steps={[
              { title: copy.nextOne, description: copy.nextOneBody },
              { title: copy.nextTwo, description: copy.nextTwoBody },
              { title: copy.nextThree, description: copy.nextThreeBody },
            ]}
          />
          <section aria-label={copy.history} className="space-y-4 rounded-3xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">{copy.history}</h2>
            <p className="text-sm text-muted-foreground">{copy.autoSave}</p>
            {saveState === "error" ? (
              <div role="alert" className="space-y-3">
                <p>{copy.saveError}</p>
                <Button variant="outline" onClick={() => setRetryCount((count) => count + 1)}>
                  {copy.retry}
                </Button>
              </div>
            ) : saveState !== "idle" ? (
              <p role="status" className="text-sm">
                {saveState === "saving" ? copy.saving : copy.saved}
              </p>
            ) : null}
            {recentSessions === undefined ? (
              <p role="status">{copy.loading}</p>
            ) : history.length ? (
              <ul className="divide-y divide-border">
                {history.map((entry, index) => (
                  <li key={`${entry.createdAt}-${index}`} className="space-y-1 py-4">
                    <p className="font-semibold">{entry.label}</p>
                    <p className="text-sm">
                      {copy.historyVerdicts[entry.verdict]} · {copy.confidence[entry.confidence]}
                    </p>
                    <time dateTime={new Date(entry.createdAt).toISOString()} className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                        entry.createdAt,
                      )}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{copy.emptyHistory}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
