"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  NumberInput,
  Select,
  Selectable,
  Textarea,
} from "@/components/ui";
import { BikeGeometryLibraryFields } from "./BikeGeometryLibraryFields";
import {
  BikePublicFitControls,
  type PublicFitGeometryQuality,
} from "./BikePublicFitControls";
import {
  createBikeGeometryFallbackState,
  normalizeBikeGeometryIdentityPayload,
  type BikeGeometryFallbackState,
} from "./bikeFormGeometry";
import { Field } from "@/components/ui/Field";
import { getBikeTypeLabel, getBikeTypeOptions, type BikeType } from "@/lib/bikes";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type RidingStyle =
  | "recreational"
  | "fitness"
  | "sportive"
  | "racing"
  | "commuting"
  | "touring";

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

interface BikeFormProps {
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
  onSubmit: (payload: BikeFormPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
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
  bikeId,
  title,
  description,
  submitLabel,
  initialData,
  showBikeTypeSelect = true,
  cancelHref = "/bikes",
  bikePassportId = null,
  publicFitState,
  onEnablePublicFitPreview,
  onDisablePublicFitPreview,
  onSubmit,
  onDelete,
}: BikeFormProps) {
  const { locale, messages } = useDashboardMessages();
  const [name, setName] = useState(initialData?.name ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [bikeType, setBikeType] = useState<BikeType | "">(initialData?.bikeType ?? "");
  const [geometryFallbackState, setGeometryFallbackState] =
    useState<BikeGeometryFallbackState>(() =>
      createBikeGeometryFallbackState({
        brand: initialData?.brand,
        model: initialData?.model,
        geometryRecordId: initialData?.geometryRecordId ?? null,
        geometrySizeLabel: initialData?.currentGeometry?.frameSize ?? null,
      })
    );
  const [ridingStyle, setRidingStyle] = useState<RidingStyle | "">(initialData?.ridingStyle ?? "");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | "">(initialData?.primaryGoal ?? "");
  const [stackMm, setStackMm] = useState(initialData?.currentGeometry?.stackMm?.toString() ?? "");
  const [reachMm, setReachMm] = useState(initialData?.currentGeometry?.reachMm?.toString() ?? "");
  const [seatTubeAngle, setSeatTubeAngle] = useState(initialData?.currentGeometry?.seatTubeAngle?.toString() ?? "");
  const [headTubeAngle, setHeadTubeAngle] = useState(initialData?.currentGeometry?.headTubeAngle?.toString() ?? "");
  const [frameSize, setFrameSize] = useState(initialData?.currentGeometry?.frameSize ?? "");
  const [saddleHeightMm, setSaddleHeightMm] = useState(initialData?.currentSetup?.saddleHeightMm?.toString() ?? "");
  const [saddleSetbackMm, setSaddleSetbackMm] = useState(initialData?.currentSetup?.saddleSetbackMm?.toString() ?? "");
  const [stemLengthMm, setStemLengthMm] = useState(initialData?.currentSetup?.stemLengthMm?.toString() ?? "");
  const [stemAngle, setStemAngle] = useState(initialData?.currentSetup?.stemAngle?.toString() ?? "");
  const [handlebarWidthMm, setHandlebarWidthMm] = useState(initialData?.currentSetup?.handlebarWidthMm?.toString() ?? "");
  const [crankLengthMm, setCrankLengthMm] = useState(initialData?.currentSetup?.crankLengthMm?.toString() ?? "");
  const [drivetrainType, setDrivetrainType] = useState<"1x" | "2x">(
    initialData?.gearing?.drivetrainType ?? (initialData?.bikeType === "gravel" || initialData?.bikeType === "mountain" ? "1x" : "2x")
  );
  const [frontChainring, setFrontChainring] = useState(initialData?.gearing?.chainrings?.[0]?.toString() ?? "");
  const [innerChainring, setInnerChainring] = useState(initialData?.gearing?.chainrings?.[1]?.toString() ?? "");
  const [cassetteTeethCsv, setCassetteTeethCsv] = useState(
    initialData?.gearing?.cassetteTeeth?.length ? initialData.gearing.cassetteTeeth.join(", ") : ""
  );
  const [wheelCircumferenceMm, setWheelCircumferenceMm] = useState(
    initialData?.gearing?.wheelCircumferenceMm?.toString() ?? "2105"
  );
  const [groupsetName, setGroupsetName] = useState(initialData?.gearing?.groupsetName ?? "");
  const [derailleurMaxCog, setDerailleurMaxCog] = useState(initialData?.gearing?.derailleurMaxCog?.toString() ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sizeLabel = geometryFallbackState.geometrySizeLabel;
    if (!sizeLabel) {
      return;
    }

    setFrameSize((current) =>
      current === sizeLabel
        ? current
        : sizeLabel
    );
  }, [geometryFallbackState.geometrySizeLabel]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(messages.bikeForm.errors.nameRequired);
      return;
    }
    if (!bikeType) {
      setError(messages.bikeForm.errors.typeRequired);
      return;
    }

    const geometry = {
      stackMm: numberFromInput(stackMm),
      reachMm: numberFromInput(reachMm),
      seatTubeAngle: numberFromInput(seatTubeAngle),
      headTubeAngle: numberFromInput(headTubeAngle),
      frameSize: frameSize.trim() || undefined,
    };
    const setup = {
      saddleHeightMm: numberFromInput(saddleHeightMm),
      saddleSetbackMm: numberFromInput(saddleSetbackMm),
      stemLengthMm: numberFromInput(stemLengthMm),
      stemAngle: numberFromInput(stemAngle),
      handlebarWidthMm: numberFromInput(handlebarWidthMm),
      crankLengthMm: numberFromInput(crankLengthMm),
    };
    const chainrings = [numberFromInput(frontChainring), numberFromInput(innerChainring)].filter(
      (value): value is number => typeof value === "number"
    );
    const cassetteTeeth = parseCommaSeparatedNumbers(cassetteTeethCsv);
    const wheelCircumference = numberFromInput(wheelCircumferenceMm);
    const hasGearingInput =
      Boolean(initialData?.gearing) ||
      chainrings.length > 0 ||
      cassetteTeeth.length > 0 ||
      typeof wheelCircumference === "number" ||
      Boolean(groupsetName.trim()) ||
      typeof numberFromInput(derailleurMaxCog) === "number";
    const gearing =
      hasGearingInput
        ? {
            drivetrainType: drivetrainType || undefined,
            chainrings: chainrings.length ? chainrings : undefined,
            cassetteTeeth: cassetteTeeth.length ? cassetteTeeth : undefined,
            wheelCircumferenceMm: wheelCircumference,
            crankLengthMm: numberFromInput(crankLengthMm),
            groupsetName: groupsetName.trim() || undefined,
            derailleurMaxCog: numberFromInput(derailleurMaxCog),
          }
        : undefined;
    const normalizedIdentity = normalizeBikeGeometryIdentityPayload(
      geometryFallbackState
    );

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        bikeType,
        brand: normalizedIdentity.brand,
        model: normalizedIdentity.model,
        geometryRecordId: normalizedIdentity.geometryRecordId ?? null,
        ridingStyle: ridingStyle || undefined,
        primaryGoal: primaryGoal || undefined,
        notes: notes.trim() || undefined,
        currentGeometry: Object.values(geometry).some((value) => value !== undefined) ? geometry : undefined,
        currentSetup: Object.values(setup).some((value) => value !== undefined) ? setup : undefined,
        gearing,
      });
    } catch (submitError) {
      console.error("Failed to save bike:", submitError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete();
      setShowDeleteDialog(false);
    } catch (deleteError) {
      console.error("Failed to delete bike:", deleteError);
      setError(messages.bikeForm.errors.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[color:var(--foreground)]">{title}</h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {bikeId && publicFitState && onEnablePublicFitPreview && onDisablePublicFitPreview ? (
          <BikePublicFitControls
            bikeId={bikeId}
            publicFitCode={publicFitState.publicFitCode}
            publicFitEnabled={publicFitState.publicFitEnabled}
            geometryQuality={publicFitState.geometryQuality}
            onEnable={onEnablePublicFitPreview}
            onDisable={onDisablePublicFitPreview}
          />
        ) : null}

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.bikeForm.sections.basics}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bikePassportId ? (
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-3 text-sm">
                <p className="font-medium text-[color:var(--foreground)]">
                  {messages.bikes.identity.passportLabel}
                </p>
                <p className="mt-1 font-mono text-[color:var(--foreground)]">{bikePassportId}</p>
              </div>
            ) : null}

            <Input
              label={messages.bikeForm.fields.name.label}
              tooltip={messages.bikeForm.fields.name.tooltip}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={messages.bikeForm.fields.name.placeholder}
              required
            />

            <BikeGeometryLibraryFields
              state={geometryFallbackState}
              onChange={setGeometryFallbackState}
              messages={messages}
            />

            {showBikeTypeSelect ? (
              <Field.Root className="space-y-3">
                <Field.Label className="text-sm font-medium text-[color:var(--foreground)]">
                  {messages.bikeForm.fields.type.label}
                </Field.Label>
                <Field.Description className="text-sm text-[color:var(--muted-foreground)]">
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
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-2 text-sm text-[color:var(--muted-foreground)]">
                <span className="font-medium text-[color:var(--foreground)]">
                  {messages.bikeForm.fields.type.staticLabel}
                </span>{" "}
                {bikeType ? getBikeTypeLabel(bikeType, messages) : "-"}
              </div>
            )}

            <Select
              label={messages.fit.sections.ridingStyle}
              tooltip={messages.fit.sections.ridingStyleTooltip}
              value={ridingStyle}
              onChange={(event) => setRidingStyle(event.target.value as RidingStyle)}
              options={[
                { value: "recreational", label: messages.fit.ridingStyles.recreational.label },
                { value: "fitness", label: messages.fit.ridingStyles.fitness.label },
                { value: "sportive", label: messages.fit.ridingStyles.sportive.label },
                { value: "racing", label: messages.fit.ridingStyles.racing.label },
                { value: "commuting", label: messages.fit.ridingStyles.commuting.label },
                { value: "touring", label: messages.fit.ridingStyles.touring.label },
              ]}
              placeholder={messages.fit.sections.ridingStyle}
            />

            <Select
              label={messages.fit.sections.primaryGoal}
              tooltip={messages.fit.sections.primaryGoalTooltip}
              value={primaryGoal}
              onChange={(event) => setPrimaryGoal(event.target.value as PrimaryGoal)}
              options={[
                { value: "comfort", label: messages.fit.goals.comfort.label },
                { value: "balanced", label: messages.fit.goals.balanced.label },
                { value: "performance", label: messages.fit.goals.performance.label },
                { value: "aerodynamics", label: messages.fit.goals.aerodynamics.label },
              ]}
              placeholder={messages.fit.sections.primaryGoal}
            />
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.bikeForm.sections.geometry}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NumberInput label={messages.bikeForm.fields.geometry.stack.label} tooltip={messages.bikeForm.fields.geometry.stack.tooltip} value={numberToInputValue(stackMm)} onChange={(value) => setStackMm(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.geometry.reach.label} tooltip={messages.bikeForm.fields.geometry.reach.tooltip} value={numberToInputValue(reachMm)} onChange={(value) => setReachMm(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.geometry.seatTubeAngle.label} tooltip={messages.bikeForm.fields.geometry.seatTubeAngle.tooltip} step={0.1} value={numberToInputValue(seatTubeAngle)} onChange={(value) => setSeatTubeAngle(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.geometry.headTubeAngle.label} tooltip={messages.bikeForm.fields.geometry.headTubeAngle.tooltip} step={0.1} value={numberToInputValue(headTubeAngle)} onChange={(value) => setHeadTubeAngle(value === null ? "" : String(value))} />
            <Input label={messages.bikeForm.fields.geometry.frameSize.label} tooltip={messages.bikeForm.fields.geometry.frameSize.tooltip} value={frameSize} onChange={(event) => setFrameSize(event.target.value)} placeholder={messages.bikeForm.fields.geometry.frameSize.placeholder} />
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.bikeForm.sections.setup}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NumberInput label={messages.bikeForm.fields.setup.saddleHeight.label} tooltip={messages.bikeForm.fields.setup.saddleHeight.tooltip} value={numberToInputValue(saddleHeightMm)} onChange={(value) => setSaddleHeightMm(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.setup.saddleSetback.label} tooltip={messages.bikeForm.fields.setup.saddleSetback.tooltip} value={numberToInputValue(saddleSetbackMm)} onChange={(value) => setSaddleSetbackMm(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.setup.stemLength.label} tooltip={messages.bikeForm.fields.setup.stemLength.tooltip} value={numberToInputValue(stemLengthMm)} onChange={(value) => setStemLengthMm(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.setup.stemAngle.label} tooltip={messages.bikeForm.fields.setup.stemAngle.tooltip} step={0.1} value={numberToInputValue(stemAngle)} onChange={(value) => setStemAngle(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.setup.handlebarWidth.label} tooltip={messages.bikeForm.fields.setup.handlebarWidth.tooltip} value={numberToInputValue(handlebarWidthMm)} onChange={(value) => setHandlebarWidthMm(value === null ? "" : String(value))} />
            <NumberInput label={messages.bikeForm.fields.setup.crankLength.label} tooltip={messages.bikeForm.fields.setup.crankLength.tooltip} step={0.1} value={numberToInputValue(crankLengthMm)} onChange={(value) => setCrankLengthMm(value === null ? "" : String(value))} />
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{locale === "nl" ? "Versnelling" : "Gearing"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Select
              label={locale === "nl" ? "Aandrijving" : "Drivetrain"}
              tooltip={
                locale === "nl"
                  ? "Kies 1x of 2x zodat kettingbladen en cassette logisch worden geïnterpreteerd."
                  : "Choose 1x or 2x so chainring and cassette inputs are interpreted correctly."
              }
              value={drivetrainType}
              onChange={(event) => setDrivetrainType(event.target.value as "1x" | "2x")}
              options={[
                { value: "1x", label: "1x" },
                { value: "2x", label: "2x" },
              ]}
            />
            <NumberInput
              label={locale === "nl" ? "Buitenste kettingblad" : "Outer chainring"}
              value={numberToInputValue(frontChainring)}
              onChange={(value) => setFrontChainring(value === null ? "" : String(value))}
              unit="t"
            />
            <NumberInput
              label={locale === "nl" ? "Binnenste kettingblad" : "Inner chainring"}
              value={numberToInputValue(innerChainring)}
              onChange={(value) => setInnerChainring(value === null ? "" : String(value))}
              disabled={drivetrainType !== "2x"}
              unit="t"
            />
            <NumberInput
              label={locale === "nl" ? "Wielomtrek" : "Wheel circumference"}
              value={numberToInputValue(wheelCircumferenceMm)}
              onChange={(value) => setWheelCircumferenceMm(value === null ? "" : String(value))}
              unit="mm"
            />
            <Textarea
              label={locale === "nl" ? "Cassette-tanden" : "Cassette teeth"}
              value={cassetteTeethCsv}
              onChange={(event) => setCassetteTeethCsv(event.target.value)}
              placeholder="11, 12, 13, 15, 17, 19, 21, 24, 28, 32"
              helperText={
                locale === "nl" ? "Gebruik komma's of spaties." : "Use commas or spaces."
              }
            />
            <Input
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
            <NumberInput
              label={locale === "nl" ? "Max. achtertand derailleur" : "Rear derailleur max cog"}
              value={numberToInputValue(derailleurMaxCog)}
              onChange={(value) => setDerailleurMaxCog(value === null ? "" : String(value))}
              unit="t"
            />
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/30 p-4 text-sm text-muted-foreground">
              {locale === "nl"
                ? "Bestaande fietsen mogen gedeeltelijk ingevuld blijven, maar nieuwe fietsen moeten genoeg gearing-data hebben voor bruikbare resultaten."
                : "Existing bikes may remain partially filled, but new bikes should have enough gearing data for usable calculator results."}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.bikeForm.sections.notes}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              label={messages.bikeForm.fields.notes.label}
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, 500))}
              placeholder={messages.bikeForm.fields.notes.placeholder}
              helperText={`${messages.bikeForm.fields.notes.helper} ${notes.length}/500`}
            />
          </CardContent>
        </Card>

        {error ? <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--danger)_8%)] px-4 py-3 text-sm text-[color:var(--danger)]">{error}</div> : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
          <Button variant="outline" {...linkButtonProps(cancelHref)}>{messages.common.cancel}</Button>
          {onDelete ? (
            <Button type="button" variant="destructive" onClick={() => setShowDeleteDialog(true)} isLoading={isDeleting} className="ml-auto">
              {messages.bikeForm.actions.deleteBike}
            </Button>
          ) : null}
        </div>
      </form>

      {onDelete ? (
        <AccessibleDialog
          open={showDeleteDialog}
          onClose={() => {
            if (!isDeleting) setShowDeleteDialog(false);
          }}
          title={messages.bikeForm.delete.title}
          description={messages.bikeForm.delete.description}
        >
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              {messages.common.cancel}
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} isLoading={isDeleting}>
              {messages.bikeForm.delete.confirmButton}
            </Button>
          </div>
        </AccessibleDialog>
      ) : null}
    </div>
  );
}
