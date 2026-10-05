"use client";

import type { ComponentProps } from "react";
import { AccountSaddleHeightCalculatorForm } from "./AccountSaddleHeightCalculatorForm";
import { PublicSaddleHeightCalculator } from "./PublicSaddleHeightCalculator";

type Props = ComponentProps<typeof AccountSaddleHeightCalculatorForm> & {
  mode?: "full" | "quick";
  onInseamAdded?: () => void;
};

export function SaddleHeightCalculatorForm(props: Props) {
  if (props.initialValues || props.onValuesChange) return <AccountSaddleHeightCalculatorForm {...props} />;
  return <PublicSaddleHeightCalculator
    isNl={props.isNl} mode={props.mode} onInseamAdded={props.onInseamAdded}
  />;
}
