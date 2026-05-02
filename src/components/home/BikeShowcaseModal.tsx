import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import type { PublicShowcaseBike } from "./bike-showcase.types";
import { BikeShowcaseFallback } from "./BikeShowcaseFallback";
import { pushDataLayerEvent } from "@/lib/analytics/marketing";
import { buildBikeFitHref } from "./bikeFitHref";

function barToPsi(bar: number): number {
  return Math.round(bar * 14.5038);
}

type BikeShowcaseModalProps = {
  bike: PublicShowcaseBike | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ctaHref: string;
  copy: {
    geometrySection: string;
    tyreSection: string;
    ctaButton: string;
    stackLabel: string;
    reachLabel: string;
    ettLabel: string;
    staLabel: string;
    htaLabel: string;
    wheelbaseLabel: string;
    tyreLabel: string;
    frontLabel: string;
    rearLabel: string;
    pressureUnit: string;
    psiUnit: string;
    pressureDisclaimer: string;
    pressureAvailable: string;
    geometrySource: string;
    partialGeometry: string;
    mmUnit: string;
    degUnit: string;
  };
};

type GeometryRow = {
  label: string;
  value: string;
};

function buildGeometryRows(
  geo: PublicShowcaseBike["geometry"],
  copy: Pick<BikeShowcaseModalProps["copy"], "stackLabel" | "reachLabel" | "ettLabel" | "staLabel" | "htaLabel" | "wheelbaseLabel" | "mmUnit" | "degUnit">
): GeometryRow[] {
  const rows: GeometryRow[] = [];
  if (geo.stackMm !== null) rows.push({ label: copy.stackLabel, value: `${geo.stackMm} ${copy.mmUnit}` });
  if (geo.reachMm !== null) rows.push({ label: copy.reachLabel, value: `${geo.reachMm} ${copy.mmUnit}` });
  if (geo.effectiveTopTubeMm !== null) rows.push({ label: copy.ettLabel, value: `${geo.effectiveTopTubeMm} ${copy.mmUnit}` });
  if (geo.seatTubeAngle !== null) rows.push({ label: copy.staLabel, value: `${geo.seatTubeAngle}${copy.degUnit}` });
  if (geo.headTubeAngle !== null) rows.push({ label: copy.htaLabel, value: `${geo.headTubeAngle}${copy.degUnit}` });
  if (geo.wheelbaseMm !== null) rows.push({ label: copy.wheelbaseLabel, value: `${geo.wheelbaseMm} ${copy.mmUnit}` });
  return rows;
}

export function BikeShowcaseModal({
  bike,
  open,
  onOpenChange,
  ctaHref,
  copy,
}: BikeShowcaseModalProps) {
  if (!bike) return null;

  const geometryRows = buildGeometryRows(bike.geometry, copy);
  const hasFullGeometry = geometryRows.length >= 4;
  const bikeFitHref = buildBikeFitHref(ctaHref, bike);

  function handleCtaClick() {
    pushDataLayerEvent({ event: "bike_showcase_cta_click" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto sm:max-w-2xl">
        <div className="space-y-6">
          {/* Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            {bike.photoUrl ? (
              <Image
                src={bike.photoUrl}
                alt={`${bike.brand} ${bike.model}`}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
                loading="lazy"
              />
            ) : (
              <BikeShowcaseFallback bikeType={bike.bikeType} className="h-full w-full" />
            )}
          </div>

          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {bike.brand} {bike.model}
              {bike.geometry.yearLabel ? ` · ${bike.geometry.yearLabel}` : ""}
            </DialogTitle>
            {bike.geometry.sizeLabel ? (
              <p className="text-sm text-muted-foreground">{bike.geometry.sizeLabel}</p>
            ) : null}
          </DialogHeader>

          {/* Geometry */}
          {geometryRows.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {copy.geometrySection}
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                {geometryRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="text-sm font-semibold">{row.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground/60">
                {copy.geometrySource}
                {!hasFullGeometry ? ` · ${copy.partialGeometry}` : ""}
              </p>
            </div>
          )}

          {/* Tyre pressure */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {copy.tyreSection}
            </h3>
            {bike.pressure.hasData &&
            bike.pressure.frontMinBar !== null &&
            bike.pressure.frontMaxBar !== null &&
            bike.pressure.rearMinBar !== null &&
            bike.pressure.rearMaxBar !== null ? (
              <div className="space-y-2">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground">{copy.frontLabel}</p>
                    <p className="text-sm font-semibold">
                      {bike.pressure.frontMinBar}–{bike.pressure.frontMaxBar} {copy.pressureUnit}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({barToPsi(bike.pressure.frontMinBar)}–{barToPsi(bike.pressure.frontMaxBar)} {copy.psiUnit})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{copy.rearLabel}</p>
                    <p className="text-sm font-semibold">
                      {bike.pressure.rearMinBar}–{bike.pressure.rearMaxBar} {copy.pressureUnit}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({barToPsi(bike.pressure.rearMinBar)}–{barToPsi(bike.pressure.rearMaxBar)} {copy.psiUnit})
                      </span>
                    </p>
                  </div>
                </div>
                {bike.pressure.tyreWidthMm !== null ? (
                  <p className="text-xs text-muted-foreground">
                    {bike.pressure.tyreWidthMm}mm
                    {bike.pressure.tubeless ? " tubeless" : ""}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground/60 italic">{copy.pressureDisclaimer}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{copy.pressureAvailable}</p>
            )}
          </div>

          {/* CTA */}
          <Button
            className="w-full"
            render={<Link href={bikeFitHref} onClick={handleCtaClick} />}
          >
            {copy.ctaButton}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
