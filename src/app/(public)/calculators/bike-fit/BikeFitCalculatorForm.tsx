"use client";

import type { ComponentProps } from "react";
import { PublicBodyReliabilityCalculator } from "@/components/reliability/PublicBodyReliabilityCalculator";
import { LegacyBikeFitCalculatorForm } from "./LegacyBikeFitCalculatorForm";

export function BikeFitCalculatorForm(props: ComponentProps<typeof LegacyBikeFitCalculatorForm>) {
  if (props.initialValues || props.onValuesChange || props.continueAction) return <LegacyBikeFitCalculatorForm {...props} />;
  return <PublicBodyReliabilityCalculator calculator="bike-fit" locale={props.isNl ? "nl" : "en"} />;
}
