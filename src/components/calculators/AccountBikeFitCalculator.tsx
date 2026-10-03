"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BikeFitCalculatorForm } from "@/app/(public)/calculators/bike-fit/BikeFitCalculatorForm";
import { AutosaveField, AutosaveStatus, Button, LoadingState } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { accountBikeFitCopy } from "@/i18n/account/bikeFitCalculator";
import { accountCalculatorMessages } from "@/i18n/account/calculators";
import { autosaveMessages } from "@/i18n/account/autosave";
import { validCalculatorState } from "@/lib/calculators/accountState";
import { CalculatorChainLayout } from "./CalculatorChainPanel";
import { AccountCalculatorBike, useAccountCalculatorBike } from "./AccountCalculatorBike";
import { useCalculatorAccountState } from "./useCalculatorAccountState";

export function AccountBikeFitCalculator() {
  const user = useQuery(api.users.queries.getCurrentUser);
  const { locale } = useDashboardMessages();
  if (!user) return <LoadingState label={accountCalculatorMessages[locale].loading} />;
  return <BikeFitEditor key={user._id} />;
}

function BikeFitEditor() {
  const selection = useAccountCalculatorBike();
  const state = useCalculatorAccountState("bike-fit", { bikeId: selection.bikeId });
  const save = useMutation(api.calculatorStates.mutations.upsert);
  const { locale } = useDashboardMessages();
  const router = useRouter();
  const copy = accountBikeFitCopy[locale];
  const accountCopy = accountCalculatorMessages[locale];
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);
  const canStart = state.chain.pendingChanges.length === 0 && state.values.source !== "missing"
    && validCalculatorState({ calculator: "bike-fit", values: state.values });

  const start = async () => {
    if (!canStart || starting) return;
    setStarting(true);
    setError(false);
    try {
      await state.autosave.flush();
      await save({ bikeId: selection.bikeId, state: { calculator: "bike-fit", values: state.values } });
      const params = new URLSearchParams({ calculator: "bike-fit" });
      if (selection.bikeId) params.set("bikeId", selection.bikeId);
      if (state.chain.trial) params.set("trial", "1");
      router.push(withLocalePrefix(`/fit?${params}`, locale));
    } catch {
      setError(true);
    } finally {
      setStarting(false);
    }
  };
  if (!state.ready || !selection.ready) return <LoadingState label={accountCopy.loading} />;
  return <AutosaveField flush={state.autosave.flush} commitOn="release"
    className={"[&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))] "
      + "md:[&_[data-slot=configurator-sticky-result]]:bottom-0"}>
    <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 xl:px-16">
      <AutosaveStatus {...state.autosave} messages={autosaveMessages[locale]} onRetry={state.autosave.retry} />
    </div>
    <AccountCalculatorBike selection={selection} locale={locale} />
    <CalculatorChainLayout calculator="bike-fit" locale={locale} chain={state.chain}
      context={state.context} bikeId={selection.bikeId}>
    <fieldset disabled={starting} className="min-w-0">
      <BikeFitCalculatorForm key={state.formKey} isNl={locale === "nl"} initialValues={state.values} onValuesChange={state.setValues}
        continueAction={<div className="mt-5 space-y-3">
          <Button className="w-full whitespace-normal" disabled={!canStart || starting}
            isLoading={starting} onClick={() => { void start(); }}>{starting ? copy.starting : copy.start}</Button>
          <p className="text-sm text-[var(--bbf-op-donker)]">{canStart ? copy.startHint : copy.confirmMeasurements}</p>
          {error && <p role="alert" className="text-sm text-[var(--bbf-wit)]">{copy.error}</p>}
        </div>} />
    </fieldset>
    </CalculatorChainLayout>
  </AutosaveField>;
}
