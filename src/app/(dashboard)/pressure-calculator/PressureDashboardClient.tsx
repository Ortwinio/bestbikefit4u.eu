"use client";

import { useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button, LoadingState, OptionCard } from "@/components/ui";
import { AutosaveStatus } from "@/components/ui/AutosaveStatus";
import { useAutosave } from "@/components/ui/useAutosave";
import { BikePressureCard } from "@/components/features/pressure/BikePressureCard";
import { PressureCalculatorForm, type PressureCalculatorValues } from "@/components/features/pressure/PressureCalculatorForm";
import { validatePressureInput } from "@/lib/pressure-engine";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { toolsPressureMessages } from "@/i18n/account/toolsPressure";
import { autosaveMessages } from "@/i18n/account/autosave";
import { accountPressureCalculatorMessages } from "@/i18n/account/pressureCalculator";
import { tirePressureMessages } from "@/i18n/calculators/tirePressure";
import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import { buildPressurePrefill } from "./pressurePrefill";
import styles from "./PressureDashboard.module.css";

type FormHandle = { flush: () => Promise<boolean> };

function SavedPressureForm({ bikeId, userId, initialValues, header, stale, profilePrefilled, onSaved, ref }: {
  bikeId?: Id<"bikes">;
  userId: Id<"users">;
  initialValues: PressureCalculatorValues;
  header: ReactNode;
  stale: boolean;
  profilePrefilled: boolean;
  onSaved: (values: PressureCalculatorValues) => void;
  ref: Ref<FormHandle>;
}) {
  const { locale } = useDashboardMessages();
  const dictionary = locale === "nl" ? nl : en;
  const saveCopy = autosaveMessages[locale];
  const copy = accountPressureCalculatorMessages[locale];
  const upsert = useMutation(api.pressureCalculations.mutations.upsertBasic);
  const [values, setValues] = useState(initialValues);
  const [formInitialValues] = useState(initialValues);
  const [initialProfilePrefilled] = useState(profilePrefilled);
  const failed = useRef(false);
  const autosave = useAutosave({
    value: values,
    debounceMs: 500,
    validate: (input) => validatePressureInput(input).length ? saveCopy.invalid : null,
    onSave: async (inputSnapshot) => {
      try {
        await upsert({ bikeId, expectedUserId: userId, inputSnapshot });
        failed.current = false;
        onSaved(inputSnapshot);
      } catch (error) {
        failed.current = true;
        throw error;
      }
    },
  });
  useImperativeHandle(ref, () => ({
    flush: async () => {
      await autosave.flush();
      return !failed.current && validatePressureInput(values).length === 0;
    },
  }));

  return <PressureCalculatorForm
    locale={locale}
    labels={dictionary.pressure.form}
    resultLabels={dictionary.pressure.result}
    copy={{ ...tirePressureMessages[locale], intro: copy.intro, excluded: copy.excluded }}
    accountMode
    initialValues={formInitialValues}
    onValuesChange={setValues}
    onValuesCommit={() => { setTimeout(() => { void autosave.flush(); }, 0); }}
    headerSlot={header}
    statusSlot={<div className="space-y-2">
      <p className="text-sm text-muted-foreground">{copy.autosaveHint}</p>
      {initialProfilePrefilled && <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{copy.profilePrefill}</span>
        <Link href={withLocalePrefix("/profile", locale)} className="inline-flex min-h-11 items-center font-semibold text-primary underline">
          {copy.profileLink}
        </Link>
      </p>}
      <AutosaveStatus state={validatePressureInput(values).length ? "invalid" : autosave.state}
        messages={saveCopy} onRetry={autosave.retry} updated={saveCopy.updated}
        error={validatePressureInput(values).length ? saveCopy.invalid : autosave.error} />
      {stale && <p role="note" className="rounded-xl border border-border bg-muted p-3 text-sm">{copy.stale}</p>}
    </div>}
  />;
}

export function PressureDashboardClient({ initialBikeId }: { initialBikeId?: string }) {
  const { locale } = useDashboardMessages();
  const copy = toolsPressureMessages[locale];
  const user = useQuery(api.users.queries.getCurrentUser);
  const bikes = useQuery(api.bikes.queries.listByUser);
  const latestByBike = useQuery(api.pressureCalculations.queries.getLatestByBikeForUser);
  const latestWithoutBike = useQuery(api.pressureCalculations.queries.getLatestWithoutBikeForUser);
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const [selectedBikeId, setSelectedBikeId] = useState(initialBikeId);
  const [switching, setSwitching] = useState(false);
  const [savedValues, setSavedValues] = useState<Record<string, PressureCalculatorValues>>({});
  const form = useRef<FormHandle>(null);
  const bike = bikes?.find((entry) => entry._id === selectedBikeId);
  const bikeId = bike?._id;
  const detail = useQuery(api.bikes.queries.getDetail, bikeId ? { bikeId } : "skip");
  const stale = useQuery(api.pressureCalculations.queries.isBikePressureStale, bikeId ? { bikeId } : "skip");
  const saved = bikeId
    ? latestByBike?.find((entry) => entry.bikeId === bikeId)?.latestCalculation
    : latestWithoutBike;
  const selectionKey = `${user?._id ?? "loading"}:${bikeId ?? "no-bike"}`;
  const isLoading = !user || bikes === undefined || latestByBike === undefined || latestWithoutBike === undefined ||
    profile === undefined || Boolean(bikeId && (detail === undefined || stale === undefined));

  async function selectBike(nextBikeId?: string) {
    if (switching || nextBikeId === bikeId) return;
    setSwitching(true);
    const savedSuccessfully = await form.current?.flush() ?? true;
    if (savedSuccessfully) setSelectedBikeId(nextBikeId);
    setSwitching(false);
  }

  if (isLoading) {
    return <section aria-label={copy.loading} aria-busy="true" className="rounded-3xl border border-border bg-card p-6">
      <LoadingState label={copy.loading} />
      <p className="text-center text-sm text-muted-foreground">{copy.loadingDetail}</p>
    </section>;
  }

  const header = <section aria-labelledby="pressure-bikes" className="rounded-3xl border border-border bg-card p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="pressure-bikes" className="font-display text-2xl font-bold">{bikes.length ? copy.bikes : copy.emptyTitle}</h2>
      <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
        href={withLocalePrefix("/bikes", locale)}>{copy.garage}</Link>
    </div>
    {bikes.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {bikes.map((entry) => <OptionCard key={entry._id} label={entry.name}
        description={[entry.brand, entry.model].filter(Boolean).join(" ") || undefined}
        selected={bikeId === entry._id} disabled={switching} onClick={() => { void selectBike(entry._id); }} />)}
    </div> : <>
      <p className="mt-3 text-muted-foreground">{copy.emptyDescription}</p>
      <Button className="mt-4" role="link" nativeButton={false}
        render={<Link href={withLocalePrefix("/bikes/new", locale)} />}>{copy.addBike}</Button>
    </>}
    <Button className="mt-4" variant="ghost" aria-pressed={!bikeId} disabled={switching}
      onClick={() => { void selectBike(); }}>{copy.withoutBike}</Button>
    {switching && <p role="status" className="mt-2 text-sm">{accountPressureCalculatorMessages[locale].switching}</p>}
  </section>;

  return <div className={`${styles.scope} min-w-0 space-y-8
    [&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))]
    md:[&_[data-slot=configurator-sticky-result]]:bottom-0`}>
    <SavedPressureForm key={selectionKey} ref={form} bikeId={bikeId} userId={user._id} header={header}
      stale={stale?.isStale === true}
      profilePrefilled={!saved?.inputSnapshot && profile?.weightKg !== undefined}
      initialValues={savedValues[selectionKey] ?? buildPressurePrefill({ saved, bike, profile, tires: detail?.activeTireSetup })}
      onSaved={(values) => setSavedValues((current) => ({ ...current, [selectionKey]: values }))} />
    {bikes.length > 0 && <section aria-labelledby="pressure-saved" className="mx-auto max-w-[1440px] space-y-4 px-4 sm:px-8 xl:px-16">
      <h2 id="pressure-saved" className="font-display text-3xl font-bold">{copy.saved}</h2>
      <p className="text-sm text-muted-foreground">{copy.savedDescription}</p>
      <div className="grid min-w-0 gap-4 xl:grid-cols-2 [&_.border]:border-border [&_.border-b]:border-border [&_[data-slot=card]]:bg-card">
        {bikes.map((entry) => <BikePressureCard key={entry._id} bike={entry}
          latestCalculation={latestByBike.find((calculation) => calculation.bikeId === entry._id)?.latestCalculation ?? null}
          onRecalculate={(nextBikeId) => { void selectBike(nextBikeId); }} />)}
      </div>
    </section>}
  </div>;
}
