import { calculatorDataKey, isProfileCalculatorField } from "../../../shared/calculatorDataScope";
import { mergeHandoffEntries, type HandoffEntry } from "@/lib/handoff/store";

export function mergeProfileCalculatorEntries(existing: HandoffEntry[], incoming: HandoffEntry[]) {
  const entries = new Map(existing.map(entry => [calculatorDataKey(entry), entry]));
  for (const entry of incoming) {
    const key = calculatorDataKey(entry);
    const previous = entries.get(key);
    if (!previous) entries.set(key, entry);
    else if (isProfileCalculatorField(entry.field)) {
      entries.set(key, mergeHandoffEntries([previous], [entry])[0] ?? previous);
    } else if (entry.touchedAt > previous.touchedAt) entries.set(key, entry);
  }
  return [...entries.values()];
}
