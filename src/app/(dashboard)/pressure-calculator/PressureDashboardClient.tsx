"use client";

import { useCalculatorChain } from "@/components/calculators/useCalculatorChain";
import { CalculatorChainLayout } from "@/components/calculators/CalculatorChainPanel";
import { withChainEvidence } from "@/lib/calculators/standaloneChain";
import type { ChainBinding } from "@/lib/calculators/chain";
import type { FunctionReturnType } from "convex/server";

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

type ChainContext = FunctionReturnType<typeof api.calculatorChain.queries.getContext>;
type FormHandle = { flush: () => Promise<boolean> };

function SavedPressureForm({ bikeId, userId, initialValues, header, stale, profilePrefilled, context, ref }: {
  bikeId?: Id<"bikes">;
  userId: Id<"users">;
  initialValues: PressureCalculatorValues;
  header: ReactNode;
  stale: boolean;
  profilePrefilled: boolean;
  context: ChainContext;
  ref: Ref<FormHandle>;
}) {
  const { locale } = useDashboardMessages();
  const dictionary = locale === "nl" ? nl : en;
  const saveCopy = autosaveMessages[locale];
  const copy = accountPressureCalculatorMessages[locale];
  const upsert = useMutation(api.pressureCalculations.mutations.upsertBasic);
  const apply = useMutation(api.calculatorChain.mutations.applyChanges);
  const bike = context.bikes.find((item) => item._id === bikeId);
  const tires = context.activeTireSetup;
  const bindings: ChainBinding<PressureCalculatorValues>[] = withChainEvidence([
    { field: "weightKg", source: "profile", value: context.profile?.weightKg, unit: "kg",
      read: (input) => input.bodyWeightKg,
      write: (input, value) => ({ ...input, bodyWeightKg: typeof value === "number" ? value : input.bodyWeightKg }) },
    ...(bike ? [
      { field: "bikeType", source: "bike" as const, value: bike.bikeType,
        read: (input: PressureCalculatorValues) => input.discipline === "mtb" ? "mountain" : input.discipline,
        write: (input: PressureCalculatorValues, value: unknown) => ({ ...input,
          discipline: value === "mountain" ? "mtb" as const : value === "gravel" ? "gravel" as const : "road" as const }) },
      { field: "primaryGoal", source: "bike" as const, value: bike.primaryGoal,
        read: (input: PressureCalculatorValues) => input.ridingGoal === undefined ? undefined
          : input.ridingGoal === "speed" ? "performance" : input.ridingGoal === "balance" ? "balanced" : "comfort",
        write: (input: PressureCalculatorValues, value: unknown) => ({ ...input,
          ridingGoal: value === "comfort" ? "comfort" as const : value === "balanced" ? "balance" as const
            : value === "performance" || value === "aerodynamics" ? "speed" as const : undefined }) },
      { field: "bikeWeightKg", source: "bike" as const, value: bike.bikeWeightKg, unit: "kg",
        read: (input: PressureCalculatorValues) => input.bikeWeightKg,
        write: (input: PressureCalculatorValues, value: unknown) => ({ ...input,
          bikeWeightKg: typeof value === "number" ? value : undefined }) },
      ...(["widthFrontMm", "widthRearMm", "tubeType"] as const).map((field): ChainBinding<PressureCalculatorValues> => ({
        field: `tires.${field}`, source: "bike", value: tires?.[field], unit: field === "tubeType" ? "" : "mm",
        read: (input) => input[field],
        write: (input, value) => ({ ...input, [field]: value ?? input[field] }),
      })),
    ] : []),
  ], context.observations, context.bikeObservations.filter((item) => item.bikeId === bikeId));
  const chain = useCalculatorChain({ autoSaveProfile: true, scopeKey: `tire-pressure:${bikeId ?? ""}`, initialValues, bindings,
    externalKey: JSON.stringify({ inputs: bindings.map(({ field, value, kind, recordedAt }) => ({ field, value, kind, recordedAt })),
      tireSetup: tires?._id, discipline: bike?.discipline, bikeType: bike?.bikeType }),
    applyChanges: (changes, automatic) => apply({ calculator: "tire-pressure", bikeId, automatic, expectedUserId: userId,
      tireSetupId: changes.some((change) => change.field.startsWith("tires.")) ? tires?._id : undefined,
      changes: changes.map(({ source: _source, ...change }) => {
        if (change.value === null) throw new Error(saveCopy.invalid);
        return { ...change, value: change.value,
          measurePoint: change.measurePoint === "bb_center_to_saddle_top" ? "bb_center_to_saddle_top" as const : undefined };
      }) }),
  });
  const values = chain.values;
  const failed = useRef(false);
  const persistedRevision = useRef(0);
  const autosave = useAutosave({
    value: values,
    enabled: chain.canAutosave,
    debounceMs: 500,
    validate: (input) => validatePressureInput(input).length ? saveCopy.invalid : null,
    onSave: async (inputSnapshot) => {
      if (!chain.canAutosave || chain.revision === persistedRevision.current) return;
      const revision = chain.revision;
      try {
        await upsert({ bikeId, expectedUserId: userId, inputSnapshot });
        persistedRevision.current = revision;
        failed.current = false;
      } catch (error) {
        failed.current = true;
        throw error;
      }
    },
  });
  useImperativeHandle(ref, () => ({
    flush: async () => {
      await autosave.flush();
      return chain.pendingChanges.length === 0 && !failed.current && validatePressureInput(values).length === 0;
    },
  }));

  return <CalculatorChainLayout calculator="tire-pressure" locale={locale} chain={chain} context={context} bikeId={bikeId}>
  <PressureCalculatorForm key={chain.formKey}
    locale={locale}
    labels={dictionary.pressure.form}
    resultLabels={dictionary.pressure.result}
    copy={{ ...tirePressureMessages[locale], intro: copy.intro, excluded: copy.excluded }}
    accountMode
    initialValues={values}
    onValuesChange={chain.setValues}
    onValuesCommit={() => { setTimeout(() => { void autosave.flush(); }, 0); }}
    headerSlot={header}
    statusSlot={<div className="space-y-2">
      {profilePrefilled && <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
  />
  </CalculatorChainLayout>;
}

export function PressureDashboardClient({ initialBikeId }: { initialBikeId?: string }) {
  const { locale } = useDashboardMessages();
  const copy = toolsPressureMessages[locale];
  const user = useQuery(api.users.queries.getCurrentUser);
  const bikes = useQuery(api.bikes.queries.listByUser);
  const latestByBike = useQuery(api.pressureCalculations.queries.getLatestByBikeForUser);
  const latestWithoutBike = useQuery(api.pressureCalculations.queries.getLatestWithoutBikeForUser);
  const [selectedBikeId, setSelectedBikeId] = useState(initialBikeId);
  const [switching, setSwitching] = useState(false);
  const form = useRef<FormHandle>(null);
  const bike = bikes?.find((entry) => entry._id === selectedBikeId);
  const bikeId = bike?._id;
  const detail = useQuery(api.bikes.queries.getDetail, bikeId ? { bikeId } : "skip");
  const context = useQuery(api.calculatorChain.queries.getContext, user && bikes !== undefined ? { bikeId } : "skip");
  const stale = useQuery(api.pressureCalculations.queries.isBikePressureStale, bikeId ? { bikeId } : "skip");
  const saved = bikeId
    ? latestByBike?.find((entry) => entry.bikeId === bikeId)?.latestCalculation
    : latestWithoutBike;
  const selectionKey = `${user?._id ?? "loading"}:${bikeId ?? "no-bike"}`;
  const isLoading = !user || bikes === undefined || latestByBike === undefined || latestWithoutBike === undefined ||
    context === undefined || Boolean(bikeId && (detail === undefined || stale === undefined));

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
      context={context}
      profilePrefilled={context.profile?.weightKg !== undefined}
      initialValues={buildPressurePrefill({ saved, bike, profile: context.profile, tires: context.activeTireSetup })} />
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
