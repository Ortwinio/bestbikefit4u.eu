"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button, Input, NumberInput, Select, Selectable, Textarea } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type Discipline = "road" | "gravel" | "mtb" | "tt";
type Step = "bike" | "saved" | "wheelset" | "done";
type RidingStyle =
  | "recreational"
  | "fitness"
  | "sportive"
  | "racing"
  | "commuting"
  | "touring";
type PrimaryGoal = "comfort" | "balanced" | "performance" | "aerodynamics";

function deriveBikeType(discipline: Discipline) {
  switch (discipline) {
    case "road":
      return "road" as const;
    case "gravel":
      return "gravel" as const;
    case "mtb":
      return "mountain" as const;
    case "tt":
      return "tt_triathlon" as const;
  }
}

export function CreateBikeForm() {
  const { locale, messages } = useDashboardMessages();
  const createBike = useMutation(api.bikes.mutations.create);
  const createWheelset = useMutation(api.wheelsets.mutations.create);
  const createTireSetup = useMutation(api.tireSetups.mutations.create);

  const [step, setStep] = useState<Step>("bike");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBikeId, setNewBikeId] = useState<Id<"bikes"> | null>(null);

  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState<Discipline>("road");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [ridingStyle, setRidingStyle] = useState<RidingStyle>("fitness");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>("balanced");
  const [notes, setNotes] = useState("");
  const [bikeWeightKg, setBikeWeightKg] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [wheelsetName, setWheelsetName] = useState("");
  const [rimType, setRimType] = useState<"hooked" | "hookless">("hooked");
  const [internalRimWidthFrontMm, setInternalRimWidthFrontMm] = useState("");
  const [internalRimWidthRearMm, setInternalRimWidthRearMm] = useState("");
  const [tireName, setTireName] = useState("");
  const [tireBrand, setTireBrand] = useState("");
  const [tireModel, setTireModel] = useState("");
  const [widthFrontMm, setWidthFrontMm] = useState("28");
  const [widthRearMm, setWidthRearMm] = useState("28");
  const [tubeType, setTubeType] = useState<"inner_tube" | "latex_tube" | "tubeless">("tubeless");
  const [casingType, setCasingType] = useState<"race_light" | "allround" | "reinforced" | "">("");
  const [maxPressureBar, setMaxPressureBar] = useState("");

  const validationError = useMemo(() => {
    if (step === "bike") {
      if (!name.trim()) {
        return messages.bikeForm.errors.nameRequired;
      }
      if (bikeWeightKg && (Number(bikeWeightKg) < 3 || Number(bikeWeightKg) > 20)) {
        return messages.pressure.wizard.bikeWeightRange;
      }
    }

    if (step === "wheelset") {
      if (!wheelsetName.trim()) {
        return messages.pressure.wizard.wheelsetNameRequired;
      }
      if (!tireName.trim()) {
        return messages.pressure.wizard.tireNameRequired;
      }
      if (Number(widthFrontMm) < 18 || Number(widthFrontMm) > 80) {
        return messages.pressure.wizard.widthRange;
      }
      if (Number(widthRearMm) < 18 || Number(widthRearMm) > 80) {
        return messages.pressure.wizard.widthRange;
      }
      if (maxPressureBar && (Number(maxPressureBar) < 3.5 || Number(maxPressureBar) > 10)) {
        return messages.pressure.wizard.maxPressureRange;
      }
    }

    return null;
  }, [bikeWeightKg, maxPressureBar, messages.bikeForm.errors.nameRequired, messages.pressure.wizard.bikeWeightRange, messages.pressure.wizard.maxPressureRange, messages.pressure.wizard.tireNameRequired, messages.pressure.wizard.widthRange, messages.pressure.wizard.wheelsetNameRequired, name, step, tireName, wheelsetName, widthFrontMm, widthRearMm]);

  const handleCreateBike = async () => {
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const bikeId = await createBike({
        name: name.trim(),
        bikeType: deriveBikeType(discipline),
        discipline,
        ridingStyle,
        primaryGoal,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        notes: notes.trim() || undefined,
        bikeWeightKg: bikeWeightKg ? Number(bikeWeightKg) : undefined,
        photoUrl: photoUrl.trim() || undefined,
      });
      setNewBikeId(bikeId);
      setStep("saved");
    } catch (createError) {
      console.error(createError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateWheelset = async () => {
    if (!newBikeId) {
      return;
    }
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const wheelsetId = await createWheelset({
        bikeId: newBikeId,
        name: wheelsetName.trim(),
        rimType,
        internalRimWidthFrontMm: internalRimWidthFrontMm
          ? Number(internalRimWidthFrontMm)
          : undefined,
        internalRimWidthRearMm: internalRimWidthRearMm
          ? Number(internalRimWidthRearMm)
          : undefined,
        isActive: true,
      });

      await createTireSetup({
        wheelsetId,
        name: tireName.trim(),
        brand: tireBrand.trim() || undefined,
        model: tireModel.trim() || undefined,
        widthFrontMm: Number(widthFrontMm),
        widthRearMm: Number(widthRearMm),
        tubeType,
        casingType: casingType || undefined,
        maxPressureBar: maxPressureBar ? Number(maxPressureBar) : undefined,
        isActive: true,
      });

      setStep("done");
    } catch (createError) {
      console.error(createError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{messages.bikeForm.new.title}</h1>
        <p className="mt-2 text-gray-600">{messages.bikeForm.new.description}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === "bike" && (
          <div className="space-y-5">
            <Input
              label={messages.bikeForm.fields.name.label}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={messages.bikeForm.fields.name.placeholder}
            />

            <div>
              <p className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.discipline.label}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["road", "gravel", "mtb", "tt"] as const).map((option) => (
                  <Selectable
                    key={option}
                    onClick={() => setDiscipline(option)}
                    selected={discipline === option}
                    variant="segment"
                  >
                    {messages.bikeForm.fields.discipline.options[option]}
                  </Selectable>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={messages.bikeForm.fields.brand.label}
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder={messages.bikeForm.fields.brand.placeholder}
              />
              <Input
                label={messages.bikeForm.fields.model.label}
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder={messages.bikeForm.fields.model.placeholder}
              />
              <NumberInput
                label={messages.bikeForm.fields.bikeWeightKg.label}
                min={3}
                max={20}
                step={0.1}
                value={bikeWeightKg ? Number(bikeWeightKg) : null}
                onChange={(value) => setBikeWeightKg(value === null ? "" : String(value))}
                placeholder={messages.bikeForm.fields.bikeWeightKg.placeholder}
                unit="kg"
              />
              <Input
                label={messages.bikeForm.fields.photoUrl.label}
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                placeholder={messages.bikeForm.fields.photoUrl.placeholder}
              />
              <Select
                label={messages.fit.sections.ridingStyle}
                value={ridingStyle}
                onChange={(event) => setRidingStyle(event.target.value as RidingStyle)}
                options={[
                  {
                    value: "recreational",
                    label: messages.fit.ridingStyles.recreational.label,
                  },
                  {
                    value: "fitness",
                    label: messages.fit.ridingStyles.fitness.label,
                  },
                  {
                    value: "sportive",
                    label: messages.fit.ridingStyles.sportive.label,
                  },
                  {
                    value: "racing",
                    label: messages.fit.ridingStyles.racing.label,
                  },
                  {
                    value: "commuting",
                    label: messages.fit.ridingStyles.commuting.label,
                  },
                  {
                    value: "touring",
                    label: messages.fit.ridingStyles.touring.label,
                  },
                ]}
              />
              <Select
                label={messages.fit.sections.primaryGoal}
                value={primaryGoal}
                onChange={(event) => setPrimaryGoal(event.target.value as PrimaryGoal)}
                options={[
                  {
                    value: "comfort",
                    label: messages.fit.goals.comfort.label,
                  },
                  {
                    value: "balanced",
                    label: messages.fit.goals.balanced.label,
                  },
                  {
                    value: "performance",
                    label: messages.fit.goals.performance.label,
                  },
                  {
                    value: "aerodynamics",
                    label: messages.fit.goals.aerodynamics.label,
                  },
                ]}
              />
            </div>

            <Textarea
              label={messages.bikeForm.fields.notes.label}
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, 500))}
              placeholder={messages.bikeForm.fields.notes.placeholder}
              helperText={`${messages.bikeForm.fields.notes.helper} ${notes.length}/500`}
            />

            {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateBike} disabled={isSaving} isLoading={isSaving}>
                {messages.bikeForm.actions.save}
              </Button>
              <Link
                href={withLocalePrefix("/bikes", locale)}
              >
                <Button variant="outline">{messages.common.cancel}</Button>
              </Link>
            </div>
          </div>
        )}

        {step === "saved" && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">{messages.pressure.wizard.bikeSaved}</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setStep("wheelset")}>
                {messages.pressure.wizard.addWheelset}
              </Button>
              <Link
                href={withLocalePrefix("/bikes", locale)}
              >
                <Button variant="outline">{messages.pressure.wizard.skipToBikes}</Button>
              </Link>
            </div>
          </div>
        )}

        {step === "wheelset" && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={messages.pressure.wizard.wheelsetName}
                value={wheelsetName}
                onChange={(event) => setWheelsetName(event.target.value)}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.rimType}</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["hooked", "hookless"] as const).map((option) => (
                    <Selectable
                      key={option}
                      onClick={() => setRimType(option)}
                      selected={rimType === option}
                      variant="segment"
                    >
                      {option}
                    </Selectable>
                  ))}
                </div>
              </div>
              <NumberInput
                label={messages.pressure.wizard.rimWidthFront}
                value={internalRimWidthFrontMm ? Number(internalRimWidthFrontMm) : null}
                onChange={(value) => setInternalRimWidthFrontMm(value === null ? "" : String(value))}
              />
              <NumberInput
                label={messages.pressure.wizard.rimWidthRear}
                value={internalRimWidthRearMm ? Number(internalRimWidthRearMm) : null}
                onChange={(value) => setInternalRimWidthRearMm(value === null ? "" : String(value))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={messages.pressure.wizard.tireSetupName}
                value={tireName}
                onChange={(event) => setTireName(event.target.value)}
              />
              <Input
                label={messages.bikeForm.fields.brand.label}
                value={tireBrand}
                onChange={(event) => setTireBrand(event.target.value)}
              />
              <Input
                label={messages.bikeForm.fields.model.label}
                value={tireModel}
                onChange={(event) => setTireModel(event.target.value)}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.tubeTypeLabel}</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["inner_tube", "latex_tube", "tubeless"] as const).map((option) => (
                    <Selectable
                      key={option}
                      onClick={() => setTubeType(option)}
                      selected={tubeType === option}
                      variant="segment"
                    >
                      {messages.pressure.form[
                        option === "inner_tube"
                          ? "tubeTypeInnerTube"
                          : option === "latex_tube"
                            ? "tubeTypeLatex"
                            : "tubeTypeTubeless"
                      ]}
                    </Selectable>
                  ))}
                </div>
              </div>
              <NumberInput
                label={messages.pressure.wizard.widthFront}
                value={widthFrontMm ? Number(widthFrontMm) : null}
                onChange={(value) => setWidthFrontMm(value === null ? "" : String(value))}
              />
              <NumberInput
                label={messages.pressure.wizard.widthRear}
                value={widthRearMm ? Number(widthRearMm) : null}
                onChange={(value) => setWidthRearMm(value === null ? "" : String(value))}
              />
              <Select
                label={messages.pressure.wizard.casingType}
                value={casingType}
                onChange={(event) =>
                  setCasingType(
                    event.target.value as "race_light" | "allround" | "reinforced" | ""
                  )
                }
                options={[
                  { value: "", label: messages.pressure.wizard.optional },
                  { value: "race_light", label: messages.pressure.wizard.casingRace },
                  { value: "allround", label: messages.pressure.wizard.casingAllround },
                  { value: "reinforced", label: messages.pressure.wizard.casingReinforced },
                ]}
              />
              <NumberInput
                label={messages.pressure.wizard.maxPressure}
                step={0.1}
                value={maxPressureBar ? Number(maxPressureBar) : null}
                onChange={(value) => setMaxPressureBar(value === null ? "" : String(value))}
              />
            </div>

            {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateWheelset} disabled={isSaving} isLoading={isSaving}>
                {messages.pressure.wizard.saveWheelset}
              </Button>
              <Button variant="outline" onClick={() => setStep("done")}>
                {messages.pressure.wizard.skipToDone}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && newBikeId && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">{messages.pressure.wizard.completedTitle}</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={withLocalePrefix(`/pressure-calculator?bikeId=${newBikeId}`, locale)}
              >
                <Button>{messages.pressure.wizard.calculatePressure}</Button>
              </Link>
              <Link
                href={withLocalePrefix("/bikes", locale)}
              >
                <Button variant="outline">{messages.pressure.wizard.goToMyBikes}</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
