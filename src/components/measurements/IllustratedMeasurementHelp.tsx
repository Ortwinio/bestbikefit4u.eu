"use client";

import type { ReactNode } from "react";
import { MeasurementIllustrationCard } from "./MeasurementIllustrationCard";
import type { MeasurementIllustrationKey } from "./measurementIllustrations";

type IllustratedMeasurementHelpProps = {
  measurement: MeasurementIllustrationKey;
  children: ReactNode;
};

export function IllustratedMeasurementHelp({
  measurement,
  children,
}: IllustratedMeasurementHelpProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem] md:items-start">
      {children}
      <div className="md:max-w-[15rem]">
        <MeasurementIllustrationCard measurement={measurement} />
      </div>
    </div>
  );
}
