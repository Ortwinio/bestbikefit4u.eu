export type ChainValue = number | string | number[] | string[] | null;
export type ChainSource = "profile" | "bike";
export type ChainKind = "measured" | "estimated" | "derived" | "declared";

export interface ChainBinding<T> {
  field: string;
  source: ChainSource;
  value: ChainValue | undefined;
  unit?: string;
  kind?: ChainKind;
  recordedAt?: number;
  measurePoint?: string;
  read: (values: T) => ChainValue | undefined;
  write: (values: T, value: ChainValue) => T;
}
export interface ChainChange {
  field: string;
  source: ChainSource;
  value: ChainValue;
  expectedCurrentValue: ChainValue;
  kind: ChainKind;
  measurePoint?: "bb_center_to_saddle_top";
}
export interface ChainSaveResult {
  status: "saved" | "conflict";
  conflicts?: unknown[];
}
export type ChainInput = Omit<ChainBinding<never>, "read" | "write"> & { storedValue?: ChainValue };
export function equalChainValues(a: unknown, b: unknown): boolean {
  return Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((value, index) => value === b[index]) : Object.is(a, b);
}
export const chainFieldKey = (field: Pick<ChainChange, "field" | "source">) => `${field.source}:${field.field}`;

/** Compare user events to the current editor, never compare a full form against defaults. */
export function changedChainInputs<T>(
  previous: T, next: T, bindings: ChainBinding<T>[], pending: ChainChange[],
  confirmedFields: readonly string[] = [],
): ChainChange[] {
  const changes = new Map(pending.map((change) => [chainFieldKey(change), change]));
  for (const binding of bindings) {
    const value = binding.read(next);
    if (value === undefined || (equalChainValues(binding.read(previous), value)
      && !confirmedFields.includes(binding.field))) continue;
    const key = chainFieldKey(binding);
    if (equalChainValues(value, binding.value ?? null)) {
      changes.delete(key);
      continue;
    }
    changes.set(key, {
      field: binding.field, source: binding.source, value,
      expectedCurrentValue: changes.has(key) ? changes.get(key)!.expectedCurrentValue : binding.value ?? null,
      // Editing a number does not assert that the rider measured it.
      kind: "declared", ...(binding.measurePoint === "bb_center_to_saddle_top" ? { measurePoint: binding.measurePoint } : {}),
    });
  }
  return [...changes.values()];
}
export function applyChainOverrides<T>(values: T, changes: ChainChange[], bindings: ChainBinding<T>[]): T {
  return changes.reduce((next, change) => {
    const binding = bindings.find((item) => chainFieldKey(item) === chainFieldKey(change));
    return binding ? binding.write(next, change.value) : next;
  }, values);
}
