"use client";
import { createContext, useContext, type ReactNode } from "react";
export interface CalculatorChainSlots {
  inputs: ReactNode;
  afterResults: ReactNode;
  editLabel: string;
  expandInputs: boolean;
}
export const CalculatorChainSlotsContext = createContext<CalculatorChainSlots | null>(null);
export const useCalculatorChainSlots = () => useContext(CalculatorChainSlotsContext);
