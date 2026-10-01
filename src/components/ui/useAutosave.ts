"use client";

import { useEffect, useState } from "react";
import { AutosaveController, type AutosaveOptions, type AutosaveState } from "./autosave";

/** Mount one hook per independent group; key the owner when its record identity changes. */
export function useAutosave<T>(options: AutosaveOptions<T>) {
  const [controller] = useState(() => new AutosaveController(options));
  const [snapshot, setSnapshot] = useState<{ state: AutosaveState; error: string | null }>({
    state: "idle", error: null,
  });
  useEffect(() => controller.subscribe((state, error) => setSnapshot({ state, error })), [controller]);
  useEffect(() => { controller.update(options); }, [controller, options]);
  useEffect(() => {
    const flushHidden = () => {
      if (document.visibilityState === "hidden") void controller.flush();
    };
    const flush = () => { void controller.flush(); };
    document.addEventListener("visibilitychange", flushHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flushHidden);
      window.removeEventListener("pagehide", flush);
      controller.detach();
    };
  }, [controller]);
  return { ...snapshot, flush: controller.flush, retry: controller.retry };
}
