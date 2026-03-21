"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { PencilLine } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { getBikeTypeLabel } from "@/lib/bikes";
import { reportClientError } from "@/lib/telemetry";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, useToast } from "@/components/ui";

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
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{bike.name}</CardTitle>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              {[bike.brand, bike.model].filter(Boolean).join(" ") ||
                getBikeTypeLabel(bike.bikeType, messages)}
            </p>
          </div>
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestCalculation ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {messages.pressure.overview.frontPressure}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {latestCalculation.recommendedFrontBar} {messages.pressure.result.bar}
                </p>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {latestCalculation.recommendedFrontPsi} {messages.pressure.result.psi}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {messages.pressure.overview.rearPressure}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {latestCalculation.recommendedRearBar} {messages.pressure.result.bar}
                </p>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {latestCalculation.recommendedRearPsi} {messages.pressure.result.psi}
                </p>
              </div>
            </div>

            <p className="text-sm text-[color:var(--muted-foreground)]">
              {messages.pressure.overview.lastCalculated}:{" "}
              {formatDate(latestCalculation.createdAt, locale)}
            </p>

            {autoNote ? (
              <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--info)_32%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--info)_8%)] px-4 py-3 text-sm text-[color:var(--info-foreground)]">
                {autoNote}
              </div>
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
