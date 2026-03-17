"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function isDirectUrl(source?: string) {
  return Boolean(
    source && (source.startsWith("http://") || source.startsWith("https://"))
  );
}

export function useResolvedImageUrl(source?: string) {
  const directUrl = isDirectUrl(source) ? source! : null;
  const storageUrl = useQuery(
    api.files.actions.getUrl,
    source && !directUrl ? { storageId: source } : "skip"
  );

  return directUrl ?? storageUrl ?? null;
}
