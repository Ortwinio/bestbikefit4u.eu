import type { Id } from "../../../../../convex/_generated/dataModel";
import type { InlineTireInput } from "../shared";
import { tubeTypeLabel } from "../shared";

interface WheelsetSummary {
  _id: Id<"wheelsets">;
  name: string;
}

interface TireSetupSummary {
  _id: Id<"tireSetups">;
  name: string;
  widthFrontMm: number;
  widthRearMm: number;
  tubeType: "inner_tube" | "latex_tube" | "tubeless";
}

interface StepWheelsetTiresProps {
  locale: "en" | "nl";
  bikeSelected: boolean;
  wheelsets: WheelsetSummary[] | undefined;
  tireSetups: TireSetupSummary[] | undefined;
  selectedWheelsetId: Id<"wheelsets"> | null;
  selectedTireSetupId: Id<"tireSetups"> | null;
  inlineTireInput: InlineTireInput | null;
  onSelectWheelset: (id: Id<"wheelsets">) => void;
  onSelectTireSetup: (id: Id<"tireSetups">) => void;
  onInlineInputChange: (input: InlineTireInput) => void;
  onBack: () => void;
  onNext: () => void;
  labels: {
    title: string;
    manualInput: string;
    next: string;
    back: string;
    widthFront: string;
    widthRear: string;
    maxPressure: string;
    rimType: string;
    rimWidthFront: string;
    rimWidthRear: string;
  };
}

export function StepWheelsetTires({
  locale,
  bikeSelected,
  wheelsets,
  tireSetups,
  selectedWheelsetId,
  selectedTireSetupId,
  inlineTireInput,
  onSelectWheelset,
  onSelectTireSetup,
  onInlineInputChange,
  onBack,
  onNext,
  labels,
}: StepWheelsetTiresProps) {
  const draft =
    inlineTireInput ?? {
      widthFrontMm: 28,
      widthRearMm: 28,
      tubeType: "tubeless" as const,
      rimType: "hooked" as const,
    };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">{labels.title}</h2>

      {bikeSelected && wheelsets && wheelsets.length > 0 ? (
        <div className="space-y-3">
          <div className="grid gap-3">
            {wheelsets.map((wheelset) => (
              <button
                key={wheelset._id}
                type="button"
                onClick={() => onSelectWheelset(wheelset._id)}
                className={`rounded-2xl border p-4 text-left ${
                  selectedWheelsetId === wheelset._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {wheelset.name}
              </button>
            ))}
          </div>

          {tireSetups && tireSetups.length > 0 ? (
            <div className="grid gap-3">
              {tireSetups.map((tireSetup) => (
                <button
                  key={tireSetup._id}
                  type="button"
                  onClick={() => onSelectTireSetup(tireSetup._id)}
                  className={`rounded-2xl border p-4 text-left ${
                    selectedTireSetupId === tireSetup._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{tireSetup.name}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {tireSetup.widthFrontMm}/{tireSetup.widthRearMm}mm •{" "}
                    {tubeTypeLabel(tireSetup.tubeType, locale)}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">{labels.manualInput}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-gray-700">{labels.widthFront}</span>
            <input
              type="number"
              min={18}
              max={80}
              value={draft.widthFrontMm}
              onChange={(event) =>
                onInlineInputChange({
                  ...draft,
                  widthFrontMm: Number(event.target.value),
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">{labels.widthRear}</span>
            <input
              type="number"
              min={18}
              max={80}
              value={draft.widthRearMm}
              onChange={(event) =>
                onInlineInputChange({
                  ...draft,
                  widthRearMm: Number(event.target.value),
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">{labels.rimWidthFront}</span>
            <input
              type="number"
              value={draft.internalRimWidthFrontMm ?? ""}
              onChange={(event) =>
                onInlineInputChange({
                  ...draft,
                  internalRimWidthFrontMm: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">{labels.rimWidthRear}</span>
            <input
              type="number"
              value={draft.internalRimWidthRearMm ?? ""}
              onChange={(event) =>
                onInlineInputChange({
                  ...draft,
                  internalRimWidthRearMm: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">{labels.maxPressure}</span>
            <input
              type="number"
              step={0.1}
              value={draft.maxPressureBar ?? ""}
              onChange={(event) =>
                onInlineInputChange({
                  ...draft,
                  maxPressureBar: event.target.value ? Number(event.target.value) : undefined,
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </label>
          <div>
            <span className="text-sm text-gray-700">{labels.rimType}</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["hooked", "hookless"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onInlineInputChange({ ...draft, rimType: option })}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    draft.rimType === option
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
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
