"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AutosaveField, AutosaveStatus, LoadingState, OptionCard, useAutosave } from "@/components/ui";
import { autosaveMessages } from "@/i18n/account/autosave";
import { saddleCalculatorMessages } from "@/i18n/account/saddleCalculator";
import { saddleWidthMessages } from "@/i18n/calculators/saddleWidth";
import { toolsSaddleMessages } from "@/i18n/account/toolsSaddle";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { SaddleWidthCalculatorForm } from "@/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm";
import { calculateSaddleWidth, classifySaddleSuitability, type SaddleWidthInput } from "@/lib/saddle-width-engine";
import { useCalculatorChain } from "@/components/calculators/useCalculatorChain";
import { CalculatorChainLayout } from "@/components/calculators/CalculatorChainPanel";
import { withChainEvidence } from "@/lib/calculators/standaloneChain";
import type { ChainBinding } from "@/lib/calculators/chain";
import { getSaddleInitialValues } from "./saddleAccountState";

export { mapBikeToRidingTypeFromBike, mapGoalToPosture, normalizeProfileSitBoneWidth } from "./saddleAccountState";

type ChainContext = FunctionReturnType<typeof api.calculatorChain.queries.getContext>;
type Bikes = FunctionReturnType<typeof api.bikes.queries.list>;
type Saved = FunctionReturnType<typeof api.saddleWidth.queries.getLatestSaddleWidthSession>;

export function SaddleSelectorForm() {
  const { locale } = useDashboardMessages();
  const params = useSearchParams();
  const [override, setOverride] = useState<string | null>(null);
  const requestedBikeId = override ?? params.get("bikeId") ?? "";
  const user = useQuery(api.users.queries.getCurrentUser);
  const bikes = useQuery(api.bikes.queries.list, {});
  const bikeId = bikes?.find((item) => item._id === requestedBikeId)?._id;
  const saved = useQuery(api.saddleWidth.queries.getLatestSaddleWidthSession,
    bikes === undefined ? "skip" : { bikeId });
  const context = useQuery(api.calculatorChain.queries.getContext, user && bikes !== undefined ? { bikeId } : "skip");
  if (!user || context === undefined || bikes === undefined || saved === undefined) {
    return <LoadingState label={toolsSaddleMessages[locale].loading} />;
  }
  return <SaddleEditor key={`${user._id}:${bikeId ?? "no-bike"}`}
    userId={user._id} context={context} bikes={bikes} bikeId={bikeId} saved={saved} onSelectBike={setOverride} />;
}

function SaddleEditor({ userId, context, bikes, bikeId, saved, onSelectBike }: {
  userId: Id<"users">;
  context: ChainContext;
  bikes: Bikes;
  bikeId?: Id<"bikes">;
  saved: Saved;
  onSelectBike: (id: string) => void;
}) {
  const { locale } = useDashboardMessages();
  const copy = toolsSaddleMessages[locale];
  const accountCopy = saddleCalculatorMessages[locale];
  const sessions = useQuery(api.saddleWidth.queries.listSaddleWidthSessions, { limit: 5 });
  const saveSession = useMutation(api.saddleWidth.mutations.createDashboardSaddleWidthSession);
  const profile = context.profile;
  const bike = bikes.find((item) => item._id === bikeId);
  const initial = getSaddleInitialValues(saved, profile, bike);
  const apply = useMutation(api.calculatorChain.mutations.applyChanges);
  const profileFields = ["sitBoneWidthMm", "heightCm", "weightKg", "hipCircumferenceCm"] as const;
  const bindings: ChainBinding<SaddleWidthInput>[] = withChainEvidence([
    ...profileFields.map((field): ChainBinding<SaddleWidthInput> => ({
      field, source: "profile", value: profile?.[field],
      unit: field === "sitBoneWidthMm" ? "mm" : field === "weightKg" ? "kg" : "cm",
      read: (input) => (input.inputMethod === "measured") === (field === "sitBoneWidthMm") ? input[field] : undefined,
      write: (input, value) => ({ ...input, [field]: typeof value === "number" ? value : undefined }),
    })),
    ...(bike ? [{ field: "primaryGoal", source: "bike" as const, value: bike.primaryGoal,
      read: (input: SaddleWidthInput) => input.postureCategory === "upright" ? "comfort"
        : input.postureCategory === "aggressive" ? "performance" : "balanced",
      write: (input: SaddleWidthInput, value: unknown) => ({ ...input,
        postureCategory: value === "comfort" ? "upright" as const
          : value === "performance" || value === "aerodynamics" ? "aggressive" as const : "balanced" as const }) },
      { field: "saddleWidthMm", source: "bike" as const, value: bike.saddleWidthMm, unit: "mm",
      read: (input: SaddleWidthInput) => input.currentSaddleWidthMm,
      write: (input: SaddleWidthInput, value: unknown) => ({ ...input,
        currentSaddleWidthMm: typeof value === "number" ? value : undefined }) }] : []),
  ], context.observations, context.bikeObservations.filter((item) => item.bikeId === bikeId));
  const chain = useCalculatorChain({ autoSaveProfile: true, scopeKey: `saddle-width:${bikeId ?? ""}`,
    initialValues: { ...initial.values, currentSaddleWidthMm: bike?.saddleWidthMm ?? saved?.currentSaddleWidthMm },
    bindings,
    externalKey: JSON.stringify({ bindings: bindings.map(({ field, value, kind, recordedAt }) =>
      ({ field, value, kind, recordedAt })), bikeType: bike?.bikeType, goal: bike?.primaryGoal }),
    applyChanges: (changes, automatic) => apply({ calculator: "saddle-width", bikeId, automatic, expectedUserId: userId,
      changes: changes.map(({ source: _source, ...change }) => {
        if (change.value === null) throw new Error(autosaveMessages[locale].invalid);
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
    validate: (next) => {
      try { calculateSaddleWidth(next); return null; } catch { return autosaveMessages[locale].invalid; }
    },
    onSave: async (next) => {
      if (!chain.canAutosave || chain.revision === persistedRevision.current) return;
      const revision = chain.revision;
      const width = calculateSaddleWidth(next);
      const suitability = classifySaddleSuitability(next, width);
      const { inputMethod, symptoms: unusedSymptoms, ...measurements } = next;
      void unusedSymptoms;
      try {
        await saveSession({
        ...measurements,
        bikeId,
        expectedUserId: userId,
        measurementMethod: inputMethod,
        recommendedWidthMm: width.finalRecommendedWidthMm,
        widthRangeMinMm: width.widthRangeMinMm,
        widthRangeMaxMm: width.widthRangeMaxMm,
        primaryWidthClass: width.primaryWidthClass,
        saddleFamily: suitability.saddleFamily,
        noseType: suitability.noseType,
        profileShape: suitability.profileShape,
        cutoutRecommended: suitability.cutoutRecommended,
        paddingPreference: suitability.paddingPreference,
        confidenceScore: width.confidenceScore,
        confidenceLevel: width.confidenceLevel,
        widthMatchScore: width.widthMatchScore,
        fitInteractionWarnings: suitability.fitInteractionWarnings.map((warning) => warning.message),
        explanationKey: width.explanationKey,
        });
        persistedRevision.current = revision;
        failed.current = false;
      } catch (error) {
        failed.current = true;
        throw error;
      }
    },
  });
  async function selectBike(nextBikeId: string) {
    await autosave.flush();
    if (failed.current || chain.pendingChanges.length) return;
    try { calculateSaddleWidth(values); } catch { return; }
    onSelectBike(nextBikeId);
  }
  return (
    <div className="min-w-0 pb-16
      [&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))]
      md:[&_[data-slot=configurator-sticky-result]]:bottom-0">
      <CalculatorChainLayout calculator="saddle-width" locale={locale} chain={chain} context={context} bikeId={bikeId}>
      <AutosaveField flush={autosave.flush} commitOn="release">
        <SaddleWidthCalculatorForm key={chain.formKey} locale={locale} accountMode initialValues={values}
          copy={{ ...saddleWidthMessages[locale], confirmed: accountCopy.measurements }}
          onValuesChange={chain.setValues}
          headerSlot={
            <section aria-label={copy.chooseBike} className="space-y-3">
              <h2 className="font-display text-xl font-bold">{copy.chooseBike}</h2>
              <div role="group" aria-label={copy.chooseBike} className="grid gap-2 sm:grid-cols-2">
                <OptionCard label={copy.noBike} selected={!bikeId} onClick={() => { void selectBike(""); }} />
                {bikes.map((bike) => <OptionCard key={bike._id} label={bike.name}
                  selected={bike._id === bikeId} onClick={() => { void selectBike(bike._id); }} />)}
              </div>
              {bikes.length === 0 && <p className="text-sm text-muted-foreground">{copy.noBikes}</p>}
            </section>
          }
          statusSlot={
            <>
              <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry}
                updated={autosaveMessages[locale].updated} />
              {initial.invalidSaved && <p role="status" className="text-sm text-muted-foreground">{accountCopy.invalidSaved}</p>}
              {initial.profileFields.length > 0 && <p className="text-sm text-muted-foreground">
                {accountCopy.fromProfile}: {initial.profileFields.map((field) => accountCopy.fields[field]).join(", ")}.{" "}
                <Link href={withLocalePrefix("/profile", locale)} className="inline-flex min-h-11 items-center underline">
                  {accountCopy.profile}
                </Link>
              </p>}
            </>
          }
        />
      </AutosaveField>
      </CalculatorChainLayout>
      <section className="mx-4 mb-24 rounded-3xl border border-border bg-card p-6 sm:mx-8 xl:mx-16">
        <h2 className="font-display text-2xl font-bold">{copy.history}</h2>
        {sessions === undefined ? <p className="mt-4" role="status">{copy.historyLoading}</p>
          : sessions.length === 0 ? <p className="mt-4 text-muted-foreground">{copy.historyEmpty}</p>
            : <ul className="mt-4 space-y-3">{sessions.map((session) => (
              <li key={session._id} className="rounded-2xl border border-border p-4">
                <p className="font-mono text-sm">
                  {new Date(session.createdAt).toLocaleDateString(locale)} · {session.widthRangeMinMm}–{session.widthRangeMaxMm} mm
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {copy.families[session.saddleFamily as keyof typeof copy.families] ?? session.saddleFamily}
                </p>
              </li>
            ))}</ul>}
      </section>
    </div>
  );
}
