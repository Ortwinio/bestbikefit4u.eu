"use client";

import { useState } from "react";
import Link from "next/link";
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
import { useCalculatorAccountState } from "./useCalculatorAccountState";

export function AccountBikeFitCalculator() {
  const user = useQuery(api.users.queries.getCurrentUser);
  const { locale } = useDashboardMessages();
  if (!user) return <LoadingState label={accountCalculatorMessages[locale].loading} />;
  return <BikeFitEditor key={user._id} />;
}

function BikeFitEditor() {
  const state = useCalculatorAccountState("bike-fit");
  const save = useMutation(api.calculatorStates.mutations.upsert);
  const { locale } = useDashboardMessages();
  const router = useRouter();
  const copy = accountBikeFitCopy[locale];
  const accountCopy = accountCalculatorMessages[locale];
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);
  const canStart = state.values.source !== "missing"
    && validCalculatorState({ calculator: "bike-fit", values: state.values });

  const start = async () => {
    if (!canStart || starting) return;
    setStarting(true);
    setError(false);
    try {
      await state.autosave.flush();
      await save({ state: { calculator: "bike-fit", values: state.values } });
      router.push(withLocalePrefix("/fit?calculator=bike-fit", locale));
    } catch {
      setError(true);
    } finally {
      setStarting(false);
    }
  };
  if (!state.ready) return <LoadingState label={accountCopy.loading} />;
  return <AutosaveField flush={state.autosave.flush} commitOn="release"
    className={"[&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))] "
      + "md:[&_[data-slot=configurator-sticky-result]]:bottom-0"}>
    <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 xl:px-16">
      {state.fromProfile && <div className="space-y-2 text-sm text-muted-foreground">
        <p>{accountCopy.fromProfile}{" · "}
          <Link className="inline-flex min-h-11 items-center underline focus-visible:focus-ring"
            href={withLocalePrefix("/profile", locale)}>{accountCopy.profile}</Link>
        </p>
        <p>{copy.sourceNotice}</p>
      </div>}
      <p className="text-sm text-muted-foreground">{accountCopy.savedSeparately}</p>
      <AutosaveStatus {...state.autosave} messages={autosaveMessages[locale]} onRetry={state.autosave.retry} />
    </div>
    <fieldset disabled={starting} className="min-w-0">
      <BikeFitCalculatorForm isNl={locale === "nl"} initialValues={state.values} onValuesChange={state.setValues}
        continueAction={<div className="mt-5 space-y-3">
          <Button className="w-full whitespace-normal" disabled={!canStart || starting}
            isLoading={starting} onClick={() => { void start(); }}>{starting ? copy.starting : copy.start}</Button>
          <p className="text-sm text-[var(--bbf-op-donker)]">{canStart ? copy.startHint : copy.confirmMeasurements}</p>
          {error && <p role="alert" className="text-sm text-[var(--bbf-wit)]">{copy.error}</p>}
        </div>} />
    </fieldset>
  </AutosaveField>;
}
