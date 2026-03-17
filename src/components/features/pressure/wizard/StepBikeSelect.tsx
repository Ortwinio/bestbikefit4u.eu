import type { Id } from "../../../../../convex/_generated/dataModel";
import { disciplineLabel } from "../shared";

interface BikeSummary {
  _id: Id<"bikes">;
  name: string;
  discipline?: "road" | "gravel" | "mtb" | "tt";
  brand?: string;
  model?: string;
}

interface StepBikeSelectProps {
  locale: "en" | "nl";
  bikes: BikeSummary[] | undefined;
  selectedBikeId: Id<"bikes"> | null;
  selectedDiscipline: "road" | "gravel" | "mtb" | "tt";
  onSelectBike: (id: Id<"bikes">) => void;
  onSelectDiscipline: (discipline: "road" | "gravel" | "mtb" | "tt") => void;
  onContinueWithoutBike: () => void;
  onNext: () => void;
  labels: {
    selectBike: string;
    noBikes: string;
    addBikeLink: string;
    continueWithoutBike: string;
    next: string;
  };
}

export function StepBikeSelect({
  locale,
  bikes,
  selectedBikeId,
  selectedDiscipline,
  onSelectBike,
  onSelectDiscipline,
  onContinueWithoutBike,
  onNext,
  labels,
}: StepBikeSelectProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{labels.selectBike}</h2>
      </div>

      {bikes && bikes.length > 0 ? (
        <div className="grid gap-3">
          {bikes.map((bike) => (
            <button
              key={bike._id}
              type="button"
              onClick={() => onSelectBike(bike._id)}
              className={`rounded-2xl border p-4 text-left ${
                selectedBikeId === bike._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-gray-900">{bike.name}</p>
              <p className="mt-1 text-sm text-gray-600">
                {disciplineLabel(bike.discipline, locale)}
                {bike.brand || bike.model ? ` • ${[bike.brand, bike.model].filter(Boolean).join(" ")}` : ""}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">{labels.noBikes}</p>
      )}

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">{labels.continueWithoutBike}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["road", "gravel", "mtb", "tt"] as const).map((discipline) => (
            <button
              key={discipline}
              type="button"
              onClick={() => {
                onContinueWithoutBike();
                onSelectDiscipline(discipline);
              }}
              className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                selectedBikeId === null && selectedDiscipline === discipline
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {disciplineLabel(discipline, locale)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {labels.next}
      </button>
    </div>
  );
}
