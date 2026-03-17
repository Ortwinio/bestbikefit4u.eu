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
  onBack: () => void;
  onNext: () => void;
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
    next: string;
    back: string;
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
  onBack,
  onNext,
  labels,
}: StepWeightGoalProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">{labels.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-gray-700">{labels.bodyWeightLabel}</span>
          <input
            type="range"
            min={35}
            max={160}
            step={1}
            value={bodyWeightKg}
            onChange={(event) => onUpdate({ bodyWeightKg: Number(event.target.value) })}
            className="mt-2 w-full"
          />
          <span className="text-sm text-gray-500">{bodyWeightKg} kg</span>
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">{labels.bikeWeightLabel}</span>
          <input
            type="number"
            value={bikeWeightKg ?? ""}
            onChange={(event) =>
              onUpdate({
                bikeWeightKg: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">{labels.extraLuggageLabel}</span>
          <input
            type="number"
            min={0}
            max={30}
            value={extraLuggageKg}
            onChange={(event) => onUpdate({ extraLuggageKg: Number(event.target.value) })}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>
        <div>
          <span className="text-sm text-gray-700">{labels.wetLabel}</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ isWet: false })}
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                !isWet ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {labels.dry}
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ isWet: true })}
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                isWet ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {labels.wet}
            </button>
          </div>
        </div>
        <label className="block">
          <span className="text-sm text-gray-700">{labels.currentFrontLabel}</span>
          <input
            type="number"
            step={0.1}
            value={currentFrontBar ?? ""}
            onChange={(event) =>
              onUpdate({
                currentFrontBar: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">{labels.currentRearLabel}</span>
          <input
            type="number"
            step={0.1}
            value={currentRearBar ?? ""}
            onChange={(event) =>
              onUpdate({
                currentRearBar: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <div>
        <p className="text-sm text-gray-700">{labels.goalTitle}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ["speed", labels.goalSpeed],
              ["balance", labels.goalBalance],
              ["comfort", labels.goalComfort],
            ] as const
          ).map(([goal, goalLabel]) => (
            <button
              key={goal}
              type="button"
              onClick={() => onUpdate({ ridingGoal: goal })}
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                ridingGoal === goal
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {goalLabel}
            </button>
          ))}
        </div>
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
