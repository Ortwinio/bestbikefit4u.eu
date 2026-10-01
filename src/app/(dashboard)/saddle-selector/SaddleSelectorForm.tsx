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
import { getSaddleInitialValues } from "./saddleAccountState";

export { mapBikeToRidingTypeFromBike, mapGoalToPosture, normalizeProfileSitBoneWidth } from "./saddleAccountState";

type Profile = FunctionReturnType<typeof api.profiles.queries.getMyProfile>;
type Bikes = FunctionReturnType<typeof api.bikes.queries.list>;
type Saved = FunctionReturnType<typeof api.saddleWidth.queries.getLatestSaddleWidthSession>;

export function SaddleSelectorForm() {
  const { locale } = useDashboardMessages();
  const params = useSearchParams();
  const [override, setOverride] = useState<string | null>(null);
  const requestedBikeId = override ?? params.get("bikeId") ?? "";
  const user = useQuery(api.users.queries.getCurrentUser);
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bikes = useQuery(api.bikes.queries.list, {});
  const bikeId = bikes?.find((item) => item._id === requestedBikeId)?._id;
  const saved = useQuery(api.saddleWidth.queries.getLatestSaddleWidthSession,
    bikes === undefined ? "skip" : { bikeId });
  if (!user || profile === undefined || bikes === undefined || saved === undefined) {
    return <LoadingState label={toolsSaddleMessages[locale].loading} />;
  }
  return <SaddleEditor key={`${user._id}:${bikeId ?? "no-bike"}`}
    userId={user._id} profile={profile} bikes={bikes} bikeId={bikeId} saved={saved} onSelectBike={setOverride} />;
}

function SaddleEditor({ userId, profile, bikes, bikeId, saved, onSelectBike }: {
  userId: Id<"users">;
  profile: Profile;
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
  const [initial] = useState(() => getSaddleInitialValues(saved, profile, bikes.find((bike) => bike._id === bikeId)));
  const [values, setValues] = useState<SaddleWidthInput>(() => ({
    inputMethod: initial.values.inputMethod,
    ridingType: initial.values.ridingType,
    postureCategory: initial.values.postureCategory,
    ...(initial.values.inputMethod === "measured"
      ? { sitBoneWidthMm: initial.values.sitBoneWidthMm }
      : { heightCm: initial.values.heightCm, weightKg: initial.values.weightKg,
          hipCircumferenceCm: initial.values.hipCircumferenceCm }),
  }));
  const failed = useRef(false);
  const autosave = useAutosave({
    value: values,
    debounceMs: 500,
    validate: (next) => {
      try { calculateSaddleWidth(next); return null; } catch { return autosaveMessages[locale].invalid; }
    },
    onSave: async (next) => {
      const width = calculateSaddleWidth({ ...next, currentSaddleWidthMm: saved?.currentSaddleWidthMm });
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
        failed.current = false;
      } catch (error) {
        failed.current = true;
        throw error;
      }
    },
  });
  async function selectBike(nextBikeId: string) {
    await autosave.flush();
    if (failed.current) return;
    try { calculateSaddleWidth(values); } catch { return; }
    onSelectBike(nextBikeId);
  }
  return (
    <div className="min-w-0 pb-16
      [&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))]
      md:[&_[data-slot=configurator-sticky-result]]:bottom-0">
      <AutosaveField flush={autosave.flush} commitOn="release">
        <SaddleWidthCalculatorForm locale={locale} accountMode initialValues={initial.values}
          copy={{ ...saddleWidthMessages[locale], confirmed: accountCopy.measurements }}
          onValuesChange={setValues}
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
