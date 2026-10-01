"use client";

import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref, type ReactNode } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { AutosaveField, AutosaveStatus, LoadingState, OptionCard, useAutosave } from "@/components/ui";
import { GearingCalculatorForm as PublicGearingForm } from "@/app/(public)/calculators/gearing/GearingCalculatorForm";
import { validateGearingInputs } from "@/app/(public)/calculators/gearing/gearing-engine";
import { autosaveMessages } from "@/i18n/account/autosave";
import { accountGearingCalculatorMessages } from "@/i18n/account/gearingCalculator";
import { toolsGearingMessages } from "@/i18n/account/toolsGearing";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { calculateGearingAnalysis } from "@/lib/gearing-engine";
import { buildGearingPersistence, buildGearingPrefill } from "./gearingPrefill";

type FormHandle = { flush: () => Promise<boolean> };

function GearingEditor({ bike, saved, userId, currentUser, header, ref }: {
  bike?: Doc<"bikes">;
  saved: Doc<"gearingSessions"> | null;
  userId: Id<"users">;
  currentUser: { current: Id<"users"> | undefined };
  header: ReactNode;
  ref: Ref<FormHandle>;
}) {
  const { locale } = useDashboardMessages();
  const copy = accountGearingCalculatorMessages[locale];
  const saveCopy = autosaveMessages[locale];
  const [initial] = useState(() => buildGearingPrefill(saved?.input, bike));
  const [initialSaved] = useState(saved?.input);
  const [values, setValues] = useState(initial);
  const save = useMutation(api.gearing.mutations.createDashboardGearingSession);
  const failed = useRef(false);
  const errors = validateGearingInputs(values, locale === "nl").filter((issue) => issue.severity === "error");
  const autosave = useAutosave({
    value: values,
    debounceMs: 500,
    validate: (input) => validateGearingInputs(input, locale === "nl").some((issue) => issue.severity === "error")
      ? saveCopy.invalid : null,
    onSave: async (next) => {
      if (currentUser.current !== userId) throw new Error(saveCopy.error);
      try {
        const input = buildGearingPersistence(next, initialSaved, bike);
        const analysis = calculateGearingAnalysis(input);
        await save({ bikeId: bike?._id, expectedUserId: userId, input, math: analysis.math, suitability: analysis.suitability });
        failed.current = false;
      } catch (error) {
        failed.current = true;
        throw error;
      }
    },
  });
  useImperativeHandle(ref, () => ({ flush: async () => {
    await autosave.flush();
    return !failed.current && errors.length === 0;
  } }));
  return <AutosaveField flush={autosave.flush} commitOn="release">
    <PublicGearingForm isNl={locale === "nl"} accountMode initialValues={initial} onValuesChange={setValues}
      description={copy.intro} headerSlot={header} statusSlot={<div className="space-y-2">
        <p className="text-sm text-muted-foreground">{copy.hint}</p>
        <AutosaveStatus state={errors.length ? "invalid" : autosave.state} messages={saveCopy}
          error={errors.length ? saveCopy.invalid : autosave.error} onRetry={autosave.retry} updated={saveCopy.updated} />
      </div>} />
  </AutosaveField>;
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
  const editor = useRef<FormHandle>(null);
  async function selectBike(id: string) {
    if (switching || id === (bike?._id ?? "")) return;
    setSwitching(true);
    if (await editor.current?.flush() ?? true) setOverride(id);
    setSwitching(false);
  }
  if (!user || bikes === undefined || saved === undefined) {
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
