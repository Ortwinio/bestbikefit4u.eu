export async function runPool(items, concurrency, worker) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("Concurrency must be a positive integer");
  const results = new Array(items.length);
  let nextIndex = 0;
  let failed = false;
  let firstError;
  async function consume() {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        if (!failed) firstError = error;
        failed = true;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, consume));
  if (failed) throw firstError;
  return results;
}
