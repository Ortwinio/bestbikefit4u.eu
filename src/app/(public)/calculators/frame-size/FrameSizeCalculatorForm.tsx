"use client";

import type { ComponentProps } from "react";
import { PublicBodyReliabilityCalculator } from "@/components/reliability/PublicBodyReliabilityCalculator";
import { LegacyFrameSizeCalculatorForm } from "./LegacyFrameSizeCalculatorForm";

export function FrameSizeCalculatorForm(props: ComponentProps<typeof LegacyFrameSizeCalculatorForm>) {
  if (props.initialValues || props.onValuesChange) return <LegacyFrameSizeCalculatorForm {...props} />;
  return <PublicBodyReliabilityCalculator calculator="frame-size" locale={props.locale ?? (props.isNl ? "nl" : "en")} />;
}
