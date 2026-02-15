"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from "@/components/ui";
import { BIKE_TYPE_OPTIONS, BIKE_TYPE_LABELS, type BikeType } from "@/lib/bikes";

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
      setError("Bike name is required.");
      return;
    }

    if (!bikeType) {
      setError("Bike type is required.");
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
      setError("Could not save bike. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this bike? This action cannot be undone."
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
      setError("Could not delete bike. Please try again.");
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
            <CardTitle>Bike Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Bike Name"
              tooltip="A label for this bike (e.g., Canyon Endurace 2023). Helps you track multiple fits."
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Canyon Endurace"
              required
            />

            {showBikeTypeSelect ? (
              <Select
                label="Bike Type"
                tooltip="Select the exact type of bike you're fitting. This changes posture targets and safety limits."
                value={bikeType}
                onChange={(event) => setBikeType(event.target.value as BikeType)}
                options={BIKE_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                placeholder="Choose bike type"
                required
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <span className="font-medium">Bike Type:</span>{" "}
                {bikeType ? BIKE_TYPE_LABELS[bikeType] : "-"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Current Geometry (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Stack (mm)"
              tooltip="Vertical distance from BB center to top of head tube (mm). Found on the manufacturer geometry chart; determines handlebar height potential."
              type="number"
              value={stackMm}
              onChange={(event) => setStackMm(event.target.value)}
            />
            <Input
              label="Reach (mm)"
              tooltip="Horizontal distance from BB center to top of head tube (mm). Found on the manufacturer geometry chart; determines cockpit length baseline."
              type="number"
              value={reachMm}
              onChange={(event) => setReachMm(event.target.value)}
            />
            <Input
              label="Seat Tube Angle (deg)"
              tooltip="Angle of the seat tube (degrees). Use the manufacturer spec. Affects how far forward/back your saddle sits for the same saddle height."
              type="number"
              step="0.1"
              value={seatTubeAngle}
              onChange={(event) => setSeatTubeAngle(event.target.value)}
            />
            <Input
              label="Head Tube Angle (deg)"
              tooltip="Angle of the head tube (degrees). Use the manufacturer spec. Influences steering stability and trail."
              type="number"
              step="0.1"
              value={headTubeAngle}
              onChange={(event) => setHeadTubeAngle(event.target.value)}
            />
            <Input
              label="Frame Size"
              tooltip="Enter the size label used by the brand (e.g., 54, 56, M, L). If unsure, use stack/reach instead for best accuracy."
              value={frameSize}
              onChange={(event) => setFrameSize(event.target.value)}
              placeholder="e.g. 54"
            />
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Current Setup (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Saddle Height (mm)"
              tooltip="Measure from BB center to top of saddle along the seat tube line (mm). Use for comparing current vs. recommended fit."
              type="number"
              value={saddleHeightMm}
              onChange={(event) => setSaddleHeightMm(event.target.value)}
            />
            <Input
              label="Saddle Setback (mm)"
              tooltip="Measure horizontal distance from BB center to saddle nose (mm). Positive values mean the saddle nose is behind the BB."
              type="number"
              value={saddleSetbackMm}
              onChange={(event) => setSaddleSetbackMm(event.target.value)}
            />
            <Input
              label="Stem Length (mm)"
              tooltip="Length printed on the stem (mm), center-to-center. Used to compare your current cockpit with recommendations."
              type="number"
              value={stemLengthMm}
              onChange={(event) => setStemLengthMm(event.target.value)}
            />
            <Input
              label="Stem Angle (deg)"
              tooltip="Angle printed on the stem (degrees). Affects handlebar height; note that flipping the stem changes the sign."
              type="number"
              step="0.1"
              value={stemAngle}
              onChange={(event) => setStemAngle(event.target.value)}
            />
            <Input
              label="Handlebar Width (mm)"
              tooltip="Width measured center-to-center at the hoods (mm). Typically matches shoulder width for comfort and control."
              type="number"
              value={handlebarWidthMm}
              onChange={(event) => setHandlebarWidthMm(event.target.value)}
            />
            <Input
              label="Crank Length (mm)"
              tooltip="Length printed on the crank arm (mm). Used to adjust saddle height and hip/knee angles."
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
              Cancel
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
              Delete Bike
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
