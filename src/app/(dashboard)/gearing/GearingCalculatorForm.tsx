"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, NumberInput, Select, Textarea } from "@/components/ui";
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

type HistoryEntry = {
  createdAt: number;
  bikeId?: string | null;
  label: string;
  recommendation: string;
  confidence: string;
};

const EVENT_TYPES = [
  { value: "local_hills", label: "Local hills" },
  { value: "sportive", label: "Mountain sportive" },
  { value: "alpine", label: "Alpine holiday" },
  { value: "race", label: "Race" },
  { value: "bikepacking", label: "Bikepacking" },
];

function formatRatio(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
}

function formatKmh(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)} km/h`;
}

function formatWatts(value: number | null) {
  return value === null ? "—" : `${Math.round(value)} W`;
}

function parseWheelCircumference(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function buildBikeLabel(bike?: { name: string; brand?: string | null; model?: string | null }) {
  if (!bike) return "Manual setup";
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
  const chainrings = [parsePositiveNumber(frontChainring), parsePositiveNumber(innerChainring)].filter(
    (value): value is number => typeof value === "number"
  );

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
  const searchParams = useSearchParams();
  const bikeIdParam = searchParams.get("bikeId") as Id<"bikes"> | null;
  const [selectedBikeId, setSelectedBikeId] = useState<string>(bikeIdParam ?? "");
  const bikes = useQuery(api.bikes.queries.list, {});
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bike = useQuery(
    api.bikes.queries.get,
    selectedBikeId ? { bikeId: selectedBikeId as Id<"bikes"> } : "skip"
  );
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const savedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!bikeIdParam) return;
    setSelectedBikeId(bikeIdParam);
  }, [bikeIdParam]);

  useEffect(() => {
    if (!bike) return;
    const gearing = (bike as { gearing?: GearingData | null }).gearing ?? null;
    const currentSetup = bike.currentSetup ?? null;

    setDrivetrainType(gearing?.drivetrainType ?? (bike.bikeType === "gravel" || bike.bikeType === "mountain" ? "1x" : "2x"));
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
    if (currentSetup?.crankLengthMm) {
      // Use the bike's crank length only as an assumption for gain-ratio-adjacent explanations.
      void currentSetup.crankLengthMm;
    }
  }, [bike]);

  useEffect(() => {
    if (profile?.weightKg) {
      setRiderWeightKg(profile.weightKg.toString());
    }
  }, [profile]);

  const bikeOptions = useMemo(
    () =>
      (bikes ?? []).map((row) => ({
        value: String(row._id),
        label: [row.name, row.brand, row.model].filter(Boolean).join(" - ") || row.name,
      })),
    [bikes]
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
    [drivetrainType, frontChainring, innerChainring, cassetteCsv, wheelCircumferenceMm, bike, groupsetName, derailleurMaxCog]
  );

  const currentMetrics = useMemo(
    () => computeGearingMetrics(currentData, Number(preferredCadenceRpm) || 90),
    [currentData, preferredCadenceRpm]
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
    ]
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
    if (
      !currentData.drivetrainType ||
      !currentData.chainrings?.length ||
      !currentData.cassetteTeeth?.length ||
      !currentData.wheelCircumferenceMm
    ) {
      return null;
    }

    return {
      drivetrainType: currentData.drivetrainType,
      chainrings: currentData.chainrings,
      cassetteTeeth: currentData.cassetteTeeth,
      wheelCircumferenceMm: currentData.wheelCircumferenceMm,
      crankLengthMm: currentData.crankLengthMm,
      cadenceRpm: parsePositiveNumber(preferredCadenceRpm) ?? 85,
      bikeType: bike?.bikeType,
      riderWeightKg: parsePositiveNumber(riderWeightKg) ?? profile?.weightKg ?? undefined,
      bikeWeightKg: parsePositiveNumber(bikeWeightKg) ?? bike?.bikeWeightKg ?? undefined,
      ftpWatts: parsePositiveNumber(ftpW) ?? undefined,
      preferredCadenceRpm: parsePositiveNumber(preferredCadenceRpm) ?? undefined,
      climbGradientPct: parsePositiveNumber(gradientPercent) ?? undefined,
      climbLengthKm: parsePositiveNumber(climbMinutes)
        ? ((currentMetrics.lowestGearSpeedAtCadenceKmh ?? 0) *
            (parsePositiveNumber(climbMinutes) ?? 0)) /
          60
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

  const persistenceAnalysis = useMemo(
    () => (persistenceInput ? calculateGearingAnalysis(persistenceInput) : null),
    [persistenceInput]
  );

  useEffect(() => {
    if (!recentSessions) {
      return;
    }
    setHistory(
      recentSessions.map((session) => ({
        createdAt: session.createdAt,
        bikeId: session.bikeId ? String(session.bikeId) : null,
        label:
          session.bikeId && bikes
            ? buildBikeLabel(
                bikes.find((row) => String(row._id) === String(session.bikeId))
              )
            : "Manual setup",
        recommendation: session.suitability.recommendationText,
        confidence: session.suitability.confidence.level,
      }))
    );
  }, [recentSessions, bikes]);

  useEffect(() => {
    if (!persistenceInput || !persistenceAnalysis) {
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

    void saveSession({
      bikeId: selectedBikeId ? (selectedBikeId as Id<"bikes">) : undefined,
      scenarioName: comparisonCassetteCsv.trim() ? "comparison-cassette" : undefined,
      input: persistenceInput,
      math: persistenceAnalysis.math,
      suitability: persistenceAnalysis.suitability,
    });
  }, [
    comparisonCassetteCsv,
    persistenceAnalysis,
    persistenceInput,
    saveSession,
    selectedBikeId,
  ]);

  const completenessLabel = summarizeCompleteness(currentData);
  const bikeLabel = bike ? buildBikeLabel(bike) : selectedBikeId ? "Selected bike" : "Manual setup";
  const confidenceLabel =
    currentSuitability.confidence === "high"
      ? isNl
        ? "Hoge betrouwbaarheid"
        : "High confidence"
      : currentSuitability.confidence === "medium"
        ? isNl
          ? "Gemiddelde betrouwbaarheid"
          : "Medium confidence"
        : isNl
          ? "Lage betrouwbaarheid"
          : "Low confidence";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
      <div className="space-y-6">
        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{isNl ? "Bike-preset" : "Bike prefill"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Select
              label={isNl ? "Kies een fiets" : "Choose a bike"}
              value={selectedBikeId}
              onChange={(event) => setSelectedBikeId(event.target.value)}
              options={[
                { value: "", label: isNl ? "Handmatige invoer" : "Manual input" },
                ...bikeOptions,
              ]}
            />
            <Select
              label={isNl ? "Type aandrijving" : "Drivetrain type"}
              value={drivetrainType}
              onChange={(event) => setDrivetrainType(event.target.value as GearingDrivetrainType)}
              options={[
                { value: "1x", label: "1x" },
                { value: "2x", label: "2x" },
              ]}
            />
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{isNl ? "Gearing-invoer" : "Gearing input"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              label={isNl ? "Voorblad buiten" : "Front chainring"}
              value={frontChainring ? Number(frontChainring) : null}
              onChange={(value) => setFrontChainring(value === null ? "" : String(value))}
            />
            <NumberInput
              label={isNl ? "Voorblad binnen" : "Inner chainring"}
              value={innerChainring ? Number(innerChainring) : null}
              onChange={(value) => setInnerChainring(value === null ? "" : String(value))}
            />
            <Textarea
              label={isNl ? "Cassette-tanden" : "Cassette teeth"}
              value={cassetteCsv}
              onChange={(event) => setCassetteCsv(event.target.value)}
              placeholder="11, 12, 13, 15, 17, 19, 21, 24, 28, 32"
              helperText={isNl ? "Gebruik komma's of spaties." : "Use commas or spaces."}
            />
            <NumberInput
              label={isNl ? "Wielomtrek" : "Wheel circumference"}
              value={wheelCircumferenceMm ? Number(wheelCircumferenceMm) : null}
              onChange={(value) => setWheelCircumferenceMm(value === null ? "" : String(value))}
              unit="mm"
            />
            <Input
              label={isNl ? "Groepset" : "Groupset"}
              value={groupsetName}
              onChange={(event) => setGroupsetName(event.target.value)}
              placeholder={isNl ? "Bijv. Ultegra / GRX / GX" : "e.g. Ultegra / GRX / GX"}
            />
            <NumberInput
              label={isNl ? "Max. grootste tandwiel" : "Rear derailleur max cog"}
              value={derailleurMaxCog ? Number(derailleurMaxCog) : null}
              onChange={(value) => setDerailleurMaxCog(value === null ? "" : String(value))}
            />
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{isNl ? "Rijder en rit" : "Rider and ride"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              label={isNl ? "Rijdergewicht" : "Rider weight"}
              value={riderWeightKg ? Number(riderWeightKg) : null}
              onChange={(value) => setRiderWeightKg(value === null ? "" : String(value))}
              unit="kg"
            />
            <NumberInput
              label={isNl ? "Fietsgewicht" : "Bike weight"}
              value={bikeWeightKg ? Number(bikeWeightKg) : null}
              onChange={(value) => setBikeWeightKg(value === null ? "" : String(value))}
              unit="kg"
            />
            <NumberInput
              label="FTP"
              value={ftpW ? Number(ftpW) : null}
              onChange={(value) => setFtpW(value === null ? "" : String(value))}
              unit="W"
            />
            <NumberInput
              label={isNl ? "Voorkeurcadans" : "Preferred cadence"}
              value={preferredCadenceRpm ? Number(preferredCadenceRpm) : null}
              onChange={(value) => setPreferredCadenceRpm(value === null ? "" : String(value))}
              unit="rpm"
            />
            <NumberInput
              label={isNl ? "Gemiddelde klimhelling" : "Average climb gradient"}
              value={gradientPercent ? Number(gradientPercent) : null}
              onChange={(value) => setGradientPercent(value === null ? "" : String(value))}
              unit="%"
            />
            <NumberInput
              label={isNl ? "Klimduur" : "Climb duration"}
              value={climbMinutes ? Number(climbMinutes) : null}
              onChange={(value) => setClimbMinutes(value === null ? "" : String(value))}
              unit="min"
            />
            <Select
              label={isNl ? "Rittype" : "Event type"}
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              options={EVENT_TYPES}
            />
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {isNl ? "Gekoppelde fiets" : "Linked bike"}
              </p>
              <p className="mt-1">{bikeLabel}</p>
              <p className="mt-2">
                {isNl
                  ? "Een gedeeltelijke setup blijft bruikbaar, maar de classificatie wordt dan conservatiever."
                  : "A partial setup remains usable, but the classification becomes more conservative."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{isNl ? "Vergelijking" : "Scenario comparison"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Textarea
              label={isNl ? "Alternatieve cassette" : "Alternative cassette"}
              value={comparisonCassetteCsv}
              onChange={(event) => setComparisonCassetteCsv(event.target.value)}
              placeholder="11, 12, 13, 15, 17, 19, 21, 24, 28, 34"
              helperText={isNl ? "Laat leeg om geen scenario te vergelijken." : "Leave empty if you do not want a comparison."}
            />
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {isNl ? "Vergelijkingscriterium" : "Comparison criterion"}
              </p>
              <p className="mt-1">
                {isNl
                  ? "Gebruik het alternatief om te zien hoeveel makkelijker de klim wordt."
                  : "Use the alternative to see how much easier the climb becomes."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            render={
              <Link
                href={withLocalePrefix(
                  selectedBikeId ? `/bikes/${selectedBikeId}` : "/bikes",
                  locale
                )}
              />
            }
          >
            {isNl ? "Ga terug naar fiets" : "Back to bike"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{isNl ? "Resultaat" : "Result"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/30 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {isNl ? "Gearing-compleetheid" : "Gearing completeness"}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatGearingLabel(completenessLabel, isNl)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{confidenceLabel}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultTile label={isNl ? "Lichtste versnelling" : "Lowest gear"} value={formatRatio(currentMetrics.lowestGearRatio)} />
              <ResultTile label={isNl ? "Zwaarste versnelling" : "Highest gear"} value={formatRatio(currentMetrics.highestGearRatio)} />
              <ResultTile label={isNl ? "Snelheid in laagste versnelling" : "Low-gear speed"} value={formatKmh(currentMetrics.lowestGearSpeedAtCadenceKmh)} />
              <ResultTile label={isNl ? "Snelheid in hoogste versnelling" : "High-gear speed"} value={formatKmh(currentMetrics.highestGearSpeedAtCadenceKmh)} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultTile label={isNl ? "Benodigd vermogen" : "Required power"} value={formatWatts(currentSuitability.requiredPowerW)} />
              <ResultTile label={isNl ? "Duurzaam vermogen" : "Sustainable power"} value={formatWatts(currentSuitability.sustainablePowerW)} />
              <ResultTile label={isNl ? "Benodigde cadans" : "Cadence needed"} value={currentSuitability.cadenceNeededRpm ? `${currentSuitability.cadenceNeededRpm.toFixed(0)} rpm` : "—"} />
              <ResultTile label={isNl ? "Beoordeling" : "Verdict"} value={currentSuitability.label.replaceAll("_", " ")} />
            </div>

            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--background)] p-4">
              <p className="text-sm font-medium text-foreground">{currentSuitability.recommendation}</p>
              {currentSuitability.warnings.length ? (
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {currentSuitability.warnings.map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {comparisonMetrics ? (
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {isNl ? "Scenario-delta" : "Scenario delta"}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {isNl
                    ? `Het alternatief verandert de laagste versnelling naar ${formatRatio(comparisonMetrics.lowestGearRatio)}.`
                    : `The alternative changes the lowest gear ratio to ${formatRatio(comparisonMetrics.lowestGearRatio)}.`}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{isNl ? "Recente berekeningen" : "Recent calculations"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length ? (
              history.map((entry) => (
                <div key={`${entry.createdAt}-${entry.label}`} className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--background)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{entry.label}</p>
                    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{entry.confidence}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.recommendation}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {isNl
                  ? "Je berekeningen verschijnen hier op dit apparaat."
                  : "Your calculations will appear here on this device."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--background)] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
