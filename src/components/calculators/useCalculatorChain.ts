"use client";

import { useEffect, useRef, useState } from "react";
import {
  applyChainOverrides, changedChainInputs, chainFieldKey, equalChainValues,
  type ChainBinding, type ChainChange, type ChainInput, type ChainSaveResult, type ChainKind,
} from "@/lib/calculators/chain";

export interface CalculatorChainOptions<T> {
  initialValues: T;
  /** Only authoritative profile, selected bike and observations; never local edits or autosave echoes. */
  externalKey: string;
  scopeKey?: string;
  bindings: ChainBinding<T>[];
  applyChanges: (changes: ChainChange[]) => Promise<ChainSaveResult>;
  enabled?: boolean;
}
export function useCalculatorChain<T>({
  initialValues, externalKey, bindings, applyChanges, enabled = true, scopeKey = "",
}: CalculatorChainOptions<T>) {
  const requestGeneration = useRef(0);
  useEffect(() => {
    // A late request must never update another bike editor or an unmounted calculator.
    requestGeneration.current += 1;
    return () => { requestGeneration.current += 1; };
  }, [scopeKey]);
  const [editor, setEditor] = useState(() => ({
    key: externalKey, scopeKey, values: initialValues, pending: [] as ChainChange[], trial: [] as ChainChange[],
    revision: 0, formVersion: 0,
  }));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "conflict" | "error">("idle");
  const [error, setError] = useState<unknown>(null);
  const [savedChanges, setSavedChanges] = useState<ChainChange[]>([]);
  const [conflicts, setConflicts] = useState<unknown[]>([]);
  if (enabled && editor.key !== externalKey) {
    const sameScope = editor.scopeKey === scopeKey;
    if (!sameScope) {
      setStatus("idle");
      setError(null);
      setConflicts([]);
      setSavedChanges([]);
    }
    setEditor({ ...editor, key: externalKey, scopeKey,
      pending: sameScope ? editor.pending : [], trial: sameScope ? editor.trial : [],
      values: sameScope ? applyChainOverrides(initialValues, [...editor.trial, ...editor.pending], bindings) : initialValues,
      formVersion: editor.formVersion + 1,
    });
  }
  function setValues(values: T, confirmedFields: readonly string[] = []) {
    setEditor((current) => {
      const changed = new Set(bindings.filter((binding) =>
        confirmedFields.includes(binding.field)
          || !equalChainValues(binding.read(current.values), binding.read(values))).map(chainFieldKey));
      return { ...current, values, revision: current.revision + 1,
        pending: changedChainInputs(current.values, values, bindings,
          [...current.pending, ...current.trial.filter((change) => changed.has(chainFieldKey(change)))],
          confirmedFields),
        trial: current.trial.filter((change) => !changed.has(chainFieldKey(change))),
      };
    });
    setStatus("idle");
    setError(null);
  }
  async function saveToProfile() {
    if (!enabled || status === "saving") return;
    const snapshot = editor;
    const generation = requestGeneration.current;
    const pending = [...editor.trial, ...editor.pending];
    const changes = [...new Map(pending.map((change) => [chainFieldKey(change), change])).values()];
    if (!changes.length) return;
    setStatus("saving");
    setError(null);
    try {
      const result = await applyChanges(changes);
      if (requestGeneration.current !== generation) return;
      if (result.status === "conflict") {
        setConflicts(result.conflicts ?? []);
        setStatus("conflict");
        return;
      }
      setEditor((current) => current.revision === snapshot.revision
        ? { ...current, pending: [], trial: [] } : current);
      setConflicts([]);
      setSavedChanges(changes);
      setStatus("saved");
    } catch (failure) {
      if (requestGeneration.current !== generation) return;
      setError(failure);
      setStatus("error");
    }
  }
  function useForThisCalculation() {
    setEditor((current) => ({ ...current, pending: [], trial: [
      ...new Map([...current.trial, ...current.pending].map((change) => [chainFieldKey(change), change])).values(),
    ] }));
    setStatus("idle");
    setError(null);
  }
  function discardChanges() {
    setEditor((current) => ({ ...current, values: initialValues, pending: [], trial: [],
      revision: current.revision + 1, formVersion: current.formVersion + 1,
    }));
    setStatus("idle");
    setError(null);
    setConflicts([]);
  }
  function setChangeKind(field: string, kind: ChainKind, measurePoint?: "bb_center_to_saddle_top") {
    const update = (changes: ChainChange[]) => changes.map((change) => change.field === field
      ? { ...change, kind, ...(measurePoint ? { measurePoint } : {}) } : change);
    setEditor((current) => ({ ...current, revision: current.revision + 1,
      pending: update(current.pending), trial: update(current.trial) }));
  }
  const usedInputs: ChainInput[] = bindings.filter((binding) => binding.read(editor.values) !== undefined)
    .map((binding) => {
    const { field, source, value, unit, kind, recordedAt, measurePoint } = binding;
    const override = [...editor.pending, ...editor.trial].find((change) => chainFieldKey(change) === chainFieldKey(binding));
    return { field, source, unit, recordedAt, measurePoint, storedValue: value,
      value: override ? binding.read(editor.values) : value, kind: override?.kind ?? kind };
  });
  return {
    values: editor.values, setValues, revision: editor.revision, formKey: `${externalKey}:${editor.formVersion}`,
    pendingChanges: editor.pending, usedInputs, saveToProfile, useForThisCalculation, discardChanges,
    status, error, conflicts, savedChanges, setChangeKind, trialChanges: editor.trial, trial: editor.trial.length > 0,
    canAutosave: enabled && !editor.pending.length && !editor.trial.length && status !== "saving",
  };
}

export type ChainController<T> = ReturnType<typeof useCalculatorChain<T>>;
export type ChainPanelController = Omit<ChainController<unknown>, "values" | "setValues" | "revision">;
