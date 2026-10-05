"use client";

import { useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { CalculatorDataContext } from "@/lib/calculatorData/context";
import { isProfileCalculatorField } from "../../../shared/calculatorDataScope";
import {
  getHandoffRetention, readHandoff, removeHandoffEntry, subscribeHandoff, writeHandoffEntry,
  type HandoffCalculator, type HandoffEntry, type HandoffField, type HandoffMethod, type HandoffUnit,
} from "./store";

interface HandoffState {
  entries: HandoffEntry[];
  initialEntries: HandoffEntry[];
  ready: boolean;
  retention: "session" | "persistent";
}
const emptyState: HandoffState = { entries: [], initialEntries: [], ready: false, retention: "session" };
const getServerSnapshot = () => emptyState;
const noSubscribe = () => () => undefined;

function createSnapshotReader(enabled: boolean) {
  let snapshot = emptyState;
  let serialized: string | undefined;
  return () => {
    if (!enabled) return emptyState;
    const entries = readHandoff().entries;
    const retention = getHandoffRetention();
    const next = JSON.stringify({ entries, retention });
    if (next !== serialized) {
      snapshot = {
        entries,
        retention,
        initialEntries: snapshot.ready ? snapshot.initialEntries : entries,
        ready: true,
      };
      serialized = next;
    }
    return snapshot;
  };
}

/** Only call touch from an actual user edit/confirmation, never from a prefill effect. */
export function usePublicHandoff(calculator: HandoffCalculator, enabled = true) {
  const shared = useContext(CalculatorDataContext);
  const sessionEnabled = enabled && (!shared || (shared.ready && shared.source === "session"));
  const getSnapshot = useMemo(() => createSnapshotReader(sessionEnabled), [sessionEnabled]);
  const session = useSyncExternalStore(sessionEnabled ? subscribeHandoff : noSubscribe, getSnapshot, getServerSnapshot);
  const profileEntries = useMemo(() => shared?.entries.filter(entry =>
    isProfileCalculatorField(entry.field) || entry.calculator === calculator) ?? [], [shared?.entries, calculator]);
  const state = enabled && shared?.source === "profile"
    ? { entries: profileEntries, initialEntries: profileEntries, ready: shared.ready, retention: "session" as const }
    : session;
  const touch = useCallback((
    field: HandoffField,
    value: number | string,
    unit: HandoffUnit,
    method: HandoffMethod = "declared",
    options?: { inseamConfirmed?: boolean },
  ) => {
    if (!enabled || (shared && !shared.ready)) return;
    const entry = { field, value, unit, method, calculator, touchedAt: Date.now() };
    if (shared?.source === "profile") shared.save(entry, options);
    else writeHandoffEntry(entry);
  }, [calculator, enabled, shared]);
  const remove = useCallback((field: HandoffField) => {
    if (!enabled || (shared && !shared.ready)) return;
    if (shared?.source === "profile") shared.remove(field, calculator);
    else removeHandoffEntry(field);
  }, [enabled, shared, calculator]);
  const getPrefill = useCallback((field: HandoffField) => {
    if (!enabled) return undefined;
    return state.initialEntries.find((entry) => entry.field === field);
  }, [enabled, state.initialEntries]);

  return { ...state, source: shared?.source ?? "session", touch, remove, getPrefill };
}
