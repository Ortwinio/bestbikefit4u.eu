"use client";

import type { ReactNode } from "react";
import { MeasurementIllustrationCard } from "./MeasurementIllustrationCard";
import type { MeasurementIllustrationKey } from "./measurementIllustrations";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type IllustratedMeasurementHelpProps = {
  measurement: MeasurementIllustrationKey;
  children: ReactNode;
};

export function IllustratedMeasurementHelp({
  measurement,
  children,
}: IllustratedMeasurementHelpProps) {
  const { messages } = useDashboardMessages();
  return (
    <details className="rounded-2xl border border-border p-3">
      <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary focus-visible:focus-ring">{messages.profile.measurements.howToMeasure}</summary>
      <div className="grid gap-3 pt-3">
      {children}
      <div className="mx-auto w-full max-w-60">
        <MeasurementIllustrationCard measurement={measurement} />
      </div>
      </div>
    </details>
  );
}
