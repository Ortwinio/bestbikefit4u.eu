"use client";

import { useContext, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { CalculatorId, CalculatorState, CalculatorValues } from "../../../convex/calculatorStates/validators";
import { useAutosave } from "@/components/ui/useAutosave";
import { resolveCalculatorValues, validCalculatorState } from "@/lib/calculators/accountState";
import type { ChainChange } from "@/lib/calculators/chain";
import { accountChainBindings } from "@/lib/calculators/accountChain";
import { autosaveMessages } from "@/i18n/account/autosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getRiderFtp } from "./RiderFtpPrefill";
import { useCalculatorChain } from "./useCalculatorChain";
import { CalculatorDataContext } from "@/lib/calculatorData/context";
import { changedAccountSharedInputs, prefillAccountSharedInputs } from "./accountSharedInputs";

/** The public form receives initialValues and must be keyed by formKey for live external rebases. */
export function useCalculatorAccountState<K extends CalculatorId>(calculator: K, {
  bikeId,
}: { bikeId?: Id<"bikes"> } = {}) {
  const { locale } = useDashboardMessages();
  const shared = useContext(CalculatorDataContext);
  const context = useQuery(api.calculatorChain.queries.getContext, { bikeId });
  const saved = useQuery(api.calculatorStates.queries.get, { calculator, bikeId });
  const save = useMutation(api.calculatorStates.mutations.upsert);
  const apply = useMutation(api.calculatorChain.mutations.applyChanges);
  const ready = context !== undefined && saved !== undefined && (!shared || shared.ready);
  const profile = context?.profile;
  const bike = context?.bikes.find((item) => item._id === bikeId);
  const resolved = resolveCalculatorValues(calculator,
    saved?.state.values as CalculatorValues<K> | undefined, profile, bike);
  const sharedInputs = prefillAccountSharedInputs(calculator, resolved.values, shared?.entries ?? [], saved?.updatedAt ?? 0);
  const bindings = accountChainBindings(calculator, profile, bike, context?.observations,
    context?.bikeObservations.filter((item) => item.bikeId === bikeId));
  if ("source" in resolved.values && resolved.values.source !== "missing") {
    const inseam = bindings.find((binding) => binding.field === "inseamCm");
    resolved.values.source = inseam?.kind === "measured" ? "measured" : "estimated";
  }
  const externalKey = JSON.stringify({ calculator, bikeId, ready,
    sharedIdentity: shared?.identity, userId: context?.userId,
    inputs: bindings.map(({ field, source, value, kind, recordedAt, measurePoint }) =>
      ({ field, source, value, kind, recordedAt, measurePoint })),
  });
  const chain = useCalculatorChain({ initialValues: sharedInputs.values, externalKey, autoSaveProfile: true,
    scopeKey: `${context?.userId ?? shared?.identity ?? ""}:${calculator}:${bikeId ?? ""}`, bindings, enabled: ready,
    applyChanges: async (changes, automatic) => {
      if (changes.some((change) => change.value === null)) throw new Error("Invalid input");
      const inputs: ChainChange[] = [...changes];
      if (changes.some((change) => change.field === "ftpWatts")
        && !changes.some((change) => change.field === "ftpMethod")) {
        inputs.push({ field: "ftpMethod", source: "profile", value: "known",
          expectedCurrentValue: profile?.ftpMethod ?? null, kind: "declared" });
      }
      return apply({ calculator, bikeId, automatic, expectedUserId: context?.userId, changes: inputs.map((change) => ({
        ...change, value: change.value as Exclude<typeof change.value, null>,
      })) });
    },
  });
  const persistedRevision = useRef(0);
  const autosave = useAutosave({
    value: chain.values,
    enabled: ready && chain.canAutosave,
    debounceMs: 500,
    validate: (next) => validCalculatorState({ calculator, values: next } as CalculatorState)
      ? null : autosaveMessages[locale].invalid,
    onSave: async (next) => {
      // Reactive context updates are not user edits and must not create calculator state writes.
      if (!chain.canAutosave || chain.revision === persistedRevision.current) return;
      await save({ bikeId, expectedUserId: context?.userId, state: { calculator, values: next } as CalculatorState });
      persistedRevision.current = chain.revision;
    },
  });
  const ftpEdited = [...chain.pendingChanges, ...chain.trialChanges].some((change) => change.field === "ftpWatts");
  const setValues: typeof chain.setValues = (next, confirmedFields) => {
    for (const entry of changedAccountSharedInputs(calculator, chain.values, next)) shared?.save(entry);
    chain.setValues(next, confirmedFields);
  };
  return { ready, values: chain.values, setValues, formKey: chain.formKey,
    profileFtp: ftpEdited ? null : getRiderFtp(profile),
    fromProfile: resolved.fromProfile, autosave, chain, context };
}
