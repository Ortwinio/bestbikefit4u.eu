import { useSyncExternalStore } from "react";
import { getFunctionName } from "convex/server";
import * as base from "../final-sweep/account-fixture-bikes-runtime.jsx";
export * from "../final-sweep/account-fixture-bikes-runtime.jsx";
const listeners = new Set();
let version = 0;
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const snapshot = () => version;
const stored = JSON.parse(localStorage.getItem("bike-autosave") || "null");
const state = stored || {
  bike: {},
  wheelset: {
    _id: "visual-wheel",
    bikeId: "visual-bike",
    userId: "visual-user",
    name: "Wielen",
    rimType: "hooked",
    internalRimWidthFrontMm: 21,
    internalRimWidthRearMm: 21,
    isActive: true,
  },
  tire: {
    _id: "visual-tire",
    wheelsetId: "visual-wheel",
    userId: "visual-user",
    name: "Banden",
    widthFrontMm: 28,
    widthRearMm: 28,
    tubeType: "tubeless",
    isActive: true,
  },
};
let failed = false;
export function usePaginatedQuery(reference, args) {
  return base.usePaginatedQuery(reference, args);
}
export function useQuery(reference, args) {
  useSyncExternalStore(subscribe, snapshot, snapshot);
  const name = getFunctionName(reference);
  if (args === "skip") return undefined;
  if (name === "tireSetups/queries:listForWheelset") return [state.tire];
  const value = base.useQuery(reference, args);
  if (name === "bikes/queries:getById") return { ...value, ...state.bike };
  if (name === "bikes/queries:getDetail")
    return {
      ...value,
      bike: { ...value.bike, ...state.bike },
      wheelsets: [{ ...state.wheelset, tireSetups: [state.tire] }],
      activeWheelset: state.wheelset,
      activeTireSetup: state.tire,
    };
  if (name === "wheelsets/queries:listForBike") return [state.wheelset];
  return value;
}
export function useMutation(reference) {
  const name = getFunctionName(reference);
  return async (args) => {
    if (
      ![
        "bikes/mutations:update",
        "wheelsets/mutations:update",
        "tireSetups/mutations:update",
        "bikes/mutations:updateDescription",
      ].includes(name)
    )
      return null;
    window.__visualActions.push({ name, args });
    await new Promise((done) => setTimeout(done, 1400));
    if (base.fixture === "save-error" && !failed) {
      failed = true;
      throw new Error("Fixture offline");
    }
    const key = name.startsWith("wheelsets/") ? "wheelset" : name.startsWith("tireSetups/") ? "tire" : "bike";
    const { bikeId, wheelsetId, tireSetupId, clearFields, ...patch } = args;
    Object.assign(state[key], patch);
    for (const field of clearFields || []) delete state[key][field];
    localStorage.setItem("bike-autosave", JSON.stringify(state));
    version += 1;
    listeners.forEach((fn) => fn());
    return null;
  };
}
