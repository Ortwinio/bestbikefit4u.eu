"use client";

import Image from "next/image";
import { measurementIllustrations, type MeasurementIllustrationKey } from "./measurementIllustrations";

type MeasurementIllustrationCardProps = {
  measurement: MeasurementIllustrationKey;
};

export function MeasurementIllustrationCard({
  measurement,
}: MeasurementIllustrationCardProps) {
  const illustration = measurementIllustrations[measurement];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]">
      <div className="bg-[color:color-mix(in_oklch,var(--secondary)_78%,var(--background)_22%)] p-3">
        <div className="overflow-hidden rounded-[calc(var(--radius-lg)-0.25rem)] bg-[color:var(--background)]">
          <Image
            src={illustration.src}
            alt={illustration.alt}
            width={illustration.width}
            height={illustration.height}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
      <div className="border-t border-[color:var(--border)] px-4 py-3">
        <p className="text-sm text-[color:var(--muted-foreground)]">{illustration.caption}</p>
      </div>
    </div>
  );
}
