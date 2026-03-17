import type { Surface } from "@/lib/pressure-engine";
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
  onBack: () => void;
  onNext: () => void;
  labels: {
    title: string;
    surfaceLabel: string;
    distanceLabel: string;
    elevationLabel: string;
    offRoadLabel: string;
    next: string;
    back: string;
  };
}

export function StepRoute({
  locale,
  surface,
  routeDistanceKm,
  routeElevationM,
  offRoadPercent,
  onUpdate,
  onBack,
  onNext,
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
      <h2 className="text-xl font-semibold text-gray-900">{labels.title}</h2>

      <div>
        <p className="text-sm text-gray-700">{labels.surfaceLabel}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {surfaces.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onUpdate({ surface: option })}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                surface === option
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {surfaceLabel(option, locale)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm text-gray-700">{labels.distanceLabel}</span>
          <input
            type="number"
            value={routeDistanceKm ?? ""}
            onChange={(event) =>
              onUpdate({
                routeDistanceKm: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">{labels.elevationLabel}</span>
          <input
            type="number"
            value={routeElevationM ?? ""}
            onChange={(event) =>
              onUpdate({
                routeElevationM: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">{labels.offRoadLabel}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={offRoadPercent}
            onChange={(event) => onUpdate({ offRoadPercent: Number(event.target.value) })}
            className="mt-2 w-full"
          />
          <span className="text-sm text-gray-500">{offRoadPercent}%</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {labels.back}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {labels.next}
        </button>
      </div>
    </div>
  );
}
