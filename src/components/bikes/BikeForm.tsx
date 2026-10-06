"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AutosaveField,
  AutosaveStatus,
  useAutosave,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Selectable,
  Textarea,
} from "@/components/ui";
import { BikeNumberField, BikeChoiceField, BikeCassetteField, BikeFrameSizeField } from "./BikeFormControls";
import { getBikesCopy } from "@/i18n/account/bikes";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { withLocalePrefix } from "@/i18n/navigation";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui";
import { BikeGeometryLibraryFields } from "./BikeGeometryLibraryFields";
import { BikePublicFitControls, type PublicFitGeometryQuality } from "./BikePublicFitControls";
import {
  createBikeGeometryFallbackState,
  normalizeBikeGeometryIdentityPayload,
  type BikeGeometryFallbackState,
} from "./bikeFormGeometry";
import { Field } from "@/components/ui/Field";
import { getBikeTypeLabel, getBikeTypeOptions, type BikeType } from "@/lib/bikes";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeLanguageMessages } from "@/i18n/account/bikesLanguage";

import { autosaveMessages } from "@/i18n/account/autosave";
import { getBikesAutosaveCopy } from "@/i18n/account/bikesAutosave";
import { bikeProfileFormMessages } from "@/i18n/account/bikeProfileForm";
import { bikeEditError } from "../../../shared/bikeEditValidation";

type RidingStyle = "recreational" | "fitness" | "sportive" | "racing" | "commuting" | "touring";

type PrimaryGoal = "comfort" | "balanced" | "performance" | "aerodynamics";

export type BikeGearingPayload = {
  drivetrainType?: "1x" | "2x";
  chainrings?: number[];
  cassetteTeeth?: number[];
  wheelCircumferenceMm?: number;
  crankLengthMm?: number;
  groupsetName?: string;
  derailleurMaxCog?: number;
};

export type BikeFormPayload = {
  name: string;
  bikeWeightKg?: number;
  saddleModel?: string;
  saddleWidthMm?: number;
  pedalModel?: string;
  cleatSystem?: string;
  maxSeatpostMm?: number;
  maxSpacerStackMm?: number;
  bikeType: BikeType;
  brand?: string;
  model?: string;
  geometryRecordId?: string | null;
  ridingStyle?: RidingStyle;
  primaryGoal?: PrimaryGoal;
  notes?: string;
  currentGeometry?: {
    stackMm?: number;
    reachMm?: number;
    seatTubeAngle?: number;
    headTubeAngle?: number;
    frameSize?: string;
  };
  currentSetup?: {
    saddleHeightMm?: number;
    spacersMm?: number;
    handlebarReachMm?: number;
    handlebarDropMm?: number;
    saddleSetbackMm?: number;
    stemLengthMm?: number;
    stemAngle?: number;
    handlebarWidthMm?: number;
    crankLengthMm?: number;
  };
  gearing?: BikeGearingPayload;
};

export interface BikeFormInitialData {
  name: string;
  bikeWeightKg?: number;
  saddleModel?: string;
  saddleWidthMm?: number;
  pedalModel?: string;
  cleatSystem?: string;
  maxSeatpostMm?: number;
  maxSpacerStackMm?: number;
  bikeType: BikeType;
  brand?: string;
  model?: string;
  geometryRecordId?: string | null;
  ridingStyle?: RidingStyle;
  primaryGoal?: PrimaryGoal;
  notes?: string;
  currentGeometry?: BikeFormPayload["currentGeometry"];
  currentSetup?: BikeFormPayload["currentSetup"];
  gearing?: BikeGearingPayload;
}

export type BikeAutosavePayload = Partial<BikeFormPayload> & {
  clearFields?: string[];
};
interface BikeFormProps {
  refinementsLocked?: boolean;
  bikeId?: string;
  title: string;
  description: string;
  submitLabel: string;
  initialData?: BikeFormInitialData;
  showBikeTypeSelect?: boolean;
  cancelHref?: string;
  bikePassportId?: string | null;
  publicFitState?: {
    publicFitCode: string | null;
    publicFitEnabled: boolean;
    geometryQuality: PublicFitGeometryQuality;
  };
  onEnablePublicFitPreview?: () => Promise<void>;
  onDisablePublicFitPreview?: () => Promise<void>;
  onAutosave?: (payload: BikeAutosavePayload) => Promise<void>;
  embedded?: boolean;
  onSubmit?: (payload: BikeFormPayload) => Promise<void>;
}

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
  };
}

function numberFromInput(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function numberToInputValue(value: string) {
  return numberFromInput(value) ?? null;
}

function parseCommaSeparatedNumbers(value: string) {
  return value
    .split(/[,\s]+/g)
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part) && part > 0);
}

export function BikeForm({
  refinementsLocked = false,
  bikeId,
  title,
  description,
  submitLabel,
  initialData: incomingInitialData,
  showBikeTypeSelect = true,
  cancelHref = "/bikes",
  bikePassportId = null,
  publicFitState,
  onEnablePublicFitPreview,
  onDisablePublicFitPreview,
  onSubmit,
  onAutosave,
  embedded = false,
}: BikeFormProps) {
  const { locale, messages: baseMessages } = useDashboardMessages();
  const messages = getBikeLanguageMessages(locale, baseMessages);
  const copy = getBikesCopy(locale);
  const profileCopy = bikeProfileFormMessages[locale];
  const saveCopy = getBikesAutosaveCopy(locale);
  const [initialData] = useState(incomingInitialData);
  const [section, setSection] = useState("details");
  const [name, setName] = useState(initialData?.name ?? "");
  const [bikeWeightKg, setBikeWeightKg] = useState(initialData?.bikeWeightKg ?? null);
  const [equipment, setEquipment] = useState({
    saddleModel: initialData?.saddleModel ?? "", pedalModel: initialData?.pedalModel ?? "",
    cleatSystem: initialData?.cleatSystem ?? "", saddleWidthMm: initialData?.saddleWidthMm ?? null,
    maxSeatpostMm: initialData?.maxSeatpostMm ?? null, maxSpacerStackMm: initialData?.maxSpacerStackMm ?? null,
  });
  const [extraSetup, setExtraSetup] = useState({
    spacersMm: initialData?.currentSetup?.spacersMm ?? null,
    handlebarReachMm: initialData?.currentSetup?.handlebarReachMm ?? null,
    handlebarDropMm: initialData?.currentSetup?.handlebarDropMm ?? null,
  });
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [bikeType, setBikeType] = useState<BikeType | "">(initialData?.bikeType ?? "");
  const [geometryFallbackState, setGeometryFallbackState] = useState<BikeGeometryFallbackState>(() =>
    createBikeGeometryFallbackState({
      brand: initialData?.brand,
      model: initialData?.model,
      geometryRecordId: initialData?.geometryRecordId ?? null,
      geometrySizeLabel: initialData?.currentGeometry?.frameSize ?? null,
    }),
  );
  const [ridingStyle, setRidingStyle] = useState<RidingStyle | "">(initialData?.ridingStyle ?? "");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | "">(initialData?.primaryGoal ?? "");
  const [stackMm, setStackMm] = useState(initialData?.currentGeometry?.stackMm?.toString() ?? "");
  const [reachMm, setReachMm] = useState(initialData?.currentGeometry?.reachMm?.toString() ?? "");
  const [seatTubeAngle, setSeatTubeAngle] = useState(
    initialData?.currentGeometry?.seatTubeAngle?.toString() ?? "",
  );
  const [headTubeAngle, setHeadTubeAngle] = useState(
    initialData?.currentGeometry?.headTubeAngle?.toString() ?? "",
  );
  const [frameSize, setFrameSize] = useState(initialData?.currentGeometry?.frameSize ?? "");
  const [saddleHeightMm, setSaddleHeightMm] = useState(
    initialData?.currentSetup?.saddleHeightMm?.toString() ?? "",
  );
  const [saddleSetbackMm, setSaddleSetbackMm] = useState(
    initialData?.currentSetup?.saddleSetbackMm?.toString() ?? "",
  );
  const [stemLengthMm, setStemLengthMm] = useState(initialData?.currentSetup?.stemLengthMm?.toString() ?? "");
  const [stemAngle, setStemAngle] = useState(initialData?.currentSetup?.stemAngle?.toString() ?? "");
  const [handlebarWidthMm, setHandlebarWidthMm] = useState(
    initialData?.currentSetup?.handlebarWidthMm?.toString() ?? "",
  );
  const [crankLengthMm, setCrankLengthMm] = useState(
    initialData?.currentSetup?.crankLengthMm?.toString() ?? "",
  );
  const [drivetrainType, setDrivetrainType] = useState<"1x" | "2x" | "">(
    initialData?.gearing?.drivetrainType ??
      (initialData?.gearing?.chainrings?.length === 1 ? "1x" : initialData?.gearing?.chainrings?.length === 2 ? "2x" : ""),
  );
  const [frontChainring, setFrontChainring] = useState(
    initialData?.gearing?.chainrings?.[0]?.toString() ?? "",
  );
  const [innerChainring, setInnerChainring] = useState(
    initialData?.gearing?.chainrings?.[1]?.toString() ?? "",
  );
  const [cassetteTeethCsv, setCassetteTeethCsv] = useState(
    initialData?.gearing?.cassetteTeeth?.length ? initialData.gearing.cassetteTeeth.join(", ") : "",
  );
  const [wheelCircumferenceMm, setWheelCircumferenceMm] = useState(
    initialData?.gearing?.wheelCircumferenceMm?.toString() ?? "",
  );
  const [groupsetName, setGroupsetName] = useState(initialData?.gearing?.groupsetName ?? "");
  const [derailleurMaxCog, setDerailleurMaxCog] = useState(
    initialData?.gearing?.derailleurMaxCog?.toString() ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sizeLabel = geometryFallbackState.geometrySizeLabel;
    if (!sizeLabel || geometryFallbackState.geometryRecordId === initialData?.geometryRecordId) {
      return;
    }

    setFrameSize((current) => (current === sizeLabel ? current : sizeLabel));
  }, [geometryFallbackState.geometrySizeLabel, geometryFallbackState.geometryRecordId, initialData]);

  useEffect(() => {
    const selectHash = () => {
      const tab = window.location.hash === "#bike-geometry-library" ? "details"
        : window.location.hash.replace("#bike-settings-", "");
      if (["details", "measurements", "gearing", "notes"].includes(tab)) setSection(tab);
    };
    selectHash();
    window.addEventListener("hashchange", selectHash);
    return () => window.removeEventListener("hashchange", selectHash);
  }, []);

  function makePayload(): BikeFormPayload {
    const geometry = {
      stackMm: numberFromInput(stackMm),
      reachMm: numberFromInput(reachMm),
      seatTubeAngle: numberFromInput(seatTubeAngle),
      headTubeAngle: numberFromInput(headTubeAngle),
      frameSize: frameSize.trim() || undefined,
    };
    const setup = {
      spacersMm: extraSetup.spacersMm ?? undefined,
      handlebarReachMm: extraSetup.handlebarReachMm ?? undefined,
      handlebarDropMm: extraSetup.handlebarDropMm ?? undefined,
      saddleHeightMm: numberFromInput(saddleHeightMm),
      saddleSetbackMm: numberFromInput(saddleSetbackMm),
      stemLengthMm: numberFromInput(stemLengthMm),
      stemAngle: numberFromInput(stemAngle),
      handlebarWidthMm: numberFromInput(handlebarWidthMm),
      crankLengthMm: numberFromInput(crankLengthMm),
    };
    const chainrings = [
      numberFromInput(frontChainring),
      drivetrainType === "2x" ? numberFromInput(innerChainring) : undefined,
    ].filter((value): value is number => typeof value === "number");
    const cassetteTeeth = parseCommaSeparatedNumbers(cassetteTeethCsv);
    const wheelCircumference = numberFromInput(wheelCircumferenceMm);
    const hasGearingInput =
      Boolean(initialData?.gearing) ||
      chainrings.length > 0 ||
      cassetteTeeth.length > 0 ||
      typeof wheelCircumference === "number" ||
      Boolean(groupsetName.trim()) ||
      typeof numberFromInput(derailleurMaxCog) === "number";
    const gearing = hasGearingInput
      ? {
          ...initialData?.gearing,
          drivetrainType: drivetrainType || undefined,
          chainrings: chainrings.length ? chainrings : undefined,
          cassetteTeeth: cassetteTeeth.length ? cassetteTeeth : undefined,
          wheelCircumferenceMm: wheelCircumference,
          crankLengthMm: numberFromInput(crankLengthMm),
          groupsetName: groupsetName.trim() || undefined,
          derailleurMaxCog: numberFromInput(derailleurMaxCog),
        }
      : undefined;
    const normalizedIdentity = normalizeBikeGeometryIdentityPayload(geometryFallbackState);
    // Resolving an existing library link must not silently canonicalize saved identity on hydration.
    const existingLink = initialData?.geometryRecordId
      && normalizedIdentity.geometryRecordId === initialData.geometryRecordId;


    return {
      name: name.trim(),
      bikeWeightKg: bikeWeightKg ?? undefined,
      saddleModel: equipment.saddleModel.trim() || undefined,
      saddleWidthMm: equipment.saddleWidthMm ?? undefined,
      pedalModel: equipment.pedalModel.trim() || undefined,
      cleatSystem: equipment.cleatSystem.trim() || undefined,
      maxSeatpostMm: equipment.maxSeatpostMm ?? undefined,
      maxSpacerStackMm: equipment.maxSpacerStackMm ?? undefined,
      bikeType: bikeType as BikeType,
      brand: (existingLink ? initialData.brand : normalizedIdentity.brand) ?? "",
      model: (existingLink ? initialData.model : normalizedIdentity.model) ?? "",
      geometryRecordId: normalizedIdentity.geometryRecordId ?? null,
      ridingStyle: ridingStyle || undefined,
      primaryGoal: primaryGoal || undefined,
      notes: notes.trim(),
      currentGeometry: geometry,
      currentSetup: setup,
      gearing,
    };
  }
  const payload = makePayload();
  const acknowledged = useRef(payload);
  const autosave = useAutosave({
    value: payload,
    enabled: Boolean(onAutosave),
    debounceMs: 800,
    validate: (next) => {
      const errorKey = bikeEditError(next, acknowledged.current);
      return errorKey ? saveCopy[errorKey] : null;
    },
    onSave: async (next) => {
      const changed = Object.fromEntries(
        Object.entries(next).filter(
          ([key, value]) =>
            JSON.stringify(value) !== JSON.stringify(acknowledged.current[key as keyof BikeFormPayload]),
        ),
      ) as BikeAutosavePayload;
      changed.clearFields = (["ridingStyle", "primaryGoal", "bikeWeightKg", "saddleModel", "saddleWidthMm",
        "pedalModel", "cleatSystem", "maxSeatpostMm", "maxSpacerStackMm"] as const).filter(
        (key) => acknowledged.current[key] !== undefined && next[key] === undefined,
      );
      for (const group of ["currentSetup", "currentGeometry"] as const) {
        const previous = acknowledged.current[group] as Record<string, unknown> | undefined;
        const current = next[group] as Record<string, unknown> | undefined;
        for (const field of Object.keys(previous ?? {})) {
          if (previous?.[field] !== undefined && current?.[field] === undefined) {
            changed.clearFields.push(`${group}.${field}`);
          }
        }
      }
      await onAutosave?.(changed);
      acknowledged.current = next;
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onAutosave) {
      await autosave.flush();
      return;
    }
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setSection("details");
      setError(messages.bikeForm.errors.nameRequired);
      return;
    }
    if (!bikeType) {
      setSection("details");
      setError(messages.bikeForm.errors.typeRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(makePayload());
    } catch (submitError) {
      console.error("Failed to save bike:", submitError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={
        "mx-auto max-w-4xl " +
        "[&_[data-slot=tooltip-trigger]]:min-h-11 [&_[data-slot=tooltip-trigger]]:min-w-11 " +
        "[&_[data-slot=tooltip-trigger]]:justify-center"
      }
    >
      <div className="mb-8">
        {embedded ? (
          <h2 className="font-display text-2xl font-bold">{title}</h2>
        ) : (
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
        )}
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6 rounded-xl bg-[var(--bbf-petrol-zacht)] p-4">
        <Button type="button" onClick={() => {
          setSection("details");
          window.location.hash = "bike-geometry-library";
          requestAnimationFrame(() => document.getElementById("bike-geometry-library")?.scrollIntoView());
        }}>{profileCopy.lookup}</Button>
        <p className="mt-2 text-sm">{profileCopy.lookupHint}</p>
      </div>
      <SegmentedControl
        aria-label={title}
        value={section}
        onValueChange={(value) => setSection(String(value))}
        className="mb-6 flex flex-wrap"
      >
        {(["details", "measurements", "gearing", "notes"] as const).map((key) => (
          <SegmentedControlItem key={key} value={key} className="min-w-[8rem] whitespace-normal">
            <span id={`bike-settings-${key}`}>{copy[key]}</span>
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <AutosaveField flush={autosave.flush} commitOn="release">
        <form onSubmit={handleSubmit} className="space-y-6">
          {refinementsLocked && <p className="rounded-2xl border border-border bg-secondary p-4 text-sm text-secondary-foreground">
            {getPricingAccessCopy(locale).locked}{" "}
            <Link className="inline-flex min-h-11 items-center font-semibold underline" href={withLocalePrefix("/pricing", locale)}>
              {getPricingAccessCopy(locale).options}
            </Link>
          </p>}
          {section === "details" &&
          bikeId &&
          publicFitState &&
          onEnablePublicFitPreview &&
          onDisablePublicFitPreview ? (
            <BikePublicFitControls
              bikeId={bikeId}
              publicFitCode={publicFitState.publicFitCode}
              publicFitEnabled={publicFitState.publicFitEnabled}
              geometryQuality={publicFitState.geometryQuality}
              onEnable={onEnablePublicFitPreview}
              onDisable={onDisablePublicFitPreview}
            />
          ) : null}

          <Card
            variant="bordered"
            style={{ display: section === "details" ? undefined : "none" }}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle>{messages.bikeForm.sections.basics}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bikePassportId ? (
                <div className="rounded-[var(--radius-md)] border border-border bg-secondary px-3 py-3 text-sm">
                  <p className="font-medium text-foreground">{messages.bikes.identity.passportLabel}</p>
                  <p className="mt-1 font-mono text-foreground">{bikePassportId}</p>
                </div>
              ) : null}

              <Input
                className="min-h-11"
                label={messages.bikeForm.fields.name.label}
                tooltip={messages.bikeForm.fields.name.tooltip}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={messages.bikeForm.fields.name.placeholder}
              />

              <BikeNumberField
                label={saveCopy.bikeWeight}
                value={bikeWeightKg}
                min={3}
                max={20}
                step={0.1}
                unit="kg"
                onChange={setBikeWeightKg}
              />

              <div id="bike-geometry-library" className="scroll-mt-6">
              <BikeGeometryLibraryFields
                state={geometryFallbackState}
                onChange={setGeometryFallbackState}
                messages={messages}
              />
              </div>

              {showBikeTypeSelect ? (
                <Field.Root className="space-y-3">
                  <Field.Label className="text-sm font-medium text-foreground">
                    {messages.bikeForm.fields.type.label}
                  </Field.Label>
                  <Field.Description className="text-sm text-muted-foreground">
                    {messages.bikeForm.fields.type.tooltip}
                  </Field.Description>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {getBikeTypeOptions(messages).map((option) => (
                      <Selectable
                        key={option.value}
                        onClick={() => setBikeType(option.value)}
                        selected={bikeType === option.value}
                        variant="card"
                        label={option.label}
                        description={option.description}
                      />
                    ))}
                  </div>
                </Field.Root>
              ) : (
                <div
                  className={
                    "rounded-[var(--radius-md)] border border-border bg-secondary px-3 py-2 text-sm " +
                    "text-muted-foreground"
                  }
                >
                  <span className="font-medium text-foreground">
                    {messages.bikeForm.fields.type.staticLabel}
                  </span>{" "}
                  {bikeType ? getBikeTypeLabel(bikeType, messages) : "-"}
                </div>
              )}

              <BikeChoiceField
                label={messages.fit.sections.ridingStyle}
                tooltip={messages.fit.sections.ridingStyleTooltip}
                value={ridingStyle}
                onChange={(value) => setRidingStyle(value as RidingStyle)}
                options={[
                  { value: "recreational", label: messages.fit.ridingStyles.recreational.label },
                  { value: "fitness", label: messages.fit.ridingStyles.fitness.label },
                  { value: "sportive", label: messages.fit.ridingStyles.sportive.label },
                  { value: "racing", label: messages.fit.ridingStyles.racing.label },
                  { value: "commuting", label: messages.fit.ridingStyles.commuting.label },
                  { value: "touring", label: messages.fit.ridingStyles.touring.label },
                ]}
                optional
              />

              <BikeChoiceField
                label={messages.fit.sections.primaryGoal}
                tooltip={messages.fit.sections.primaryGoalTooltip}
                value={primaryGoal}
                onChange={(value) => setPrimaryGoal(value as PrimaryGoal)}
                options={[
                  { value: "comfort", label: messages.fit.goals.comfort.label },
                  { value: "balanced", label: messages.fit.goals.balanced.label },
                  { value: "performance", label: messages.fit.goals.performance.label },
                  { value: "aerodynamics", label: messages.fit.goals.aerodynamics.label },
                ]}
                optional
              />
            </CardContent>
          </Card>

          <Card
            variant="bordered"
            style={{ display: section === "measurements" ? undefined : "none" }}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle>{messages.bikeForm.sections.geometry}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <BikeNumberField
                label={messages.bikeForm.fields.geometry.stack.label}
                tooltip={messages.bikeForm.fields.geometry.stack.tooltip}
                min={200}
                max={900}
                unit="mm"
                value={numberToInputValue(stackMm)}
                onChange={(value) => setStackMm(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.geometry.reach.label}
                tooltip={messages.bikeForm.fields.geometry.reach.tooltip}
                min={200}
                max={600}
                unit="mm"
                value={numberToInputValue(reachMm)}
                onChange={(value) => setReachMm(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.geometry.seatTubeAngle.label}
                disabled={refinementsLocked}
                tooltip={messages.bikeForm.fields.geometry.seatTubeAngle.tooltip}
                step={0.1}
                min={50}
                max={90}
                unit="°"
                value={numberToInputValue(seatTubeAngle)}
                onChange={(value) => setSeatTubeAngle(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.geometry.headTubeAngle.label}
                disabled={refinementsLocked}
                tooltip={messages.bikeForm.fields.geometry.headTubeAngle.tooltip}
                step={0.1}
                min={50}
                max={90}
                unit="°"
                value={numberToInputValue(headTubeAngle)}
                onChange={(value) => setHeadTubeAngle(value === null ? "" : String(value))}
              />
              <BikeFrameSizeField
                label={messages.bikeForm.fields.geometry.frameSize.label}
                tooltip={messages.bikeForm.fields.geometry.frameSize.tooltip}
                value={frameSize}
                onChange={setFrameSize}
              />
            </CardContent>
          </Card>

          <Card
            variant="bordered"
            style={{ display: section === "measurements" ? undefined : "none" }}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle>{messages.bikeForm.sections.setup}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm text-muted-foreground sm:col-span-2">{profileCopy.optional}</p>
              {(["saddleModel", "pedalModel", "cleatSystem"] as const).map((field) =>
                <Input key={field} label={profileCopy[field]} tooltip={profileCopy.equipmentHint} maxLength={100} value={equipment[field]}
                  onChange={(event) => setEquipment({ ...equipment, [field]: event.target.value })} />)}
              {(["saddleWidthMm", "maxSeatpostMm", "maxSpacerStackMm"] as const).map((field) =>
                <BikeNumberField key={field} label={profileCopy[field]} value={equipment[field]} unit="mm"
                  min={field === "saddleWidthMm" ? 90 : 0}
                  max={field === "saddleWidthMm" ? 260 : field === "maxSeatpostMm" ? 500 : 100}
                  tooltip={field !== "saddleWidthMm" ? profileCopy.limitsHint : profileCopy.optional}
                  onChange={(value) => setEquipment({ ...equipment, [field]: value })} />)}
              {(["spacersMm", "handlebarReachMm", "handlebarDropMm"] as const).map((field) =>
                <BikeNumberField key={field} label={profileCopy[field]} value={extraSetup[field]} unit="mm"
                  disabled={refinementsLocked && field !== "spacersMm"}
                  tooltip={field === "spacersMm" ? profileCopy.measureSpacers
                    : field === "handlebarReachMm" ? profileCopy.measureReach : profileCopy.measureDrop}
                  min={field === "handlebarDropMm" ? -200 : field === "handlebarReachMm" ? 200 : 0}
                  max={field === "handlebarReachMm" ? 1000 : field === "handlebarDropMm" ? 300 : 100}
                  onChange={(value) => setExtraSetup({ ...extraSetup, [field]: value })} />)}
              <BikeNumberField
                label={messages.bikeForm.fields.setup.saddleHeight.label}
                tooltip={messages.bikeForm.fields.setup.saddleHeight.tooltip}
                min={400}
                max={1000}
                unit="mm"
                value={numberToInputValue(saddleHeightMm)}
                onChange={(value) => setSaddleHeightMm(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.setup.saddleSetback.label}
                tooltip={messages.bikeForm.fields.setup.saddleSetback.tooltip}
                min={-100}
                max={200}
                unit="mm"
                value={numberToInputValue(saddleSetbackMm)}
                onChange={(value) => setSaddleSetbackMm(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.setup.stemLength.label}
                tooltip={messages.bikeForm.fields.setup.stemLength.tooltip}
                min={20}
                max={200}
                unit="mm"
                value={numberToInputValue(stemLengthMm)}
                onChange={(value) => setStemLengthMm(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.setup.stemAngle.label}
                tooltip={messages.bikeForm.fields.setup.stemAngle.tooltip}
                step={0.1}
                min={-45}
                max={45}
                unit="°"
                value={numberToInputValue(stemAngle)}
                onChange={(value) => setStemAngle(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.setup.handlebarWidth.label}
                tooltip={messages.bikeForm.fields.setup.handlebarWidth.tooltip}
                min={300}
                max={900}
                unit="mm"
                value={numberToInputValue(handlebarWidthMm)}
                onChange={(value) => setHandlebarWidthMm(value === null ? "" : String(value))}
              />
              <BikeNumberField
                label={messages.bikeForm.fields.setup.crankLength.label}
                tooltip={messages.bikeForm.fields.setup.crankLength.tooltip}
                step={0.1}
                min={120}
                max={220}
                unit="mm"
                value={numberToInputValue(crankLengthMm)}
                onChange={(value) => setCrankLengthMm(value === null ? "" : String(value))}
              />
            </CardContent>
          </Card>

          <Card
            variant="bordered"
            style={{ display: section === "gearing" ? undefined : "none" }}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle>{locale === "nl" ? "Versnelling" : "Gearing"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {refinementsLocked && <p className="text-sm text-muted-foreground sm:col-span-2">{getPricingAccessCopy(locale).locked}</p>}
              <fieldset disabled={refinementsLocked} className="contents">
              <BikeChoiceField
                label={locale === "nl" ? "Aandrijving" : "Drivetrain"}
                tooltip={
                  locale === "nl"
                    ? "Kies 1x of 2x zodat kettingbladen en cassette logisch worden geïnterpreteerd."
                    : "Choose 1x or 2x so chainring and cassette inputs are interpreted correctly."
                }
                value={drivetrainType}
                onChange={(value) => setDrivetrainType(value as "1x" | "2x")}
                options={[
                  { value: "1x", label: "1x" },
                  { value: "2x", label: "2x" },
                ]}
              />
              <BikeNumberField
                label={locale === "nl" ? "Buitenste kettingblad" : "Outer chainring"}
                min={20}
                max={70}
                value={numberToInputValue(frontChainring)}
                onChange={(value) => setFrontChainring(value === null ? "" : String(value))}
                unit="t"
              />
              <BikeNumberField
                label={locale === "nl" ? "Binnenste kettingblad" : "Inner chainring"}
                min={20}
                max={60}
                value={numberToInputValue(innerChainring)}
                onChange={(value) => setInnerChainring(value === null ? "" : String(value))}
                disabled={drivetrainType !== "2x"}
                unit="t"
              />
              </fieldset>
              <BikeNumberField
                label={locale === "nl" ? "Wielomtrek" : "Wheel circumference"}
                min={1000}
                max={3000}
                value={numberToInputValue(wheelCircumferenceMm)}
                onChange={(value) => setWheelCircumferenceMm(value === null ? "" : String(value))}
                unit="mm"
              />
              <fieldset disabled={refinementsLocked} className="contents">
              <BikeCassetteField
                label={locale === "nl" ? "Cassette-tanden" : "Cassette teeth"}
                value={cassetteTeethCsv}
                onChange={setCassetteTeethCsv}
              />
              </fieldset>
              <Input
                className="min-h-11"
                label={locale === "nl" ? "Groepset" : "Groupset"}
                tooltip={
                  locale === "nl"
                    ? "Optioneel. Handig om later te herkennen welke drivetrain op deze fiets zit."
                    : "Optional. Useful when you want to remember which drivetrain this bike is using."
                }
                value={groupsetName}
                onChange={(event) => setGroupsetName(event.target.value)}
                placeholder="Ultegra / GRX / GX"
              />
              <BikeNumberField
                label={locale === "nl" ? "Max. achtertand derailleur" : "Rear derailleur max cog"}
                min={10}
                max={60}
                value={numberToInputValue(derailleurMaxCog)}
                onChange={(value) => setDerailleurMaxCog(value === null ? "" : String(value))}
                unit="t"
              />
              <div
                className={
                  "rounded-[var(--radius-md)] border border-border bg-secondary/30 p-4 text-sm " +
                  "text-muted-foreground"
                }
              >
                {locale === "nl"
                  ? "Bestaande fietsen mogen gedeeltelijk ingevuld blijven, maar nieuwe " +
                    "fietsen moeten genoeg gearing-data hebben voor bruikbare resultaten."
                  : "Existing bikes may remain partially filled, but new bikes should have " +
                    "enough gearing data for usable calculator results."}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="bordered"
            style={{ display: section === "notes" ? undefined : "none" }}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle>{messages.bikeForm.sections.notes}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                label={messages.bikeForm.fields.notes.label}
                aria-label={messages.bikeForm.fields.notes.label}
                value={notes}
                onChange={(event) => setNotes(event.target.value.slice(0, 500))}
                placeholder={messages.bikeForm.fields.notes.placeholder}
                helperText={`${messages.bikeForm.fields.notes.helper} ${notes.length}/500`}
              />
            </CardContent>
          </Card>

          {error ? (
            <div
              className={
                "rounded-[var(--radius-md)] border border-destructive bg-destructive/15 px-4 py-3 " +
                "text-sm text-danger"
              }
            >
              {error}
            </div>
          ) : null}

          {onAutosave ? (
            <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                {submitLabel}
              </Button>
              <Button variant="outline" {...linkButtonProps(cancelHref)}>
                {messages.common.cancel}
              </Button>
            </div>
          )}
        </form>
      </AutosaveField>
    </div>
  );
}
