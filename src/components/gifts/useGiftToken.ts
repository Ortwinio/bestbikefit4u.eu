"use client";

import { useSyncExternalStore } from "react";
import { captureGiftToken } from "./giftHelpers";

let currentToken: string | null | undefined;

function subscribe(onChange: () => void) {
  function update() {
    currentToken = captureGiftToken();
    onChange();
  }
  update();
  window.addEventListener("hashchange", update);
  return () => window.removeEventListener("hashchange", update);
}

export function useGiftToken() {
  return useSyncExternalStore(
    subscribe,
    () => currentToken,
    () => undefined,
  );
}
