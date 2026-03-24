"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
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
  formatBikeDate,
  formatBikeDistanceKm,
  formatBikeSpeedKph,
  type BikeType,
  type StravaBikeImportCandidate,
  type StravaBikeReadiness,
} from "./stravaBikeImport";

type StravaStatusLike = {
  accessStatus?: "not_connected" | "pending" | "active" | "revoked" | "error";
  athleteName?: string | null;
  athleteAvatarUrl?: string | null;
  lastSyncAt?: number | null;
  syncErrorMessage?: string | null;
};

type StravaBikeOverviewItem = {
  gearId: string;
  name: string;
  brandName?: string | null;
  modelName?: string | null;
  mappedBikeType?: BikeType | null;
  bikeTypeSource?: string | null;
  primary: boolean;
  lifetimeDistanceMeters?: number | null;
  importedBikeId?: string | null;
  needsTypeConfirmation?: boolean;
  syncStatus: "ready" | "imported" | "error";
  readiness: StravaBikeReadiness;
  rideCountWindow?: number | null;
  totalDistanceWindowMeters?: number | null;
  avgRideDistanceWindowMeters?: number | null;
  avgSpeedWindowKph?: number | null;
  lastRideAt?: number | null;
  explanation?: string | null;
};

function normalizeOverviewRows(value: unknown): {
  rows: StravaBikeOverviewItem[];
  parseError: boolean;
} {
  if (value === null) {
    return { rows: [], parseError: false };
  }

  if (!Array.isArray(value)) {
    return { rows: [], parseError: value !== undefined };
  }

  const rows: StravaBikeOverviewItem[] = [];
  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("gearId" in item) ||
      typeof item.gearId !== "string"
    ) {
      return { rows: [], parseError: true };
    }
    rows.push(item as StravaBikeOverviewItem);
  }

  return { rows, parseError: false };
}

export interface StravaBikeImportSectionProps {
  id?: string;
  strava: StravaStatusLike | null | undefined;
}

function bikeTypeLabelOrder(messages: ReturnType<typeof useDashboardMessages>["messages"]) {
  const bikeTypes: BikeType[] = [
    "road",
    "gravel",
    "mountain",
    "hybrid",
    "tt_triathlon",
    "cyclocross",
    "touring",
    "city",
  ];

  return bikeTypes.map((value) => ({
    value,
    label: messages.bikeTypes[value].label,
    description: messages.bikeTypes[value].description,
  }));
}

function readinessLabel(
  messages: ReturnType<typeof useDashboardMessages>["messages"],
  candidate: StravaBikeOverviewItem
) {
  switch (candidate.readiness) {
    case "imported_needs_type_confirmation":
      return messages.settings.integrations.bikeImport.typeConfirmationNeeded;
    case "imported_needs_fit_setup":
      return messages.settings.integrations.bikeImport.needsFitSetup;
    case "fit_ready":
      return messages.settings.integrations.bikeImport.fitReady;
    default:
      return messages.settings.integrations.bikeImport.availableInStrava;
  }
}

function syncStatusLabel(
  messages: ReturnType<typeof useDashboardMessages>["messages"],
  candidate: StravaBikeOverviewItem
) {
  switch (candidate.syncStatus) {
    case "imported":
      return messages.settings.integrations.bikeImport.syncImported;
    case "error":
      return messages.settings.integrations.bikeImport.syncError;
    default:
      return messages.settings.integrations.bikeImport.syncReady;
  }
}

function readinessTone(candidate: StravaBikeOverviewItem) {
  if (candidate.syncStatus === "error") {
    return "warning";
  }

  switch (candidate.readiness) {
    case "imported_needs_type_confirmation":
      return "warning";
    case "imported_needs_fit_setup":
      return "attention";
    case "fit_ready":
      return "success";
    default:
      return "neutral";
  }
}

function StatusPill({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warning" | "attention";
  children: ReactNode;
}) {
  const toneClassMap = {
    neutral:
      "border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]",
    success:
      "border-[color:color-mix(in_oklch,var(--success)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)] text-[color:var(--success)]",
    warning:
      "border-[color:color-mix(in_oklch,var(--warning)_35%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] text-[color:var(--warning)]",
    attention:
      "border-[color:color-mix(in_oklch,var(--primary)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)] text-[color:var(--foreground)]",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneClassMap[tone]}`}
    >
      {children}
    </span>
  );
}

function MetricTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/70 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{value}</p>
      {note ? (
        <p className="mt-1 text-xs leading-5 text-[color:var(--muted-foreground)]">{note}</p>
      ) : null}
    </div>
  );
}

function RowSummary({
  candidate,
  locale,
  messages,
  selected,
  onToggle,
}: {
  candidate: StravaBikeOverviewItem;
  locale: string;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  selected: boolean;
  onToggle: () => void;
}) {
  const description =
    [candidate.brandName, candidate.modelName].filter(Boolean).join(" · ") ||
    messages.settings.integrations.bikeImport.noBrandModel;

  const usageNote = candidate.explanation ?? messages.settings.integrations.bikeImport.noUsageData;
  const lastRideValue =
    candidate.lastRideAt !== undefined && candidate.lastRideAt !== null
      ? formatBikeDate(candidate.lastRideAt, locale)
      : messages.settings.integrations.bikeImport.noRecentRides;

  return (
    <Selectable
      mode="button"
      variant="card"
      selected={selected}
      disabled={Boolean(candidate.importedBikeId)}
      onClick={candidate.importedBikeId ? undefined : onToggle}
      label={candidate.name}
      description={description}
      badge={
        <div className="flex flex-wrap items-center gap-2">
          {candidate.primary ? (
            <StatusPill tone="neutral">
              {messages.settings.integrations.bikeImport.primary}
            </StatusPill>
          ) : null}
          {candidate.mappedBikeType ? (
            <StatusPill tone="neutral">
              {messages.bikeTypes[candidate.mappedBikeType].label}
            </StatusPill>
          ) : null}
          <StatusPill tone={readinessTone(candidate)}>
            {syncStatusLabel(messages, candidate)}
          </StatusPill>
          <StatusPill tone={readinessTone(candidate)}>
            {readinessLabel(messages, candidate)}
          </StatusPill>
          {candidate.importedBikeId ? (
            <StatusPill tone="success">
              {messages.settings.integrations.bikeImport.alreadyAdded}
            </StatusPill>
          ) : null}
        </div>
      }
    >
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label={messages.settings.integrations.bikeImport.lifetimeDistanceLabel}
          value={formatBikeDistanceKm(candidate.lifetimeDistanceMeters ?? undefined, locale)}
        />
        <MetricTile
          label={messages.settings.integrations.bikeImport.recentDistanceLabel}
          value={formatBikeDistanceKm(candidate.totalDistanceWindowMeters ?? undefined, locale)}
          note={messages.settings.integrations.bikeImport.recentDistanceNote}
        />
        <MetricTile
          label={messages.settings.integrations.bikeImport.recentRideCountLabel}
          value={
            candidate.rideCountWindow !== undefined && candidate.rideCountWindow !== null
              ? new Intl.NumberFormat(locale).format(candidate.rideCountWindow)
              : "—"
          }
        />
        <MetricTile
          label={messages.settings.integrations.bikeImport.averageRideDistanceLabel}
          value={formatBikeDistanceKm(candidate.avgRideDistanceWindowMeters ?? undefined, locale)}
        />
        <MetricTile
          label={messages.settings.integrations.bikeImport.averageSpeedLabel}
          value={formatBikeSpeedKph(candidate.avgSpeedWindowKph ?? undefined, locale)}
        />
        <MetricTile
          label={messages.settings.integrations.bikeImport.lastRideLabel}
          value={lastRideValue}
        />
        <MetricTile
          label={messages.settings.integrations.bikeImport.importStateLabel}
          value={readinessLabel(messages, candidate)}
          note={usageNote}
        />
      </div>
    </Selectable>
  );
}

export function StravaBikeImportSection({
  id,
  strava,
}: StravaBikeImportSectionProps) {
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const bikeOverviewRaw = useQuery(api.integrations.queries.getStravaBikeOverview) as unknown;
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

  const overviewState = useMemo(
    () => normalizeOverviewRows(bikeOverviewRaw),
    [bikeOverviewRaw]
  );
  const overview = overviewState.rows;
  const importableCandidates = useMemo(
    () => overview.filter((candidate) => !candidate.importedBikeId),
    [overview]
  );
  const selectedCandidates = useMemo(
    () => overview.filter((candidate) => selectedIds.has(candidate.gearId) && !candidate.importedBikeId),
    [overview, selectedIds]
  );
  const selectionSignature = useMemo(
    () => importableCandidates.map((candidate) => candidate.gearId).join("|"),
    [importableCandidates]
  );
  const currentCorrection = pendingCorrections[correctionIndex] ?? null;
  const bikeTypeOptions = useMemo(() => bikeTypeLabelOrder(messages), [messages]);
  const summaryCounts = useMemo(() => {
    const imported = overview.filter((candidate) => Boolean(candidate.importedBikeId)).length;
    const ready = overview.filter((candidate) => candidate.readiness === "fit_ready").length;
    const attention = overview.filter(
      (candidate) =>
        Boolean(candidate.importedBikeId) && candidate.readiness !== "fit_ready"
    ).length;
    return { imported, ready, attention };
  }, [overview]);

  useEffect(() => {
    setSelectedIds(new Set(importableCandidates.map((candidate) => candidate.gearId)));
  }, [selectionSignature]);

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
    clearSelectionForImportedCandidates(selectedCandidates.map((candidate) => ({
      id: candidate.gearId,
      name: candidate.name,
      brand: candidate.brandName ?? undefined,
      model: candidate.modelName ?? undefined,
    })));
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
      const result = await importBikes({
        gearIds: selectedCandidates.map((candidate) => candidate.gearId),
      });
      const processedCount = result.imported + result.updated;
      setImportedCount(processedCount);

      if (result.failed.length > 0) {
        toast.error({
          description:
            result.failed.length === 1
              ? formatMessage(messages.settings.integrations.bikeImport.partialFailureOne, {
                  count: result.failed.length,
                  bikes: result.failed.map((entry) => entry.gearId).join(", "),
                })
              : formatMessage(messages.settings.integrations.bikeImport.partialFailureMany, {
                  count: result.failed.length,
                  bikes: result.failed.map((entry) => entry.gearId).join(", "),
                }),
        });
      }

      if (result.unresolved.length > 0) {
        setPendingCorrections(
          result.unresolved.map((candidate) => {
            const selectedCandidate = selectedCandidates.find((entry) => entry.gearId === candidate.gearId);
            return {
              id: candidate.gearId,
              name: candidate.name,
              brand: selectedCandidate?.brandName ?? undefined,
              model: selectedCandidate?.modelName ?? undefined,
              bikeType: selectedCandidate?.mappedBikeType ?? undefined,
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

  if (bikeOverviewRaw === undefined) {
    return (
      <div className="mt-4">
        <LoadingState label={messages.settings.integrations.bikeImport.loading} />
      </div>
    );
  }

  if (overviewState.parseError) {
    return (
      <div className="mt-4">
        <ErrorState
          title={messages.settings.integrations.bikeImport.blockedTitle}
          description={messages.settings.integrations.bikeImport.parseError}
        />
      </div>
    );
  }

  if (overview.length === 0) {
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
    <div id={id} className="mt-4 space-y-4">
      {strava?.syncErrorMessage ? (
        <ErrorState
          title={messages.settings.integrations.bikeImport.syncWarningTitle}
          description={strava.syncErrorMessage}
        />
      ) : null}

      <Card variant="bordered" className="dashboard-card-surface">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {messages.settings.integrations.bikeImport.overviewTitle}
              </p>
              <CardDescription className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {messages.settings.integrations.bikeImport.overviewDescription}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="neutral">
                {formatMessage(messages.settings.integrations.bikeImport.summaryBikes, {
                  count: overview.length,
                })}
              </StatusPill>
              <StatusPill tone="success">
                {formatMessage(messages.settings.integrations.bikeImport.summaryImported, {
                  count: summaryCounts.imported,
                })}
              </StatusPill>
              <StatusPill tone="warning">
                {formatMessage(messages.settings.integrations.bikeImport.summaryAttention, {
                  count: summaryCounts.attention,
                })}
              </StatusPill>
              <StatusPill tone="attention">
                {formatMessage(messages.settings.integrations.bikeImport.summaryReady, {
                  count: summaryCounts.ready,
                })}
              </StatusPill>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label={messages.settings.integrations.bikeImport.overviewBikesLabel}
              value={formatMessage(messages.settings.integrations.bikeImport.summaryBikes, {
                count: overview.length,
              })}
              note={messages.settings.integrations.bikeImport.overviewCountNote}
            />
            <MetricTile
              label={messages.settings.integrations.bikeImport.overviewImportedLabel}
              value={formatMessage(messages.settings.integrations.bikeImport.summaryImported, {
                count: summaryCounts.imported,
              })}
              note={messages.settings.integrations.bikeImport.overviewImportedNote}
            />
            <MetricTile
              label={messages.settings.integrations.bikeImport.overviewReadyLabel}
              value={formatMessage(messages.settings.integrations.bikeImport.summaryReady, {
                count: summaryCounts.ready,
              })}
              note={messages.settings.integrations.bikeImport.overviewReadyNote}
            />
            <MetricTile
              label={messages.settings.integrations.bikeImport.overviewAttentionLabel}
              value={formatMessage(messages.settings.integrations.bikeImport.summaryAttention, {
                count: summaryCounts.attention,
              })}
              note={messages.settings.integrations.bikeImport.overviewAttentionNote}
            />
          </div>

          <div className="space-y-3">
            {overview.map((candidate) => (
              <RowSummary
                key={candidate.gearId}
                candidate={candidate}
                locale={locale}
                messages={messages}
                selected={selectedIds.has(candidate.gearId) && !candidate.importedBikeId}
                onToggle={() => {
                  setSelectedIds((current) => {
                    const next = new Set(current);
                    if (next.has(candidate.gearId)) {
                      next.delete(candidate.gearId);
                    } else {
                      next.add(candidate.gearId);
                    }
                    return next;
                  });
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
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
                setSelectedIds(new Set(importableCandidates.map((candidate) => candidate.gearId)));
              }}
            >
              {messages.settings.integrations.bikeImport.resetSelection}
            </Button>
          </div>

          <p className="text-sm text-[color:var(--muted-foreground)]">
            {messages.settings.integrations.bikeImport.postImportHint}
          </p>
        </CardContent>
      </Card>

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
              <Button onClick={() => void handleConfirmType()} isLoading={isSavingCorrection}>
                {messages.settings.integrations.bikeImport.typeWizardSave}
              </Button>
            </div>
          </div>
        ) : null}
      </AccessibleDialog>
    </div>
  );
}
