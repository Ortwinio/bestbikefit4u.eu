"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from "@/components/ui";
import { BIKE_TYPE_OPTIONS, BIKE_TYPE_LABELS, type BikeType } from "@/lib/bikes";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export type BikeFormPayload = {
  name: string;
  bikeType: BikeType;
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
};

export interface BikeFormInitialData {
  name: string;
  bikeType: BikeType;
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
}

interface BikeFormProps {
  title: string;
  description: string;
  submitLabel: string;
  initialData?: BikeFormInitialData;
  showBikeTypeSelect?: boolean;
  cancelHref?: string;
  onSubmit: (payload: BikeFormPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function numberFromInput(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function BikeForm({
  title,
  description,
  submitLabel,
  initialData,
  showBikeTypeSelect = true,
  cancelHref = "/bikes",
  onSubmit,
  onDelete,
}: BikeFormProps) {
  const { messages } = useDashboardMessages();
  const [name, setName] = useState(initialData?.name ?? "");
  const [bikeType, setBikeType] = useState<BikeType | "">(
    initialData?.bikeType ?? ""
  );

  const [stackMm, setStackMm] = useState(
    initialData?.currentGeometry?.stackMm?.toString() ?? ""
  );
  const [reachMm, setReachMm] = useState(
    initialData?.currentGeometry?.reachMm?.toString() ?? ""
  );
  const [seatTubeAngle, setSeatTubeAngle] = useState(
    initialData?.currentGeometry?.seatTubeAngle?.toString() ?? ""
  );
  const [headTubeAngle, setHeadTubeAngle] = useState(
    initialData?.currentGeometry?.headTubeAngle?.toString() ?? ""
  );
  const [frameSize, setFrameSize] = useState(
    initialData?.currentGeometry?.frameSize ?? ""
  );

  const [saddleHeightMm, setSaddleHeightMm] = useState(
    initialData?.currentSetup?.saddleHeightMm?.toString() ?? ""
  );
  const [saddleSetbackMm, setSaddleSetbackMm] = useState(
    initialData?.currentSetup?.saddleSetbackMm?.toString() ?? ""
  );
  const [stemLengthMm, setStemLengthMm] = useState(
    initialData?.currentSetup?.stemLengthMm?.toString() ?? ""
  );
  const [stemAngle, setStemAngle] = useState(
    initialData?.currentSetup?.stemAngle?.toString() ?? ""
  );
  const [handlebarWidthMm, setHandlebarWidthMm] = useState(
    initialData?.currentSetup?.handlebarWidthMm?.toString() ?? ""
  );
  const [crankLengthMm, setCrankLengthMm] = useState(
    initialData?.currentSetup?.crankLengthMm?.toString() ?? ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    const hasGeometry = Object.values(geometry).some((value) => value !== undefined);
    const hasSetup = Object.values(setup).some((value) => value !== undefined);

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        bikeType,
        currentGeometry: hasGeometry ? geometry : undefined,
        currentSetup: hasSetup ? setup : undefined,
      });
    } catch (submitError) {
      console.error("Failed to save bike:", submitError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    const confirmed = window.confirm(
      messages.bikeForm.delete.confirm
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (deleteError) {
      console.error("Failed to delete bike:", deleteError);
      setError(messages.bikeForm.errors.deleteFailed);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.bikeForm.sections.basics}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={messages.bikeForm.fields.name.label}
              tooltip={messages.bikeForm.fields.name.tooltip}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={messages.bikeForm.fields.name.placeholder}
              required
            />

            {showBikeTypeSelect ? (
              <Select
                label={messages.bikeForm.fields.type.label}
                tooltip={messages.bikeForm.fields.type.tooltip}
                value={bikeType}
                onChange={(event) => setBikeType(event.target.value as BikeType)}
                options={BIKE_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                placeholder={messages.bikeForm.fields.type.placeholder}
                required
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <span className="font-medium">{messages.bikeForm.fields.type.staticLabel}</span>{" "}
                {bikeType ? BIKE_TYPE_LABELS[bikeType] : "-"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.bikeForm.sections.geometry}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label={messages.bikeForm.fields.geometry.stack.label}
              tooltip={messages.bikeForm.fields.geometry.stack.tooltip}
              type="number"
              value={stackMm}
              onChange={(event) => setStackMm(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.geometry.reach.label}
              tooltip={messages.bikeForm.fields.geometry.reach.tooltip}
              type="number"
              value={reachMm}
              onChange={(event) => setReachMm(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.geometry.seatTubeAngle.label}
              tooltip={messages.bikeForm.fields.geometry.seatTubeAngle.tooltip}
              type="number"
              step="0.1"
              value={seatTubeAngle}
              onChange={(event) => setSeatTubeAngle(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.geometry.headTubeAngle.label}
              tooltip={messages.bikeForm.fields.geometry.headTubeAngle.tooltip}
              type="number"
              step="0.1"
              value={headTubeAngle}
              onChange={(event) => setHeadTubeAngle(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.geometry.frameSize.label}
              tooltip={messages.bikeForm.fields.geometry.frameSize.tooltip}
              value={frameSize}
              onChange={(event) => setFrameSize(event.target.value)}
              placeholder={messages.bikeForm.fields.geometry.frameSize.placeholder}
            />
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.bikeForm.sections.setup}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label={messages.bikeForm.fields.setup.saddleHeight.label}
              tooltip={messages.bikeForm.fields.setup.saddleHeight.tooltip}
              type="number"
              value={saddleHeightMm}
              onChange={(event) => setSaddleHeightMm(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.setup.saddleSetback.label}
              tooltip={messages.bikeForm.fields.setup.saddleSetback.tooltip}
              type="number"
              value={saddleSetbackMm}
              onChange={(event) => setSaddleSetbackMm(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.setup.stemLength.label}
              tooltip={messages.bikeForm.fields.setup.stemLength.tooltip}
              type="number"
              value={stemLengthMm}
              onChange={(event) => setStemLengthMm(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.setup.stemAngle.label}
              tooltip={messages.bikeForm.fields.setup.stemAngle.tooltip}
              type="number"
              step="0.1"
              value={stemAngle}
              onChange={(event) => setStemAngle(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.setup.handlebarWidth.label}
              tooltip={messages.bikeForm.fields.setup.handlebarWidth.tooltip}
              type="number"
              value={handlebarWidthMm}
              onChange={(event) => setHandlebarWidthMm(event.target.value)}
            />
            <Input
              label={messages.bikeForm.fields.setup.crankLength.label}
              tooltip={messages.bikeForm.fields.setup.crankLength.tooltip}
              type="number"
              step="0.1"
              value={crankLengthMm}
              onChange={(event) => setCrankLengthMm(event.target.value)}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" isLoading={isSubmitting}>
            {submitLabel}
          </Button>

          <Link href={cancelHref}>
            <Button type="button" variant="outline">
              {messages.common.cancel}
            </Button>
          </Link>

          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="ml-auto"
            >
              {messages.bikeForm.actions.deleteBike}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
