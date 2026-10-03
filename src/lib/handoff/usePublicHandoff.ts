"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
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
  const getSnapshot = useMemo(() => createSnapshotReader(enabled), [enabled]);
  const state = useSyncExternalStore(enabled ? subscribeHandoff : noSubscribe, getSnapshot, getServerSnapshot);
  const touch = useCallback((
    field: HandoffField,
    value: number | string,
    unit: HandoffUnit,
    method: HandoffMethod = "declared",
  ) => {
    if (enabled) writeHandoffEntry({ field, value, unit, method, calculator, touchedAt: Date.now() });
  }, [calculator, enabled]);
  const remove = useCallback((field: HandoffField) => {
    if (enabled) removeHandoffEntry(field);
  }, [enabled]);
  const getPrefill = useCallback((field: HandoffField) => {
    if (!enabled) return undefined;
    return state.initialEntries.find((entry) => entry.field === field && entry.calculator !== calculator);
  }, [calculator, enabled, state.initialEntries]);

  return { ...state, touch, remove, getPrefill };
}
