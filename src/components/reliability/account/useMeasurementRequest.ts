"use client";

import { useRef } from "react";

export function useMeasurementRequest() {
  const attempt = useRef<{ payload: string; requestId: string } | null>(null);
  return {
    requestId(payload: unknown) {
      const serialized = JSON.stringify(payload);
      if (attempt.current?.payload !== serialized) attempt.current = { payload: serialized, requestId: crypto.randomUUID() };
      return attempt.current!.requestId;
    },
    complete() { attempt.current = null; },
  };
}
