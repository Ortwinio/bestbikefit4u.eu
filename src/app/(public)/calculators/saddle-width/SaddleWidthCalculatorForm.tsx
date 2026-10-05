"use client";

import type { ComponentProps } from "react";
import { PublicBodyReliabilityCalculator } from "@/components/reliability/PublicBodyReliabilityCalculator";
import { LegacySaddleWidthCalculatorForm } from "./LegacySaddleWidthCalculatorForm";

export function SaddleWidthCalculatorForm(props: ComponentProps<typeof LegacySaddleWidthCalculatorForm>) {
  if (props.initialValues || props.onValuesChange || props.accountMode) return <LegacySaddleWidthCalculatorForm {...props} />;
  return <PublicBodyReliabilityCalculator calculator="saddle-width" locale={props.locale ?? (props.isNl ? "nl" : "en")} />;
}
