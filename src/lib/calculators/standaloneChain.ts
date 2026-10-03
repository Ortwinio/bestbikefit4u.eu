import type { ChainBinding, ChainKind } from "./chain";

export type ChainEvidence = {
  field: string;
  kind?: string;
  recordedAt?: number;
  value?: unknown;
};

/** Evidence belongs to its matching current value, never to an older saved calculator snapshot. */
export function withChainEvidence<T>(
  bindings: ChainBinding<T>[], observations: ChainEvidence[] = [], bikeObservations: ChainEvidence[] = [],
): ChainBinding<T>[] {
  return bindings.map((binding) => {
    const evidence = (binding.source === "profile" ? observations : bikeObservations)
      .find((item) => item.field === binding.field && JSON.stringify(item.value) === JSON.stringify(binding.value));
    const kind = evidence?.kind;
    return { ...binding,
      kind: kind === "measured" || kind === "estimated" || kind === "derived" ? kind as ChainKind : "declared",
      recordedAt: evidence?.recordedAt,
    };
  });
}
