"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type Discipline = "road" | "gravel" | "mtb" | "tt";
type Step = "bike" | "saved" | "wheelset" | "done";

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
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
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
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.name.label}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                placeholder={messages.bikeForm.fields.name.placeholder}
              />
            </label>

            <div>
              <p className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.discipline.label}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["road", "gravel", "mtb", "tt"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDiscipline(option)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                      discipline === option
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {messages.bikeForm.fields.discipline.options[option]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.brand.label}</span>
                <input
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                  placeholder={messages.bikeForm.fields.brand.placeholder}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.model.label}</span>
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                  placeholder={messages.bikeForm.fields.model.placeholder}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.bikeWeightKg.label}</span>
                <input
                  type="number"
                  min={3}
                  max={20}
                  step={0.1}
                  value={bikeWeightKg}
                  onChange={(event) => setBikeWeightKg(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                  placeholder={messages.bikeForm.fields.bikeWeightKg.placeholder}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.photoUrl.label}</span>
                <input
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                  placeholder={messages.bikeForm.fields.photoUrl.placeholder}
                />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreateBike}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {messages.bikeForm.actions.save}
              </button>
              <Link
                href={withLocalePrefix("/bikes", locale)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {messages.common.cancel}
              </Link>
            </div>
          </div>
        )}

        {step === "saved" && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">{messages.pressure.wizard.bikeSaved}</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep("wheelset")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {messages.pressure.wizard.addWheelset}
              </button>
              <Link
                href={withLocalePrefix("/bikes", locale)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {messages.pressure.wizard.skipToBikes}
              </Link>
            </div>
          </div>
        )}

        {step === "wheelset" && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.wheelsetName}</span>
                <input
                  value={wheelsetName}
                  onChange={(event) => setWheelsetName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
              <div>
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.rimType}</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["hooked", "hookless"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRimType(option)}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                        rimType === option
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.rimWidthFront}</span>
                <input
                  type="number"
                  value={internalRimWidthFrontMm}
                  onChange={(event) => setInternalRimWidthFrontMm(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.rimWidthRear}</span>
                <input
                  type="number"
                  value={internalRimWidthRearMm}
                  onChange={(event) => setInternalRimWidthRearMm(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.tireSetupName}</span>
                <input
                  value={tireName}
                  onChange={(event) => setTireName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.brand.label}</span>
                <input
                  value={tireBrand}
                  onChange={(event) => setTireBrand(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.bikeForm.fields.model.label}</span>
                <input
                  value={tireModel}
                  onChange={(event) => setTireModel(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
              <div>
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.tubeTypeLabel}</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["inner_tube", "latex_tube", "tubeless"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTubeType(option)}
                      className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                        tubeType === option
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {messages.pressure.form[
                        option === "inner_tube"
                          ? "tubeTypeInnerTube"
                          : option === "latex_tube"
                            ? "tubeTypeLatex"
                            : "tubeTypeTubeless"
                      ]}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.widthFront}</span>
                <input
                  type="number"
                  value={widthFrontMm}
                  onChange={(event) => setWidthFrontMm(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.widthRear}</span>
                <input
                  type="number"
                  value={widthRearMm}
                  onChange={(event) => setWidthRearMm(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.casingType}</span>
                <select
                  value={casingType}
                  onChange={(event) =>
                    setCasingType(
                      event.target.value as "race_light" | "allround" | "reinforced" | ""
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                >
                  <option value="">{messages.pressure.wizard.optional}</option>
                  <option value="race_light">{messages.pressure.wizard.casingRace}</option>
                  <option value="allround">{messages.pressure.wizard.casingAllround}</option>
                  <option value="reinforced">{messages.pressure.wizard.casingReinforced}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{messages.pressure.wizard.maxPressure}</span>
                <input
                  type="number"
                  step={0.1}
                  value={maxPressureBar}
                  onChange={(event) => setMaxPressureBar(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreateWheelset}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {messages.pressure.wizard.saveWheelset}
              </button>
              <button
                type="button"
                onClick={() => setStep("done")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {messages.pressure.wizard.skipToDone}
              </button>
            </div>
          </div>
        )}

        {step === "done" && newBikeId && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">{messages.pressure.wizard.completedTitle}</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={withLocalePrefix(`/pressure-calculator?bikeId=${newBikeId}`, locale)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {messages.pressure.wizard.calculatePressure}
              </Link>
              <Link
                href={withLocalePrefix("/bikes", locale)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {messages.pressure.wizard.goToMyBikes}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
