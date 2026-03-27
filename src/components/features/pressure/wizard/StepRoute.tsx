import type { Surface } from "@/lib/pressure-engine";
import { NumberInput, Selectable, Slider } from "@/components/ui";
import { Field } from "@/components/ui/Field";
import { surfaceLabel } from "../shared";

interface StepRouteProps {
  locale: "en" | "nl";
  surface: Surface;
  routeDistanceKm: number | undefined;
  routeElevationM: number | undefined;
  offRoadPercent: number;
  onUpdate: (
    updates: Partial<{
      surface: Surface;
      routeDistanceKm: number | undefined;
      routeElevationM: number | undefined;
      offRoadPercent: number;
    }>
  ) => void;
  labels: {
    title: string;
    surfaceLabel: string;
    distanceLabel: string;
    elevationLabel: string;
    offRoadLabel: string;
  };
}

export function StepRoute({
  locale,
  surface,
  routeDistanceKm,
  routeElevationM,
  offRoadPercent,
  onUpdate,
  labels,
}: StepRouteProps) {
  const surfaces: Surface[] = [
    "smooth_asphalt",
    "average_asphalt",
    "rough_asphalt",
    "hardpack_gravel",
    "loose_gravel",
    "trail",
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{labels.title}</h2>

      <Field.Root className="space-y-3">
        <Field.Label className="text-sm text-[color:var(--foreground)]">{labels.surfaceLabel}</Field.Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {surfaces.map((option) => (
            <Selectable
              key={option}
              onClick={() => onUpdate({ surface: option })}
              selected={surface === option}
              variant="pill"
              fullWidth={false}
            >
              {surfaceLabel(option, locale)}
            </Selectable>
          ))}
        </div>
      </Field.Root>

      <div className="grid gap-4 sm:grid-cols-3">
        <NumberInput
          label={labels.distanceLabel}
          value={routeDistanceKm ?? null}
          onChange={(value) => onUpdate({ routeDistanceKm: value ?? undefined })}
        />
        <NumberInput
          label={labels.elevationLabel}
          value={routeElevationM ?? null}
          onChange={(value) => onUpdate({ routeElevationM: value ?? undefined })}
        />
        <Slider
          label={labels.offRoadLabel}
          min={0}
          max={100}
          value={offRoadPercent}
          onChange={(value) => onUpdate({ offRoadPercent: value })}
          valueLabel={`${offRoadPercent}%`}
        />
      </div>
    </div>
  );
}
