import { NumberInput, Selectable, Slider } from "@/components/ui";
import { Field } from "@/components/ui/Field";

interface StepWeightGoalProps {
  bodyWeightKg: number;
  bikeWeightKg: number | undefined;
  extraLuggageKg: number;
  isWet: boolean;
  ridingGoal: "speed" | "balance" | "comfort";
  currentFrontBar: number | undefined;
  currentRearBar: number | undefined;
  onUpdate: (
    updates: Partial<{
      bodyWeightKg: number;
      bikeWeightKg: number | undefined;
      extraLuggageKg: number;
      isWet: boolean;
      ridingGoal: "speed" | "balance" | "comfort";
      currentFrontBar: number | undefined;
      currentRearBar: number | undefined;
    }>
  ) => void;
  labels: {
    title: string;
    bodyWeightLabel: string;
    bikeWeightLabel: string;
    extraLuggageLabel: string;
    currentFrontLabel: string;
    currentRearLabel: string;
    wetLabel: string;
    wet: string;
    dry: string;
    goalTitle: string;
    goalSpeed: string;
    goalBalance: string;
    goalComfort: string;
  };
}

export function StepWeightGoal({
  bodyWeightKg,
  bikeWeightKg,
  extraLuggageKg,
  isWet,
  ridingGoal,
  currentFrontBar,
  currentRearBar,
  onUpdate,
  labels,
}: StepWeightGoalProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{labels.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label={labels.bodyWeightLabel}
          min={35}
          max={160}
          step={1}
          value={bodyWeightKg}
          onChange={(value) => onUpdate({ bodyWeightKg: value })}
          valueLabel={`${bodyWeightKg} kg`}
        />
        <NumberInput
          label={labels.bikeWeightLabel}
          value={bikeWeightKg ?? null}
          onChange={(value) => onUpdate({ bikeWeightKg: value ?? undefined })}
          step={0.1}
        />
        <NumberInput
          label={labels.extraLuggageLabel}
          min={0}
          max={30}
          value={extraLuggageKg}
          onChange={(value) => onUpdate({ extraLuggageKg: value ?? 0 })}
        />
        <Field.Root className="space-y-3">
          <Field.Label className="text-sm text-[color:var(--foreground)]">{labels.wetLabel}</Field.Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Selectable onClick={() => onUpdate({ isWet: false })} selected={!isWet} variant="segment">
              {labels.dry}
            </Selectable>
            <Selectable onClick={() => onUpdate({ isWet: true })} selected={isWet} variant="segment">
              {labels.wet}
            </Selectable>
          </div>
        </Field.Root>
        <NumberInput
          label={labels.currentFrontLabel}
          step={0.1}
          value={currentFrontBar ?? null}
          onChange={(value) => onUpdate({ currentFrontBar: value ?? undefined })}
        />
        <NumberInput
          label={labels.currentRearLabel}
          step={0.1}
          value={currentRearBar ?? null}
          onChange={(value) => onUpdate({ currentRearBar: value ?? undefined })}
        />
      </div>

      <Field.Root className="space-y-3">
        <Field.Label className="text-sm text-[color:var(--foreground)]">{labels.goalTitle}</Field.Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ["speed", labels.goalSpeed],
              ["balance", labels.goalBalance],
              ["comfort", labels.goalComfort],
            ] as const
          ).map(([goal, goalLabel]) => (
            <Selectable
              key={goal}
              onClick={() => onUpdate({ ridingGoal: goal })}
              selected={ridingGoal === goal}
              variant="segment"
            >
              {goalLabel}
            </Selectable>
          ))}
        </div>
      </Field.Root>
    </div>
  );
}
