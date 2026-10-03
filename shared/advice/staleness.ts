import type { InputDependency, InputProvenance, InputValue, Staleness, StaleReason } from "./types";

export function sameInputValue(left: InputValue, right: InputValue): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length
      && left.every((value, index) => value === right[index]);
  }
  return left === right;
}

export function isStale(provenance: InputProvenance | null | undefined,
  current: readonly InputDependency[]): Staleness {
  if (!provenance) return { stale: false, status: "unknown", reasons: [{ reason: "legacy_provenance" }] };
  const reasons: StaleReason[] = [];
  for (const dependency of provenance.dependencies) {
    const latest = current.find(candidate => candidate.field === dependency.field && candidate.bikeId === dependency.bikeId
      && candidate.record?.table === dependency.record?.table && candidate.record?.id === dependency.record?.id);
    const scope = { field: dependency.field, ...(dependency.bikeId ? { bikeId: dependency.bikeId } : {}),
      ...(dependency.record ? { record: dependency.record } : {}) };
    if (!latest) reasons.push({ ...scope, reason: "missing_input" });
    else if (!sameInputValue(dependency.value, latest.value)) reasons.push({ ...scope, reason: "value_changed" });
    else if (dependency.observationId !== latest.observationId) reasons.push({ ...scope, reason: "observation_changed" });
  }
  return { stale: reasons.length > 0, status: reasons.length ? "stale" : "current", reasons };
}
