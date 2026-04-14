"use client";

import { ErrorState } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Unable to load marketing showcase"
      description={error.message}
      action={<button type="button" onClick={reset}>Try again</button>}
    />
  );
}
