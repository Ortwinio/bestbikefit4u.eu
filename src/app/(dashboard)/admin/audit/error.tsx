"use client";

import { Button, ErrorState } from "@/components/ui";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Failed to load audit log"
      description={error.message}
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
