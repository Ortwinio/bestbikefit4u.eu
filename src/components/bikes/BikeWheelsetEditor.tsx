"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { AutosaveField, AutosaveStatus, Input, useAutosave } from "@/components/ui";
import { autosaveMessages } from "@/i18n/account/autosave";
import { getBikesAutosaveCopy } from "@/i18n/account/bikesAutosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { BikeChoiceField, BikeNumberField } from "./BikeFormControls";

export type EditableWheelset = Pick<
  Doc<"wheelsets">,
  "_id" | "name" | "rimType" | "internalRimWidthFrontMm" | "internalRimWidthRearMm"
> & {
  tireSetups?: Doc<"tireSetups">[];
};
const outside = (value: number | null, min: number, max: number) =>
  value !== null && (!Number.isFinite(value) || value < min || value > max);

export function BikeWheelsetEditor({ wheelset }: { wheelset: EditableWheelset }) {
  const { locale, messages } = useDashboardMessages();
  const copy = getBikesAutosaveCopy(locale);
  const update = useMutation(api.wheelsets.mutations.update);
  const [value, setValue] = useState({
    name: wheelset.name,
    rimType: wheelset.rimType,
    internalRimWidthFrontMm: wheelset.internalRimWidthFrontMm ?? null,
    internalRimWidthRearMm: wheelset.internalRimWidthRearMm ?? null,
  });
  const autosave = useAutosave({
    value,
    debounceMs: 800,
    validate: (next) =>
      !next.name.trim()
        ? copy.required
        : next.name.length > 100
          ? copy.length
          : (next.internalRimWidthFrontMm !== (wheelset.internalRimWidthFrontMm ?? null) &&
                outside(next.internalRimWidthFrontMm, 10, 60)) ||
              (next.internalRimWidthRearMm !== (wheelset.internalRimWidthRearMm ?? null) &&
                outside(next.internalRimWidthRearMm, 10, 60))
            ? copy.invalid
            : null,
    onSave: async (next) => {
      await update({ wheelsetId: wheelset._id, ...next });
    },
  });
  return (
    <div className="mt-4 space-y-5">
      <AutosaveField flush={autosave.flush} commitOn="release" className="grid gap-4 sm:grid-cols-2">
        <Input
          label={messages.pressure.wizard.wheelsetName}
          value={value.name}
          onChange={(event) => setValue({ ...value, name: event.target.value })}
          maxLength={100}
        />
        <BikeChoiceField
          label={messages.bikes.wheelsetManager.rimType}
          value={value.rimType}
          onChange={(rimType) => setValue({ ...value, rimType: rimType as "hooked" | "hookless" })}
          options={[
            { value: "hooked", label: copy.rimHooked },
            { value: "hookless", label: copy.rimHookless },
          ]}
        />
        {(["internalRimWidthFrontMm", "internalRimWidthRearMm"] as const).map((key, index) => (
          <BikeNumberField
            key={key}
            label={
              index === 0
                ? messages.bikes.wheelsetManager.frontWidth
                : messages.bikes.wheelsetManager.rearWidth
            }
            value={value[key]}
            min={10}
            max={60}
            step={0.5}
            unit="mm"
            onChange={(next) => setValue({ ...value, [key]: next })}
          />
        ))}
        <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
      </AutosaveField>
      <ActiveTires key={wheelset._id} tires={wheelset.tireSetups ?? []} />
      {(wheelset.tireSetups ?? []).map((tire) => (
        <TireEditor key={tire._id} tire={tire} />
      ))}
    </div>
  );
}

function TireEditor({ tire }: { tire: Doc<"tireSetups"> }) {
  const { locale, messages } = useDashboardMessages();
  const copy = getBikesAutosaveCopy(locale);
  const update = useMutation(api.tireSetups.mutations.update);
  const [value, setValue] = useState({
    name: tire.name,
    brand: tire.brand ?? "",
    model: tire.model ?? "",
    widthFrontMm: tire.widthFrontMm,
    widthRearMm: tire.widthRearMm,
    tubeType: tire.tubeType,
    casingType: tire.casingType ?? null,
    maxPressureBar: tire.maxPressureBar ?? null,
  });
  const autosave = useAutosave({
    value,
    debounceMs: 800,
    validate: (next) =>
      !next.name.trim()
        ? copy.required
        : [next.name, next.brand, next.model].some((text) => text.length > 100)
          ? copy.length
          : (next.widthFrontMm !== tire.widthFrontMm && outside(next.widthFrontMm, 18, 80)) ||
              (next.widthRearMm !== tire.widthRearMm && outside(next.widthRearMm, 18, 80)) ||
              (next.maxPressureBar !== (tire.maxPressureBar ?? null) && outside(next.maxPressureBar, 3.5, 10))
            ? copy.invalid
            : null,
    onSave: async (next) => {
      await update({ tireSetupId: tire._id, ...next });
    },
  });
  const t = messages.pressure.wizard;
  return (
    <AutosaveField flush={autosave.flush} commitOn="release" className="grid gap-4 sm:grid-cols-2">
      <h3 className="font-semibold sm:col-span-2">{copy.tires}</h3>
      <Input
        label={copy.tireName}
        value={value.name}
        maxLength={100}
        onChange={(event) => setValue({ ...value, name: event.target.value })}
      />
      <Input
        label={copy.brand}
        value={value.brand}
        maxLength={100}
        onChange={(event) => setValue({ ...value, brand: event.target.value })}
      />
      <Input
        label={copy.model}
        value={value.model}
        maxLength={100}
        onChange={(event) => setValue({ ...value, model: event.target.value })}
      />
      {(["widthFrontMm", "widthRearMm"] as const).map((key, index) => (
        <BikeNumberField
          key={key}
          label={index === 0 ? t.widthFront : t.widthRear}
          value={value[key]}
          allowClear={false}
          min={18}
          max={80}
          unit="mm"
          onChange={(next) => {
            if (next !== null) setValue({ ...value, [key]: next });
          }}
        />
      ))}
      <BikeNumberField
        label={t.maxPressure}
        value={value.maxPressureBar}
        min={3.5}
        max={10}
        step={0.1}
        unit="bar"
        onChange={(next) => setValue({ ...value, maxPressureBar: next })}
      />
      <BikeChoiceField
        label={copy.tubeType}
        value={value.tubeType}
        onChange={(next) => setValue({ ...value, tubeType: next as typeof value.tubeType })}
        options={[
          { value: "inner_tube", label: copy.innerTube },
          { value: "latex_tube", label: copy.latexTube },
          { value: "tubeless", label: copy.tubeless },
        ]}
      />
      <BikeChoiceField
        label={t.casingType}
        value={value.casingType ?? ""}
        optional
        onChange={(next) => setValue({ ...value, casingType: (next || null) as typeof value.casingType })}
        options={[
          { value: "race_light", label: copy.raceLight },
          { value: "allround", label: copy.allround },
          { value: "reinforced", label: copy.reinforced },
        ]}
      />
      <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
    </AutosaveField>
  );
}

function ActiveTires({ tires }: { tires: Doc<"tireSetups">[] }) {
  const { locale } = useDashboardMessages();
  const copy = getBikesAutosaveCopy(locale);
  const update = useMutation(api.tireSetups.mutations.update);
  const [selected, setSelected] = useState<string>(
    tires.find((tire) => tire.isActive)?._id ?? tires[0]?._id ?? "",
  );
  const autosave = useAutosave({
    value: selected,
    debounceMs: 500,
    onSave: async (next) => {
      const tire = tires.find((item) => item._id === next);
      if (tire) await update({ tireSetupId: tire._id, isActive: true });
    },
  });
  if (tires.length < 2) return null;
  return (
    <AutosaveField flush={autosave.flush} commitOn="release">
      <BikeChoiceField
        label={copy.activeTires}
        value={selected}
        onChange={setSelected}
        options={tires.map((tire) => ({ value: tire._id, label: tire.name }))}
      />
      <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
    </AutosaveField>
  );
}
