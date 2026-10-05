"use client";

import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref, type ReactNode } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { AutosaveField, AutosaveStatus, Button, Input, LoadingState, OptionCard, useAutosave } from "@/components/ui";
import { getFtpSliderStart } from "../../../../shared/riderEstimates/ftpSliderStart";
import { ftpSliderStartCopy } from "@/i18n/calculators/ftpSliderStart";
import { useCalculatorChain } from "@/components/calculators/useCalculatorChain";
import { CalculatorChainLayout } from "@/components/calculators/CalculatorChainPanel";
import { withChainEvidence } from "@/lib/calculators/standaloneChain";
import type { ChainBinding } from "@/lib/calculators/chain";
import type { FunctionReturnType } from "convex/server";
import { riderFtpMessages } from "@/i18n/account/riderFtp";
import { GearingCalculatorForm as PublicGearingForm } from "@/app/(public)/calculators/gearing/GearingCalculatorForm";
import { validateGearingInputs } from "@/app/(public)/calculators/gearing/gearing-engine";
import { autosaveMessages } from "@/i18n/account/autosave";
import { accountGearingCalculatorMessages } from "@/i18n/account/gearingCalculator";
import { toolsGearingMessages } from "@/i18n/account/toolsGearing";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { calculateGearingAnalysis } from "@/lib/gearing-engine";
import { buildGearingPersistence, buildGearingPrefill } from "./gearingPrefill";

type ChainContext = FunctionReturnType<typeof api.calculatorChain.queries.getContext>;
type GearingValues = { values: ReturnType<typeof buildGearingPrefill>; ftp: string; weight: number | undefined };

type FormHandle = { flush: () => Promise<boolean> };

function GearingEditor({ bike, saved, context, userId, currentUser, header, ref }: {
  bike?: Doc<"bikes">;
  saved: Doc<"gearingSessions"> | null;
  context: ChainContext;
  userId: Id<"users">;
  currentUser: { current: Id<"users"> | undefined };
  header: ReactNode;
  ref: Ref<FormHandle>;
}) {
  const { locale } = useDashboardMessages();
  const copy = accountGearingCalculatorMessages[locale];
  const saveCopy = autosaveMessages[locale];
  const profile = context.profile;
  const initialSaved = saved?.input;
  const apply = useMutation(api.calculatorChain.mutations.applyChanges);
  const initial: GearingValues = { values: buildGearingPrefill(initialSaved, bike),
    ftp: String(profile?.ftpWatts ?? initialSaved?.ftpWatts ?? ""), weight: profile?.weightKg };
  const bindings: ChainBinding<GearingValues>[] = withChainEvidence([
    { field: "ftpWatts", source: "profile", value: profile?.ftpWatts, unit: "W",
      read: (input) => input.ftp === "" ? null : Number(input.ftp),
      write: (input, value) => ({ ...input, ftp: value === null ? "" : String(value) }) },
    { field: "weightKg", source: "profile", value: profile?.weightKg, unit: "kg",
      read: (input) => input.weight,
      write: (input, value) => ({ ...input, weight: typeof value === "number" ? value : undefined }) },
    ...(bike ? [
      { field: "bikeType", source: "bike" as const, value: bike.bikeType,
        read: (input: GearingValues) => input.values.bikeType === "mtb" ? "mountain"
          : input.values.bikeType === "commuter" ? "city" : input.values.bikeType,
        write: (input: GearingValues, value: unknown) => ({ ...input, values: { ...input.values,
          bikeType: value === "mountain" ? "mtb" as const : value === "gravel" ? "gravel" as const
            : ["city", "hybrid", "touring"].includes(String(value)) ? "commuter" as const : "road" as const } }) },
      { field: "gearing.chainrings", source: "bike" as const, value: bike.gearing?.chainrings, unit: "teeth",
        read: (input: GearingValues) => [input.values.outerChainringTeeth,
          ...(input.values.drivetrainType === "2x" ? [input.values.innerChainringTeeth] : [])]
          .filter((value): value is number => value !== undefined),
        write: (input: GearingValues, value: unknown) => ({ ...input, values: { ...input.values,
          drivetrainType: Array.isArray(value) && value.length === 1 ? "1x" as const : "2x" as const,
          outerChainringTeeth: Array.isArray(value) ? Math.max(...value) : undefined,
          innerChainringTeeth: Array.isArray(value) && value.length > 1 ? Math.min(...value) : undefined } }) },
      { field: "gearing.cassetteTeeth", source: "bike" as const, value: bike.gearing?.cassetteTeeth, unit: "teeth",
        read: (input: GearingValues) => buildGearingPersistence(input.values, initialSaved, bike).cassetteTeeth,
        write: (input: GearingValues, value: unknown) => ({ ...input, values: { ...input.values,
          cassetteSmallestCogTeeth: Array.isArray(value) ? Math.min(...value) : undefined,
          cassetteLargestCogTeeth: Array.isArray(value) ? Math.max(...value) : undefined } }) },
      { field: "gearing.wheelCircumferenceMm", source: "bike" as const,
        value: bike.gearing?.wheelCircumferenceMm, unit: "mm",
        read: (input: GearingValues) => input.values.wheelCircumferenceMm,
        write: (input: GearingValues, value: unknown) => ({ ...input, values: { ...input.values,
          wheelCircumferenceMm: typeof value === "number" ? value : undefined } }) },
    ] : []),
  ], context.observations, context.bikeObservations.filter((item) => item.bikeId === bike?._id));
  const chain = useCalculatorChain({ autoSaveProfile: true, scopeKey: `gearing:${bike?._id ?? ""}`, initialValues: initial, bindings,
    externalKey: JSON.stringify(bindings.map(({ field, value, kind, recordedAt }) => ({ field, value, kind, recordedAt }))),
    applyChanges: (changes, automatic) => apply({ calculator: "gearing", bikeId: bike?._id, automatic, expectedUserId: userId,
      changes: [...changes, ...(changes.some((change) => change.field === "ftpWatts") ? [{
        field: "ftpMethod", source: "profile" as const, value: "known",
        expectedCurrentValue: profile?.ftpMethod ?? null, kind: "declared" as const, measurePoint: undefined,
      }] : [])].map(({ source: _source, ...change }) => {
        if (change.value === null) throw new Error(saveCopy.invalid);
        return { ...change, value: change.value,
          measurePoint: change.measurePoint === "bb_center_to_saddle_top" ? "bb_center_to_saddle_top" as const : undefined };
      }) }),
  });
  const { values, ftp } = chain.values;
  const ftpCopy = riderFtpMessages[locale];
  const startCopy = ftpSliderStartCopy[locale];
  const [ftpTouched, setFtpTouched] = useState(false);
  const ftpStart = getFtpSliderStart({ sex: profile?.sex, weightKg: chain.values.weight,
    knownFtpWatts: profile?.ftpWatts ?? initialSaved?.ftpWatts, min: 80, max: 500, step: 1 });
  const pendingFtpStart = ftp === "" && !ftpTouched && ftpStart !== null;
  function updateFtp(value: string) {
    setFtpTouched(true);
    chain.setValues({ ...chain.values, ftp: value });
  }
  const validFtp = (value: string) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 80 && Number(value) <= 500);
  const ftpError = !validFtp(ftp);
  const save = useMutation(api.gearing.mutations.createDashboardGearingSession);
  const failed = useRef(false);
  const persistedRevision = useRef(0);
  const errors = validateGearingInputs(values, locale === "nl").filter((issue) => issue.severity === "error");
  const autosave = useAutosave({
    value: { values, ftp },
    enabled: chain.canAutosave,
    debounceMs: 500,
    validate: (input) => !validFtp(input.ftp) || validateGearingInputs(input.values, locale === "nl").some((issue) => issue.severity === "error")
      ? saveCopy.invalid : null,
    onSave: async (next) => {
      if (!chain.canAutosave || chain.revision === persistedRevision.current) return;
      const revision = chain.revision;
      if (currentUser.current !== userId) throw new Error(saveCopy.error);
      try {
        const input = { ...buildGearingPersistence(next.values, initialSaved, bike),
          ftpWatts: next.ftp === "" ? undefined : Number(next.ftp), riderWeightKg: chain.values.weight };
        const analysis = calculateGearingAnalysis(input);
        await save({ bikeId: bike?._id, expectedUserId: userId, input, math: analysis.math, suitability: analysis.suitability });
        persistedRevision.current = revision;
        failed.current = false;
      } catch (error) {
        failed.current = true;
        throw error;
      }
    },
  });
  useImperativeHandle(ref, () => ({ flush: async () => {
    await autosave.flush();
    return chain.pendingChanges.length === 0 && !failed.current && errors.length === 0 && !ftpError;
  } }));
  return <CalculatorChainLayout calculator="gearing" locale={locale} chain={chain} context={context} bikeId={bike?._id}>
  <AutosaveField flush={autosave.flush} commitOn="release">
    <PublicGearingForm key={chain.formKey} isNl={locale === "nl"} accountMode initialValues={values}
      onValuesChange={(next) => chain.setValues({ ...chain.values, values: next })}
      description={copy.intro} headerSlot={header} statusSlot={<div className="space-y-2">
        <p className="text-sm text-muted-foreground">{copy.hint}</p>
        <Input label={ftpCopy.label} type="number" min={80} max={500} step={1} value={pendingFtpStart ? ftpStart : ftp}
          tooltip={ftpCopy.tooltip} helperText={pendingFtpStart ? startCopy.hint : ftpCopy.hint}
          error={ftpError ? saveCopy.invalid : undefined}
          onChange={(event) => updateFtp(event.target.value)} />
        {pendingFtpStart && <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{startCopy.pending}</p>
          <Button type="button" variant="secondary" onClick={() => updateFtp(String(ftpStart))}>
            {startCopy.confirm}
          </Button>
        </div>}
        <AutosaveStatus state={errors.length || ftpError ? "invalid" : autosave.state} messages={saveCopy}
          error={errors.length || ftpError ? saveCopy.invalid : autosave.error} onRetry={autosave.retry} updated={saveCopy.updated} />
      </div>} />
  </AutosaveField>
  </CalculatorChainLayout>;
}

export function GearingCalculatorForm() {
  const { locale } = useDashboardMessages();
  const copy = toolsGearingMessages[locale];
  const params = useSearchParams();
  const [override, setOverride] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const selectedBikeId = override ?? params.get("bikeId") ?? "";
  const user = useQuery(api.users.queries.getCurrentUser);
  const currentUser = useRef<Id<"users"> | undefined>(user?._id);
  useLayoutEffect(() => { currentUser.current = user?._id; }, [user?._id]);
  const bikes = useQuery(api.bikes.queries.list, {});
  const bike = bikes?.find((entry) => entry._id === selectedBikeId);
  const saved = useQuery(api.gearing.queries.getLatestGearingSession,
    user && bikes !== undefined ? { bikeId: bike?._id } : "skip");
  const history = useQuery(api.gearing.queries.listGearingSessions, user ? { limit: 5 } : "skip");
  const context = useQuery(api.calculatorChain.queries.getContext,
    user && bikes !== undefined ? { bikeId: bike?._id } : "skip");
  const editor = useRef<FormHandle>(null);
  async function selectBike(id: string) {
    if (switching || id === (bike?._id ?? "")) return;
    setSwitching(true);
    if (await editor.current?.flush() ?? true) setOverride(id);
    setSwitching(false);
  }
  if (!user || bikes === undefined || saved === undefined || context === undefined) {
    return <LoadingState label={copy.loading} />;
  }
  const header = <section aria-label={copy.bike} className="space-y-4 rounded-3xl border border-border bg-card p-6">
    <h2 className="font-display text-2xl font-bold">{copy.bike}</h2>
    {!bikes.length && <p className="text-sm text-muted-foreground">{copy.emptyBikes}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {bikes.map((entry) => <OptionCard key={entry._id} label={entry.name} selected={bike?._id === entry._id}
        disabled={switching} onClick={() => { void selectBike(entry._id); }} />)}
      <OptionCard label={copy.manual} selected={!bike} disabled={switching} onClick={() => { void selectBike(""); }} />
    </div>
    <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline"
      href={withLocalePrefix("/bikes", locale)}>{copy.back}</Link>
    {switching && <p role="status">{accountGearingCalculatorMessages[locale].switching}</p>}
  </section>;
  return <div className="min-w-0 space-y-8
    [&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))]
    md:[&_[data-slot=configurator-sticky-result]]:bottom-0">
    <GearingEditor key={user._id + ":" + (bike?._id ?? "no-bike")} ref={editor} bike={bike} saved={saved}
      context={context}
      userId={user._id} currentUser={currentUser} header={header} />
    <section aria-label={copy.history} className="mx-4 space-y-4 rounded-3xl border border-border bg-card p-6 sm:mx-8 xl:mx-16">
      <h2 className="font-display text-2xl font-bold">{copy.history}</h2>
      <p className="text-sm text-muted-foreground">{copy.autoSave}</p>
      {history === undefined ? <LoadingState label={copy.loading} /> : history.length ?
        <ul className="divide-y divide-border">{history.map((entry) => <li key={entry._id} className="space-y-1 py-4">
          <p className="font-semibold">{bikes.find((entryBike) => entryBike._id === entry.bikeId)?.name ?? copy.manual}</p>
          <p className="text-sm">{copy.historyVerdicts[entry.suitability.publicVerdict]} · {copy.confidence[entry.suitability.confidence.level]}</p>
          <time className="text-xs text-muted-foreground" dateTime={new Date(entry.createdAt).toISOString()}>
            {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(entry.createdAt)}
          </time>
        </li>)}</ul> : <p className="text-sm text-muted-foreground">{copy.emptyHistory}</p>}
    </section>
  </div>;
}
