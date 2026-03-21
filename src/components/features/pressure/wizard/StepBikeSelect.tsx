import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button, Selectable } from "@/components/ui";
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
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{labels.selectBike}</h2>
      </div>

      {bikes && bikes.length > 0 ? (
        <div className="grid gap-3">
          {bikes.map((bike) => (
            <Selectable
              key={bike._id}
              onClick={() => onSelectBike(bike._id)}
              selected={selectedBikeId === bike._id}
              variant="card"
              label={bike.name}
              description={`${disciplineLabel(bike.discipline, locale)}${
                bike.brand || bike.model
                  ? ` • ${[bike.brand, bike.model].filter(Boolean).join(" ")}`
                  : ""
              }`}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--muted-foreground)]">{labels.noBikes}</p>
      )}

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
        <p className="text-sm font-semibold text-[color:var(--foreground)]">{labels.continueWithoutBike}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["road", "gravel", "mtb", "tt"] as const).map((discipline) => (
            <Selectable
              key={discipline}
              onClick={() => {
                onContinueWithoutBike();
                onSelectDiscipline(discipline);
              }}
              selected={selectedBikeId === null && selectedDiscipline === discipline}
              variant="segment"
            >
              {disciplineLabel(discipline, locale)}
            </Selectable>
          ))}
        </div>
      </div>

      <Button onClick={onNext}>
        {labels.next}
      </Button>
    </div>
  );
}
