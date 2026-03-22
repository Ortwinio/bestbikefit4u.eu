"use client";

import { useEffect } from "react";
import { Button, ErrorState } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Failed to load admin settings"
      description="The settings route could not load. Retry to re-run the live Convex queries."
      action={
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
      }
    />
  );
}
