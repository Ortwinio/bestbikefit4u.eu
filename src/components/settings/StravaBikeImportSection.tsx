"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  AccessibleDialog,
  Button,
  CardDescription,
  EmptyState,
  ErrorState,
  LoadingState,
  RadioGroup,
  Selectable,
  useToast,
} from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { formatMessage } from "@/i18n/dashboardMessages";
import { reportClientError } from "@/lib/telemetry";
import {
  formatImportedBikeDistance,
  getAlreadyImportedCandidateIds,
  type BikeType,
  type StravaBikeImportCandidate,
} from "./stravaBikeImport";

const bikeTypeOrder: BikeType[] = [
  "road",
  "gravel",
  "mountain",
  "hybrid",
  "tt_triathlon",
  "cyclocross",
  "touring",
  "city",
];

type LocalBikeSnapshot = {
  _id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  stravaGearId?: string;
  bikeType?: BikeType;
  needsTypeConfirmation?: boolean;
};

type StravaStatusLike = {
  accessStatus?: "not_connected" | "pending" | "active" | "revoked" | "error";
  athleteName?: string | null;
  athleteAvatarUrl?: string | null;
  lastSyncAt?: number | null;
  syncErrorMessage?: string | null;
};

export interface StravaBikeImportSectionProps {
  strava: StravaStatusLike | null | undefined;
  userBikes: LocalBikeSnapshot[] | undefined;
}

function bikeTypeLabelOrder(messages: ReturnType<typeof useDashboardMessages>["messages"]) {
  return bikeTypeOrder.map((value) => ({
    value,
    label: messages.bikeTypes[value].label,
    description: messages.bikeTypes[value].description,
  }));
}

export function StravaBikeImportSection({
  strava,
  userBikes,
}: StravaBikeImportSectionProps) {
  const { messages } = useDashboardMessages();
  const toast = useToast();
  const gearSummary = useQuery(api.integrations.queries.getStravaGearSummary);
  const importBikes = useAction(api.integrations.actions.importBikesFromStrava);
  const syncStravaActivities = useAction(api.integrations.actions.syncStravaActivities);
  const updateBike = useMutation(api.bikes.mutations.update);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [pendingCorrections, setPendingCorrections] = useState<StravaBikeImportCandidate[]>([]);
  const [correctionIndex, setCorrectionIndex] = useState(0);
  const [selectedBikeType, setSelectedBikeType] = useState<BikeType>("road");
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const initializedForPayloadRef = useRef<string | null>(null);

  const candidates = useMemo(
    () =>
      (gearSummary ?? []).map((gear) => {
        const matchedBike = userBikes?.find((bike) => bike.stravaGearId === gear.id);
        return {
          id: gear.id,
          name: gear.name,
          brand: matchedBike?.brand ?? undefined,
          model: matchedBike?.model ?? undefined,
          distanceMeters: gear.distanceMeters,
          primary: gear.primary,
          bikeType: matchedBike?.bikeType,
          ambiguous: matchedBike?.needsTypeConfirmation ?? false,
          matchedBikeId: matchedBike?._id,
        } satisfies StravaBikeImportCandidate;
      }),
    [gearSummary, userBikes]
  );
  const candidateKey = useMemo(() => candidates.map((candidate) => candidate.id).join("|"), [candidates]);

  const importedCandidateIds = useMemo(
    () => getAlreadyImportedCandidateIds(candidates, userBikes ?? []),
    [candidates, userBikes]
  );

  const activeCandidates = useMemo(
    () => candidates.filter((candidate) => !importedCandidateIds.has(candidate.id)),
    [candidates, importedCandidateIds]
  );

  useEffect(() => {
    if (!candidateKey) {
      initializedForPayloadRef.current = null;
      setSelectedIds(new Set());
      return;
    }

    if (initializedForPayloadRef.current === candidateKey) {
      return;
    }

    initializedForPayloadRef.current = candidateKey;
    setSelectedIds(new Set(activeCandidates.map((candidate) => candidate.id)));
  }, [activeCandidates, candidateKey]);

  const selectedCandidates = useMemo(
    () => activeCandidates.filter((candidate) => selectedIds.has(candidate.id)),
    [activeCandidates, selectedIds]
  );

  const currentCorrection = pendingCorrections[correctionIndex] ?? null;
  const bikeTypeOptions = useMemo(() => bikeTypeLabelOrder(messages), [messages]);

  const closeCorrectionDialog = () => {
    setPendingCorrections([]);
    setCorrectionIndex(0);
    setIsSavingCorrection(false);
    setImportedCount(0);
  };

  const clearSelectionForImportedCandidates = (
    importedCandidates: StravaBikeImportCandidate[]
  ) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const candidate of importedCandidates) {
        next.delete(candidate.id);
      }
      return next;
    });
  };

  const finalizeImport = (count: number) => {
    if (count > 0) {
      toast.success({
        description:
          count === 1
            ? formatMessage(messages.settings.integrations.bikeImport.successOne, { count })
            : formatMessage(messages.settings.integrations.bikeImport.successMany, { count }),
      });
    }
    setPendingCorrections([]);
    setCorrectionIndex(0);
    setImportedCount(0);
    setIsSavingCorrection(false);
    clearSelectionForImportedCandidates(selectedCandidates);
  };

  const handleImport = async () => {
    if (selectedCandidates.length === 0) {
      toast.info({
        description: messages.settings.integrations.bikeImport.emptySelection,
      });
      return;
    }

    setIsImporting(true);
    setImportedCount(0);

    try {
      const result = await importBikes({ gearIds: selectedCandidates.map((candidate) => candidate.id) });
      const processedCount = result.imported + result.updated;
      setImportedCount(processedCount);

      if (result.unresolved.length > 0) {
        setPendingCorrections(
          result.unresolved.map((candidate) => {
            const selectedCandidate = selectedCandidates.find((entry) => entry.id === candidate.gearId);
            return {
              id: candidate.gearId,
              name: candidate.name,
              brand: selectedCandidate?.brand,
              model: selectedCandidate?.model,
              bikeType: selectedCandidate?.bikeType,
              ambiguous: true,
              matchedBikeId: String(candidate.bikeId),
            };
          })
        );
        setCorrectionIndex(0);
        setSelectedBikeType("road");
        return;
      }

      finalizeImport(processedCount);
      void syncStravaActivities({ windowDays: 90 });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "dashboard-settings",
          action: "stravaBikeImport",
          operationType: "mutation",
          userMessage: messages.settings.integrations.bikeImport.failed,
        }),
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmType = async () => {
    if (!currentCorrection) {
      return;
    }

    setIsSavingCorrection(true);

    try {
      if (!currentCorrection.matchedBikeId) {
        throw new Error("Imported bike is missing a local bike id");
      }

      await updateBike({
        bikeId: currentCorrection.matchedBikeId as never,
        bikeType: selectedBikeType,
        bikeTypeSource: "user",
        needsTypeConfirmation: false,
      });

      const nextCount = importedCount + 1;
      const nextIndex = correctionIndex + 1;

      setImportedCount(nextCount);
      clearSelectionForImportedCandidates([currentCorrection]);

      if (nextIndex < pendingCorrections.length) {
        const nextCandidate = pendingCorrections[nextIndex];
        setCorrectionIndex(nextIndex);
        setSelectedBikeType(nextCandidate.bikeType ?? "road");
        setIsSavingCorrection(false);
        return;
      }

      finalizeImport(nextCount);
      void syncStravaActivities({ windowDays: 90 });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "dashboard-settings",
          action: "stravaBikeTypeConfirm",
          operationType: "mutation",
          userMessage: messages.settings.integrations.bikeImport.failed,
        }),
      });
    } finally {
      setIsSavingCorrection(false);
    }
  };

  if (strava?.accessStatus !== "active") {
    return null;
  }

  if (strava?.syncErrorMessage) {
    return (
      <div className="mt-4">
        <ErrorState
          title={messages.settings.integrations.bikeImport.blockedTitle}
          description={strava.syncErrorMessage}
        />
      </div>
    );
  }

  if (userBikes === undefined || gearSummary === undefined) {
    return (
      <div className="mt-4">
        <LoadingState label={messages.settings.integrations.bikeImport.loading} />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          title={messages.settings.integrations.bikeImport.emptyTitle}
          description={messages.settings.integrations.bikeImport.emptyDescription}
          action={
            <Button variant="outline" disabled>
              {messages.settings.integrations.bikeImport.importButton}
            </Button>
          }
        />
        <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
          {messages.settings.integrations.bikeImport.backendBlocked}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {messages.settings.integrations.bikeImport.title}
          </p>
          <CardDescription className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {messages.settings.integrations.bikeImport.description}
          </CardDescription>
        </div>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--muted-foreground)]">
          {formatMessage(messages.settings.integrations.bikeImport.selectionSummary, {
            count: selectedCandidates.length,
          })}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {activeCandidates.map((candidate) => {
          const isImported = importedCandidateIds.has(candidate.id);
          const isSelected = selectedIds.has(candidate.id) || isImported;
          const distance = formatImportedBikeDistance(candidate.distanceMeters);
          const metaParts = [candidate.brand, candidate.model, distance].filter(Boolean);

          return (
            <Selectable
              key={candidate.id}
              mode="button"
              variant="card"
              selected={isSelected}
              disabled={isImported}
              onClick={() => {
                if (isImported) {
                  return;
                }
                setSelectedIds((current) => {
                  const next = new Set(current);
                  if (next.has(candidate.id)) {
                    next.delete(candidate.id);
                  } else {
                    next.add(candidate.id);
                  }
                  return next;
                });
              }}
              label={candidate.name}
              description={metaParts.join(" · ")}
              badge={
                <div className="flex flex-wrap items-center gap-2">
                  {candidate.primary ? (
                    <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      {messages.settings.integrations.bikeImport.primary}
                    </span>
                  ) : null}
                  {isImported ? (
                    <span className="rounded-full border border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--success)]">
                      {messages.settings.integrations.bikeImport.alreadyAdded}
                    </span>
                  ) : null}
                  {candidate.ambiguous ? (
                    <span className="rounded-full border border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--warning)]">
                      {messages.settings.integrations.bikeImport.typeConfirmationNeeded}
                    </span>
                  ) : null}
                </div>
              }
            />
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          onClick={() => void handleImport()}
          isLoading={isImporting}
          disabled={selectedCandidates.length === 0}
        >
          {selectedCandidates.length === 1
            ? messages.settings.integrations.bikeImport.importButtonOne
            : formatMessage(messages.settings.integrations.bikeImport.importButtonMany, {
                count: selectedCandidates.length,
              })}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedIds(
              new Set(activeCandidates.filter((candidate) => !importedCandidateIds.has(candidate.id)).map((candidate) => candidate.id))
            );
          }}
        >
          {messages.settings.integrations.bikeImport.resetSelection}
        </Button>
      </div>

      <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
        {messages.settings.integrations.bikeImport.postImportHint}
      </p>

      <AccessibleDialog
        open={currentCorrection !== null}
        onClose={() => closeCorrectionDialog()}
        title={messages.settings.integrations.bikeImport.typeWizardTitle}
        description={
          currentCorrection
            ? formatMessage(messages.settings.integrations.bikeImport.typeWizardDescription, {
                name: currentCorrection.name,
              })
            : undefined
        }
      >
        {currentCorrection ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {currentCorrection.name}
              </p>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {currentCorrection.brand || currentCorrection.model
                  ? [currentCorrection.brand, currentCorrection.model].filter(Boolean).join(" · ")
                  : messages.settings.integrations.bikeImport.typeWizardFallback}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground)]">
                {messages.settings.integrations.bikeImport.typeWizardPrompt}
              </p>
              <RadioGroup
                value={selectedBikeType}
                onValueChange={(value) => setSelectedBikeType(value as BikeType)}
                className="grid gap-2"
              >
                {bikeTypeOptions.map((option) => (
                  <Selectable
                    key={option.value}
                    mode="radio"
                    variant="segment"
                    value={option.value}
                    label={option.label}
                    description={option.description}
                  />
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => closeCorrectionDialog()}>
                {messages.settings.integrations.bikeImport.typeWizardCancel}
              </Button>
              <Button
                onClick={() => void handleConfirmType()}
                isLoading={isSavingCorrection}
              >
                {messages.settings.integrations.bikeImport.typeWizardSave}
              </Button>
            </div>
          </div>
        ) : null}
      </AccessibleDialog>
    </div>
  );
}
