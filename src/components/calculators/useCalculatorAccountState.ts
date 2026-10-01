"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { CalculatorId, CalculatorState, CalculatorValues } from "../../../convex/calculatorStates/validators";
import { useAutosave } from "@/components/ui/useAutosave";
import { resolveCalculatorValues, validCalculatorState } from "@/lib/calculators/accountState";
import { autosaveMessages } from "@/i18n/account/autosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

/** Key the owning editor by user + calculator + bike; mount its form only after ready. */
export function useCalculatorAccountState<K extends CalculatorId>(calculator: K, {
  bikeId,
}: { bikeId?: Id<"bikes"> } = {}) {
  const { locale } = useDashboardMessages();
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const saved = useQuery(api.calculatorStates.queries.get, { calculator, bikeId });
  const save = useMutation(api.calculatorStates.mutations.upsert);
  const [edited, setValues] = useState<CalculatorValues<K> | null>(null);
  const ready = profile !== undefined && saved !== undefined;
  const [initial, setInitial] = useState<ReturnType<typeof resolveCalculatorValues<K>> | null>(null);
  if (ready && initial === null) {
    setInitial(resolveCalculatorValues<K>(calculator, saved?.state.values as CalculatorValues<K> | undefined, profile));
  }
  const values = edited ?? initial?.values ?? resolveCalculatorValues<K>(calculator, null).values;
  const autosave = useAutosave({
    value: values,
    enabled: ready && initial !== null,
    debounceMs: 500,
    validate: (next) => validCalculatorState({ calculator, values: next } as CalculatorState)
      ? null : autosaveMessages[locale].invalid,
    onSave: (next) => save({ bikeId, state: { calculator, values: next } as CalculatorState }),
  });
  return { ready: ready && initial !== null, values, setValues,
    fromProfile: Boolean(initial?.fromProfile && edited === null), autosave };
}
