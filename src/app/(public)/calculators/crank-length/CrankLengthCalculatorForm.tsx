"use client";

import type { ComponentProps } from "react";
import { PublicBodyReliabilityCalculator } from "@/components/reliability/PublicBodyReliabilityCalculator";
import { LegacyCrankLengthCalculatorForm } from "./LegacyCrankLengthCalculatorForm";

export function CrankLengthCalculatorForm(props: ComponentProps<typeof LegacyCrankLengthCalculatorForm>) {
  if (props.initialValues || props.onValuesChange) return <LegacyCrankLengthCalculatorForm {...props} />;
  return <PublicBodyReliabilityCalculator calculator="crank-length" locale={props.locale} />;
}
