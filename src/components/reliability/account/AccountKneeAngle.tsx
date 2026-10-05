"use client";

import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { calculateKneeAngle } from "../../../../shared/reliability/kneeAngle";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { Select } from "@/components/ui/Select";
import { useAccountCalculatorBike } from "@/components/calculators/AccountCalculatorBike";
import { AccountReliabilityBoundary } from "./AccountReliabilityBoundary";
import { AccountKneeView } from "./AccountKneeView";
import { useMeasurementRequest } from "./useMeasurementRequest";

export function AccountKneeAngle() {
  return <AccountReliabilityBoundary><KneePage /></AccountReliabilityBoundary>;
}

function KneePage() {
  const { locale } = useDashboardMessages();
  const copy = accountReliabilityMessages[locale];
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return <p role="status" className="p-6">{copy.loading}</p>;
  if (!isAuthenticated) return <p className="p-6"><Link href={`/${locale}/login`}>{copy.signIn}</Link></p>;
  return <KneeEditor />;
}

function KneeEditor() {
  const { locale } = useDashboardMessages();
  const copy = accountReliabilityMessages[locale];
  const selection = useAccountCalculatorBike();
  const state = useQuery(api.reliability.queries.getSaddleState, selection.ready ? { bikeId: selection.bikeId } : "skip");
  const save = useMutation(api.reliability.mutations.saveKneeAngle);
  const request = useMeasurementRequest();
  if (!state) return <p role="status" className="p-6">{copy.loading}</p>;
  const measurement = state.latestKneeAngle;
  const result = measurement ? calculateKneeAngle({ angleDegrees: measurement.angleDegrees, currentSaddleHeightMm: measurement.currentSaddleHeightMm, inseamCm: measurement.inseamCm, provenance: measurement.provenance }) : null;
  const bikePicker = selection.bikes.length > 0 ? <Select label={copy.selectBike} tooltip={copy.selectBike} value={selection.bikeId ?? ""} options={[{ value: "", label: copy.noBike }, ...selection.bikes.map((bike) => ({ value: bike._id, label: bike.name }))]} onChange={(event) => selection.setSelected(event.target.value)} /> : null;
  return <AccountKneeView locale={locale} canUseKneeAngle={state.canUseKneeAngle} hasMeasurements={!!state.model} bikeId={selection.bikeId} bikePicker={bikePicker} currentSaddleHeightMm={state.preferences?.currentSaddleHeightMm ?? state.bike?.currentSetup?.saddleHeightMm}
    saved={result && measurement ? { result, recordedAt: measurement.recordedAt, evaluationDueAt: measurement.evaluationAt, repeatCount: measurement.provenance.repeatCount, unresolvedWarning: measurement.provenance.unresolvedWarning } : undefined}
    onSave={async (angleDegrees, currentSaddleHeightMm) => {
      const payload = { angleDegrees, currentSaddleHeightMm, bikeId: selection.bikeId };
      await save({ ...payload, requestId: request.requestId(payload) }); request.complete();
    }} />;
}
