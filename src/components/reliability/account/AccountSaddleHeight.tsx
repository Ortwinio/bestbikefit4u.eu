"use client";

import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { checkInseamPlausibility } from "../../../../shared/reliability/saddleHeight";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { Select } from "@/components/ui/Select";
import { useAccountCalculatorBike } from "@/components/calculators/AccountCalculatorBike";
import { AccountReliabilityBoundary } from "./AccountReliabilityBoundary";
import { AccountSaddleView } from "./AccountSaddleView";
import { useMeasurementRequest } from "./useMeasurementRequest";

export function AccountSaddleHeight() {
  return <AccountReliabilityBoundary><SaddlePage /></AccountReliabilityBoundary>;
}

function SaddlePage() {
  const { locale } = useDashboardMessages();
  const copy = accountReliabilityMessages[locale];
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return <p role="status" className="p-6">{copy.loading}</p>;
  if (!isAuthenticated) return <p className="p-6"><Link href={`/${locale}/login`}>{copy.signIn}</Link></p>;
  return <SaddleEditor />;
}

function SaddleEditor() {
  const { locale } = useDashboardMessages();
  const copy = accountReliabilityMessages[locale];
  const selection = useAccountCalculatorBike();
  const state = useQuery(api.reliability.queries.getSaddleState, selection.ready ? { bikeId: selection.bikeId } : "skip");
  const saveObservation = useMutation(api.profiles.mutations.saveObservation);
  const saveMeasurement = useMutation(api.reliability.mutations.saveInseamMeasurement);
  const savePreferences = useMutation(api.reliability.mutations.saveSaddlePreferences);
  const request = useMeasurementRequest();
  if (!state) return <p role="status" className="p-6">{copy.loading}</p>;
  const { profile, bike, preferences } = state;
  const flexOptions = ["very_limited", "limited", "average", "good", "excellent"] as const;
  const observation = state.observations.find((entry) => entry.field === "inseamCm");
  const measurements = state.measurements.length ? state.measurements
    : observation?.kind === "measured" && profile?.inseamCm !== undefined
      ? [{ valueCm: profile.inseamCm, recordedAt: observation.recordedAt }] : [];
  const basis = [copy.fromProfile, copy[state.model?.provenance.kind ?? observation?.kind ?? "declared"],
    observation?.recordedAt ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(observation.recordedAt) : copy.unknownDate].join(" · ");
  const bikePicker = <div className="space-y-2"><Select label={copy.selectBike} tooltip={copy.selectBike} value={selection.bikeId ?? ""} options={[{ value: "", label: copy.noBike }, ...selection.bikes.map((entry) => ({ value: entry._id, label: entry.name }))]} onChange={(event) => selection.setSelected(event.target.value)} />{!bike && <Link href={`/${locale}/bikes`} className="inline-flex min-h-11 items-center text-sm underline">{copy.chooseNext}</Link>}</div>;
  return <AccountSaddleView locale={locale} heightCm={profile?.heightCm} measurements={measurements} model={state.model} basis={basis} settingsUpdatedAt={state.preferencesUpdatedAt ?? profile?.updatedAt} bikeId={selection.bikeId} bikePicker={bikePicker}
    settings={{ bikeType: preferences?.bikeType ?? (bike ? bike.bikeType === "mountain" ? "mtb" : bike.bikeType === "gravel" ? "gravel" : bike.bikeType === "city" ? "city" : "road" : undefined),
      goal: preferences?.goal ?? (bike?.primaryGoal === "aerodynamics" ? "aero" : bike?.primaryGoal ?? profile?.positionPriority),
      flexibility: preferences?.flexibilityScore ?? (profile?.flexibilityScore ? flexOptions.indexOf(profile.flexibilityScore) + 1 : undefined),
      core: preferences?.coreScore ?? profile?.coreStabilityScore,
      climbing: preferences?.climbing === "none" ? "low" : preferences?.climbing === "low" ? "medium" : preferences?.climbing === "medium" ? "high" : preferences?.climbing === "high" ? "veryHigh" : undefined,
      currentSaddleHeightMm: preferences?.currentSaddleHeightMm ?? bike?.currentSetup?.saddleHeightMm }}
    onSaveEstimate={async (valueCm, confirmed) => {
      const result = await saveObservation({ field: "inseamCm", value: valueCm, kind: "estimated",
        method: "self_assessment", expectedCurrentValue: profile?.inseamCm ?? null, inseamConfirmed: confirmed });
      if (result.status !== "saved") throw new Error("Profile changed");
    }}
    onSaveMeasurement={async (valueCm, confirmed) => {
      const large = profile?.heightCm !== undefined && checkInseamPlausibility(profile.heightCm, valueCm).status === "large";
      const payload = { valueCm, confirmed: confirmed && !large, override: confirmed && large };
      await saveMeasurement({ ...payload, requestId: request.requestId(payload) }); request.complete();
    }}
    onSaveSettings={async (values) => {
      await savePreferences({ bikeId: selection.bikeId, bikeType: values.bikeType, goal: values.goal,
        flexibilityScore: values.flexibility, coreScore: values.core,
        climbing: values.climbing === "low" ? "none" : values.climbing === "medium" ? "low" : values.climbing === "high" ? "medium" : values.climbing === "veryHigh" ? "high" : undefined,
        currentSaddleHeightMm: values.currentSaddleHeightMm });
    }} />;
}
