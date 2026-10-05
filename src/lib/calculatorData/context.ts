"use client";

import { createContext } from "react";
import type { HandoffCalculator, HandoffEntry, HandoffField } from "@/lib/handoff/store";

export interface CalculatorDataContextValue {
  source: "session" | "profile";
  ready: boolean;
  entries: HandoffEntry[];
  identity: string;
  save: (entry: HandoffEntry, options?: { inseamConfirmed?: boolean }) => void;
  remove: (field: HandoffField, calculator?: HandoffCalculator) => void;
}

export const CalculatorDataContext = createContext<CalculatorDataContextValue | null>(null);
