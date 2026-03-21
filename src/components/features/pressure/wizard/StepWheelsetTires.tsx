import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button, NumberInput, Selectable } from "@/components/ui";
import { Field } from "@/components/ui/Field";
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

  const updateDraft = (updates: Partial<InlineTireInput>) =>
    onInlineInputChange({ ...draft, ...updates });

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{labels.title}</h2>

      {bikeSelected && wheelsets && wheelsets.length > 0 ? (
        <div className="space-y-3">
          <div className="grid gap-3">
            {wheelsets.map((wheelset) => (
              <Selectable
                key={wheelset._id}
                onClick={() => onSelectWheelset(wheelset._id)}
                selected={selectedWheelsetId === wheelset._id}
                variant="card"
                label={wheelset.name}
              />
            ))}
          </div>

          {tireSetups && tireSetups.length > 0 ? (
            <div className="grid gap-3">
              {tireSetups.map((tireSetup) => (
                <Selectable
                  key={tireSetup._id}
                  onClick={() => onSelectTireSetup(tireSetup._id)}
                  selected={selectedTireSetupId === tireSetup._id}
                  variant="card"
                  label={tireSetup.name}
                  description={`${tireSetup.widthFrontMm}/${tireSetup.widthRearMm}mm • ${tubeTypeLabel(
                    tireSetup.tubeType,
                    locale
                  )}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <Field.Root className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
        <Field.Label className="text-sm font-semibold text-[color:var(--foreground)]">
          {labels.manualInput}
        </Field.Label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label={labels.widthFront}
            min={18}
            max={80}
            value={draft.widthFrontMm}
            onChange={(value) => updateDraft({ widthFrontMm: value ?? draft.widthFrontMm })}
          />
          <NumberInput
            label={labels.widthRear}
            min={18}
            max={80}
            value={draft.widthRearMm}
            onChange={(value) => updateDraft({ widthRearMm: value ?? draft.widthRearMm })}
          />
          <NumberInput
            label={labels.rimWidthFront}
            value={draft.internalRimWidthFrontMm ?? null}
            onChange={(value) => updateDraft({ internalRimWidthFrontMm: value ?? undefined })}
          />
          <NumberInput
            label={labels.rimWidthRear}
            value={draft.internalRimWidthRearMm ?? null}
            onChange={(value) => updateDraft({ internalRimWidthRearMm: value ?? undefined })}
          />
          <NumberInput
            label={labels.maxPressure}
            step={0.1}
            value={draft.maxPressureBar ?? null}
            onChange={(value) => updateDraft({ maxPressureBar: value ?? undefined })}
          />
          <Field.Root className="space-y-3">
            <Field.Label className="text-sm text-[color:var(--foreground)]">
              {labels.rimType}
            </Field.Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["hooked", "hookless"] as const).map((option) => (
                <Selectable
                  key={option}
                  onClick={() => updateDraft({ rimType: option })}
                  selected={draft.rimType === option}
                  variant="segment"
                >
                  {option}
                </Selectable>
              ))}
            </div>
          </Field.Root>
        </div>
      </Field.Root>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          {labels.back}
        </Button>
        <Button onClick={onNext}>
          {labels.next}
        </Button>
      </div>
    </div>
  );
}
