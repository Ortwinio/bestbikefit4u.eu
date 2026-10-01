"use client";

import type { ReactNode, SyntheticEvent } from "react";
import type { AutosaveState } from "./autosave";
import { Button } from "./Button";

export type AutosaveMessages = { saving: string; saved: string; error: string; retry: string };

export function AutosaveStatus({ state, messages, onRetry, error, updated }: {
  state: AutosaveState;
  messages: AutosaveMessages;
  onRetry: () => unknown;
  error?: string | null;
  updated?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="col-span-full min-h-6 text-sm text-muted-foreground">
      {(state === "pending" || state === "saving") && messages.saving}
      {state === "saved" && <span>{messages.saved}{updated ? ` · ${updated}` : ""}</span>}
      {state === "invalid" && <span className="text-destructive-text">{error}</span>}
      {state === "error" && (
        <span className="inline-flex flex-wrap items-center gap-2 text-destructive-text">
          {messages.error}
          <Button variant="outline" size="sm" onClick={() => { void onRetry(); }}>{messages.retry}</Button>
        </span>
      )}
    </div>
  );
}

/** Text groups flush on blur; slider/segment groups may also commit on release. */
export function AutosaveField({ children, flush, commitOn = "blur", className }: {
  children: ReactNode;
  flush: () => unknown;
  commitOn?: "blur" | "release";
  className?: string;
}) {
  const release = (event: SyntheticEvent) => {
    if (commitOn !== "release") return;
    const target = event.target as HTMLElement;
    // Text fields keep their typing debounce; slider/option events commit after React's update.
    if (target.closest("textarea,input:not([type=range]):not([type=radio]):not([type=checkbox])")) return;
    setTimeout(() => { void flush(); }, 0);
  };
  return (
    <div
      className={className}
      onBlurCapture={() => { void flush(); }}
      onPointerUpCapture={release}
      onKeyUpCapture={release}
      onClick={release}
    >
      {children}
    </div>
  );
}
