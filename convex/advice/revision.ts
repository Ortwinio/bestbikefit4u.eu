export function resetAdviceProgress(outcome: { adviceRevision?: number }) {
  const revision = outcome.adviceRevision ?? 0;
  if (!Number.isSafeInteger(revision) || revision < 0 || revision === Number.MAX_SAFE_INTEGER) {
    throw new Error("INVALID_ADVICE_REVISION");
  }
  return { adviceRevision: revision + 1, adviceProgress: undefined };
}
