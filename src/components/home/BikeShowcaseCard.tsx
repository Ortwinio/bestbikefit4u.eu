import { useState } from "react";
import { cn } from "@/utils/cn";
import type { PublicShowcaseBike } from "./bike-showcase.types";
import { BikeShowcaseFallback } from "./BikeShowcaseFallback";

const BIKE_TYPE_DISPLAY: Record<string, string> = {
  road: "Road",
  gravel: "Gravel",
  mountain: "Mountain",
  hybrid: "Hybrid",
  tt_triathlon: "TT / Triathlon",
  cyclocross: "Cyclocross",
  touring: "Touring",
  city: "City",
};

type BikeShowcaseCardProps = {
  bike: PublicShowcaseBike;
  copy: {
    geometryVerified: string;
    stackLabel: string;
    reachLabel: string;
    pressureUnit: string;
    pressureAvailable: string;
    viewDetails: string;
    cardAriaLabel: string;
    mmUnit: string;
  };
  onClick: () => void;
  className?: string;
};

export function BikeShowcaseCard({
  bike,
  copy,
  onClick,
  className,
}: BikeShowcaseCardProps) {
  const [imgError, setImgError] = useState(false);

  const ariaLabel = copy.cardAriaLabel
    .replace("{brand}", bike.brand)
    .replace("{model}", bike.model);

  const hasStack = bike.geometry.stackMm !== null;
  const hasReach = bike.geometry.reachMm !== null;

  const pressureSnippet =
    bike.pressure.hasData && bike.pressure.rearMinBar !== null && bike.pressure.rearMaxBar !== null
      ? `${bike.pressure.rearMinBar}–${bike.pressure.rearMaxBar} ${copy.pressureUnit}`
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-roledescription="slide"
      className={cn(
        "group min-w-[16rem] snap-start shrink-0 cursor-pointer rounded-xl border border-border bg-card text-left outline-none ring-ring transition-shadow hover:shadow-md focus-visible:ring-2 lg:min-w-0 lg:w-[calc((100%-4rem)/5)]",
        className
      )}
    >
      {/* Image area */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
        {bike.photoUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bike.photoUrl}
            alt={`${bike.brand} ${bike.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <BikeShowcaseFallback bikeType={bike.bikeType} className="h-full w-full" />
        )}

        {/* Trust badge */}
        <div className="absolute right-2 top-2">
          <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
            {copy.geometryVerified}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">
              {bike.brand} {bike.model}
            </p>
            {bike.geometry.yearLabel ? (
              <p className="text-xs text-muted-foreground">{bike.geometry.yearLabel}</p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {BIKE_TYPE_DISPLAY[bike.bikeType] ?? bike.bikeType}
          </span>
        </div>

        {(hasStack || hasReach) && (
          <p className="text-xs text-foreground/70">
            {hasStack ? `${copy.stackLabel} ${bike.geometry.stackMm}${copy.mmUnit}` : ""}
            {hasStack && hasReach ? " · " : ""}
            {hasReach ? `${copy.reachLabel} ${bike.geometry.reachMm}${copy.mmUnit}` : ""}
          </p>
        )}

        {pressureSnippet ? (
          <p className="text-xs text-muted-foreground">
            {pressureSnippet}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60">{copy.pressureAvailable}</p>
        )}

        {/* View details hint */}
        <p className="translate-y-1 text-xs font-semibold text-primary opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
          {copy.viewDetails} →
        </p>
      </div>
    </button>
  );
}
