"use client";

import { useEffect, useRef } from "react";

/** Notify actual edits only; mounting a prefilled form must not write a new record. */
export function useCalculatorValuesChange<T>(values: T, onChange?: (values: T) => void) {
  const key = JSON.stringify(values);
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    onChange?.(values);
  }, [key, values, onChange]);
}
