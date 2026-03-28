"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { Bike, PencilLine } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { getBikeTypeLabel } from "@/lib/bikes";
import { reportClientError } from "@/lib/telemetry";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Button, Card, CardContent, InfoBox, MeasurementTile, SectionHeader, Textarea, useToast } from "@/components/ui";

interface BikePressureCardProps {
  bike: Doc<"bikes">;
  latestCalculation: Doc<"pressureCalculations"> | null;
  onRecalculate: (bikeId: string) => void;
}

function formatDate(createdAt: number, locale: string) {
  return new Date(createdAt).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAutoNoteLabel(autoNoteSource: string | undefined, template: string) {
  if (!autoNoteSource) {
    return null;
  }

  const match = autoNoteSource.match(/^weight_change_(\d+(?:\.\d+)?)kg$/);
  if (!match) {
    return null;
  }

  return template.replace("{weight}", match[1]);
}

export function BikePressureCard({
  bike,
  latestCalculation,
  onRecalculate,
}: BikePressureCardProps) {
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const updateNotes = useMutation(api.pressureCalculations.mutations.updateNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noteDraft, setNoteDraft] = useState(latestCalculation?.userNotes ?? "");
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    setNoteDraft(latestCalculation?.userNotes ?? "");
    setIsEditing(false);
    setNoteError(null);
  }, [latestCalculation?._id, latestCalculation?.userNotes]);

  const autoNote = useMemo(
    () =>
      getAutoNoteLabel(
        latestCalculation?.autoNoteSource,
        messages.pressure.overview.autoNoteWeightChange
      ),
    [latestCalculation?.autoNoteSource, messages.pressure.overview.autoNoteWeightChange]
  );

  const handleSaveNote = async () => {
    if (!latestCalculation) {
      return;
    }

    setNoteError(null);
    setIsSaving(true);
    try {
      await updateNotes({
        calculationId: latestCalculation._id,
        userNotes: noteDraft.trim() ? noteDraft.trim() : undefined,
      });
      setIsEditing(false);
      toast.success({
        description: messages.common.toasts.pressureNoteSaved,
      });
    } catch (error) {
      const message = reportClientError(error, {
        area: "pressureOverview",
        action: "updateNotes",
        operationType: "mutation",
      });
      setNoteError(message);
      toast.error({
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      variant="bordered"
      className="dashboard-card-surface h-full border-[color:var(--border)] bg-[color:var(--card)]"
    >
      <SectionHeader
        icon={<Bike className="h-4 w-4 text-[color:var(--primary)]" />}
        title={bike.name}
        action={
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onRecalculate(bike._id)}
          >
            {latestCalculation
              ? messages.pressure.overview.recalculate
              : messages.pressure.overview.noCalculationCta}
          </Button>
        }
      />
      <CardContent className="space-y-4">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {[bike.brand, bike.model].filter(Boolean).join(" ") ||
            getBikeTypeLabel(bike.bikeType, messages)}
        </p>
        {latestCalculation ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MeasurementTile
                label={messages.pressure.overview.frontPressure}
                value={`${latestCalculation.recommendedFrontBar} ${messages.pressure.result.bar}`}
              />
              <MeasurementTile
                label={messages.pressure.overview.rearPressure}
                value={`${latestCalculation.recommendedRearBar} ${messages.pressure.result.bar}`}
              />
            </div>

            <p className="text-sm text-[color:var(--muted-foreground)]">
              {messages.pressure.overview.lastCalculated}:{" "}
              {formatDate(latestCalculation.createdAt, locale)}
            </p>

            {autoNote ? (
              <InfoBox variant="primary">{autoNote}</InfoBox>
            ) : null}

            <div className="space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  {messages.pressure.overview.userNotes.label}
                </p>
                {!isEditing ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilLine className="h-4 w-4" />
                    {messages.pressure.overview.userNotes.editButton}
                  </Button>
                ) : null}
              </div>

              {isEditing ? (
                <>
                  <Textarea
                    value={noteDraft}
                    onChange={(event) => {
                      setNoteError(null);
                      setNoteDraft(event.target.value.slice(0, 300));
                    }}
                    placeholder={messages.pressure.overview.userNotes.placeholder}
                    rows={4}
                    helperText={`${messages.pressure.overview.userNotes.helper} ${noteDraft.length}/300`}
                    error={noteError ?? undefined}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNoteDraft(latestCalculation.userNotes ?? "");
                        setNoteError(null);
                        setIsEditing(false);
                      }}
                    >
                      {messages.common.cancel}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveNote}
                      isLoading={isSaving}
                    >
                      {messages.pressure.overview.userNotes.saveButton}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {latestCalculation.userNotes || messages.pressure.overview.userNotes.empty}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] bg-[color:var(--muted)] px-4 py-5 text-sm text-[color:var(--muted-foreground)]">
            {messages.pressure.overview.noCalculation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
