"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  Selectable,
  Textarea,
  useToast,
} from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { formatMessage } from "@/i18n/dashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { getBikeTypeOptions } from "@/lib/bikes";
import { getErrorMessage, reportClientError } from "@/lib/telemetry";
import { api } from "../../../../convex/_generated/api";
import {
  buildDraftFromPreview,
  getAdvertFindings,
  getPhotoReview,
  isSupportedMarktplaatsUrl,
  normalizeCreatedBikeId,
  normalizeMarktplaatsPreview,
  togglePhotoSelection,
  type ImportConfidence,
  type MarktplaatsDraft,
  type MarktplaatsImportPreview,
} from "./marktplaatsImport";

type PreviewState = "idle" | "loading" | "ready" | "error";
type SaveState = "idle" | "saving";

function confidenceTone(confidence: ImportConfidence) {
  switch (confidence) {
    case "high":
      return "border-[color:color-mix(in_oklch,var(--success)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)] text-[color:var(--success)]";
    case "medium":
      return "border-[color:color-mix(in_oklch,var(--primary)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)] text-[color:var(--foreground)]";
    case "low":
      return "border-[color:color-mix(in_oklch,var(--warning)_35%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] text-[color:var(--warning)]";
    default:
      return "border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]";
  }
}

function translateWarning(
  warning: string,
  warningMessages: Record<string, string>
) {
  return warningMessages[warning] ?? warning;
}

type MarktplaatsImportMessages =
  ReturnType<typeof useDashboardMessages>["messages"]["bikeForm"]["marktplaatsImport"];

export function MarktplaatsAdvertFindingsPreview({
  t,
  findings,
}: {
  t: MarktplaatsImportMessages;
  findings: ReturnType<typeof getAdvertFindings>;
}) {
  if (findings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t.findingsTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.findingsDescription}</p>
        </div>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
          {formatMessage(t.findingsCount, { count: findings.length })}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {findings.map((finding) => (
          <div
            key={finding.key}
            className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {t.findingLabels[finding.key]}
              </p>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(finding.confidence)}`}
              >
                {formatMessage(t.confidenceBadge, { level: finding.confidence })}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground">{finding.value}</p>
            {finding.note ? (
              <p className="mt-2 text-xs text-muted-foreground">{finding.note}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarktplaatsPhotoVerificationPreview({
  t,
  preview,
  draft,
  photoReview,
  translatedPhotoWarnings,
  setDraft,
}: {
  t: MarktplaatsImportMessages;
  preview: MarktplaatsImportPreview;
  draft: MarktplaatsDraft;
  photoReview: ReturnType<typeof getPhotoReview>;
  translatedPhotoWarnings: string[];
  setDraft: Dispatch<SetStateAction<MarktplaatsDraft | null>>;
}) {
  return (
    <>
      {translatedPhotoWarnings.length > 0 ? (
        <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_35%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)] px-4 py-3 text-sm text-[color:var(--foreground)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">{t.photoVerificationTitle}</p>
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
              {formatMessage(t.photoCountSummary, {
                selected: photoReview.selectedCount,
                total: photoReview.totalCount,
              })}
            </span>
          </div>
          <ul className="mt-2 list-disc pl-5">
            {translatedPhotoWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!photoReview.hasPhotos ? (
        <EmptyState
          title={t.photosEmptyTitle}
          description={t.photosEmptyDescription}
          className="border-0 p-0 shadow-none"
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoReview.activePhotoUrl}
              alt={preview.photos.find((photo) => photo.url === photoReview.activePhotoUrl)?.alt ?? ""}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{t.primaryPhotoTitle}</p>
                <p className="text-xs text-muted-foreground">{t.primaryPhotoDescription}</p>
              </div>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {formatMessage(t.photoCountSummary, {
                  selected: photoReview.selectedCount,
                  total: photoReview.totalCount,
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {preview.photos.map((photo) => {
              const selected = draft.selectedImageUrls.includes(photo.url);
              const active = photo.url === photoReview.activePhotoUrl;

              return (
                <button
                  key={photo.url}
                  type="button"
                  onClick={() =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            primaryImageUrl: photo.url,
                          }
                        : current
                    )
                  }
                  className={`min-w-[7rem] overflow-hidden rounded-[var(--radius-md)] border text-left transition ${
                    active
                      ? "border-[color:var(--primary)] ring-2 ring-[color:color-mix(in_oklch,var(--primary)_20%,transparent)]"
                      : "border-[color:var(--border)]"
                  } ${selected ? "bg-[color:var(--background)]" : "bg-[color:var(--secondary)] opacity-80"}`}
                  aria-pressed={active}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.alt ?? ""}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="space-y-1 px-2 py-2">
                    <p className="text-xs font-semibold text-foreground">
                      {active ? t.photoActiveBadge : t.photoPreviewBadge}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selected ? t.photoSelected : t.photoDeselected}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {preview.photos.map((photo) => {
              const selected = draft.selectedImageUrls.includes(photo.url);
              return (
                <Selectable
                  key={photo.url}
                  mode="button"
                  variant="card"
                  selected={selected}
                  onClick={() => {
                    const nextSelected = togglePhotoSelection(draft.selectedImageUrls, photo.url);
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            selectedImageUrls: nextSelected,
                            primaryImageUrl: nextSelected.includes(current.primaryImageUrl ?? "")
                              ? current.primaryImageUrl
                              : nextSelected[0],
                          }
                        : current
                    );
                  }}
                  label={photo.alt ?? t.photoFallbackLabel}
                  description={selected ? t.photoSelected : t.photoDeselected}
                  badge={
                    <span className="text-xs font-medium text-muted-foreground">
                      {selected ? t.photoBadgeSelected : t.photoBadgeOptional}
                    </span>
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.alt ?? ""}
                    className="mt-4 aspect-video w-full rounded-[var(--radius-md)] object-cover"
                  />
                </Selectable>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export function MarktplaatsBikeImportFlow() {
  const router = useRouter();
  const toast = useToast();
  const { locale, messages } = useDashboardMessages();
  const previewImport = useAction(api.marktplaats.actions.previewBikeImport);
  const saveConfirmedImport = useAction(api.bikeImports.actions.saveConfirmedImport);
  const bikeTypes = getBikeTypeOptions(messages);

  const [url, setUrl] = useState("");
  const [previewState, setPreviewState] = useState<PreviewState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<MarktplaatsImportPreview | null>(null);
  const [draft, setDraft] = useState<MarktplaatsDraft | null>(null);

  const t = messages.bikeForm.marktplaatsImport;
  const canSubmitPreview = url.trim().length > 0 && previewState !== "loading";
  const canSave =
    draft !== null &&
    draft.name.trim().length > 0 &&
    saveState !== "saving";
  const findings = preview ? getAdvertFindings(preview) : [];
  const photoReview = preview && draft ? getPhotoReview(preview, draft) : null;
  const translatedPreviewWarnings = preview
    ? preview.warnings.map((warning) => translateWarning(warning, t.warningMessages))
    : [];
  const translatedPhotoWarnings = photoReview
    ? photoReview.warnings.map((warning) => translateWarning(warning, t.warningMessages))
    : [];

  async function handlePreviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupportedMarktplaatsUrl(url)) {
      setPreviewState("error");
      setErrorMessage(t.errors.unsupportedUrl);
      return;
    }

    setPreviewState("loading");
    setErrorMessage(null);

    try {
      const payload = await previewImport({ sourceUrl: url.trim() });
      const normalized = normalizeMarktplaatsPreview(payload, url.trim());
      if (!normalized) {
        throw new Error("preview_parse_failed");
      }

      setPreview(normalized);
      setDraft(buildDraftFromPreview(normalized));
      setPreviewState("ready");
    } catch (error) {
      setPreviewState("error");
      const safeMessage = reportClientError(error, {
        area: "bikes",
        action: "marktplaatsPreview",
        operationType: "action",
        userMessage: t.errors.previewFailed,
      });
      const rawMessage = getErrorMessage(error, safeMessage);
      setErrorMessage(
        rawMessage === "backend_unavailable" ? t.errors.backendUnavailable : rawMessage
      );
    }
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    setSaveState("saving");
    setErrorMessage(null);

    try {
      const payload = await saveConfirmedImport({
        saveRequest: {
          importId: draft.importId as Id<"bikeImports">,
          name: draft.name,
          brand: draft.brand || undefined,
          model: draft.model || undefined,
          bikeType: draft.bikeType,
          description: draft.description || undefined,
          selectedImageUrls: draft.selectedImageUrls,
          primaryImageUrl: draft.primaryImageUrl,
        },
      });
      const bikeId = normalizeCreatedBikeId(payload);
      if (!bikeId) {
        throw new Error("missing_bike_id");
      }

      toast.success({ description: t.success });
      router.push(withLocalePrefix(`/bikes/${bikeId}`, locale));
    } catch (error) {
      const safeMessage = reportClientError(error, {
        area: "bikes",
        action: "marktplaatsSave",
        operationType: "action",
        userMessage: t.errors.saveFailed,
      });
      const rawMessage = getErrorMessage(error, safeMessage);
      setErrorMessage(
        rawMessage === "backend_unavailable" ? t.errors.backendUnavailable : rawMessage
      );
    } finally {
      setSaveState("idle");
    }
  }

  function updateDraft<K extends keyof MarktplaatsDraft>(key: K, value: MarktplaatsDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
      </div>

      <Card variant="bordered" className="dashboard-card-surface">
        <CardContent className="space-y-6 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t.entryTitle}</h2>
            <CardDescription className="mt-2">{t.entryDescription}</CardDescription>
          </div>

          <form className="space-y-4" onSubmit={handlePreviewSubmit}>
            <Input
              label={t.fields.url.label}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.fields.url.placeholder}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={!canSubmitPreview}>
                {previewState === "loading" ? t.actions.previewLoading : t.actions.preview}
              </Button>
              <Button
                type="button"
                variant="outline"
                render={<Link href={withLocalePrefix("/bikes", locale)} />}
              >
                {t.actions.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {previewState === "loading" ? <LoadingState label={t.loading.preview} /> : null}

      {previewState === "error" && errorMessage ? (
        <ErrorState title={t.errors.title} description={errorMessage} />
      ) : null}

      {previewState === "ready" && preview && draft ? (
        <>
          <Card variant="bordered" className="dashboard-card-surface">
            <CardContent className="space-y-5 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.previewTitle}</h2>
                  <CardDescription className="mt-2">{t.previewDescription}</CardDescription>
                </div>
                <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {preview.advertTitle}
                </span>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
                {t.nameHint}
              </div>

              {findings.length > 0 ? (
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {t.findingsTitle}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t.findingsDescription}
                      </p>
                    </div>
                    <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      {formatMessage(t.findingsCount, { count: findings.length })}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {findings.map((finding) => (
                      <div
                        key={finding.key}
                        className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                            {t.findingLabels[finding.key]}
                          </p>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(finding.confidence)}`}
                          >
                            {formatMessage(t.confidenceBadge, { level: finding.confidence })}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-foreground">
                          {finding.value}
                        </p>
                        {finding.note ? (
                          <p className="mt-2 text-xs text-muted-foreground">{finding.note}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {translatedPreviewWarnings.length > 0 ? (
                <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_35%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] px-4 py-3 text-sm text-[color:var(--foreground)]">
                  <p className="font-semibold">{t.warningsTitle}</p>
                  <ul className="mt-2 list-disc pl-5">
                    {translatedPreviewWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    label={t.fields.name.label}
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder={t.fields.name.placeholder}
                  />
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(preview.fields.name.confidence)}`}>
                    {formatMessage(t.confidenceBadge, { level: preview.fields.name.confidence })}
                  </span>
                </div>

                <div className="space-y-2">
                  <Input
                    label={t.fields.brand.label}
                    value={draft.brand}
                    onChange={(event) => updateDraft("brand", event.target.value)}
                    placeholder={t.fields.brand.placeholder}
                  />
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(preview.fields.brand.confidence)}`}>
                    {formatMessage(t.confidenceBadge, { level: preview.fields.brand.confidence })}
                  </span>
                </div>

                <div className="space-y-2">
                  <Input
                    label={t.fields.model.label}
                    value={draft.model}
                    onChange={(event) => updateDraft("model", event.target.value)}
                    placeholder={t.fields.model.placeholder}
                  />
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(preview.fields.model.confidence)}`}>
                    {formatMessage(t.confidenceBadge, { level: preview.fields.model.confidence })}
                  </span>
                </div>

                <div className="space-y-2">
                  <Select
                    label={t.fields.bikeType.label}
                    value={draft.bikeType}
                    onChange={(event) => updateDraft("bikeType", event.target.value as MarktplaatsDraft["bikeType"])}
                    options={bikeTypes.map((option) => ({ value: option.value, label: option.label }))}
                  />
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(preview.fields.bikeType.confidence)}`}>
                    {formatMessage(t.confidenceBadge, { level: preview.fields.bikeType.confidence })}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    label={t.fields.description.label}
                    value={draft.description}
                    onChange={(event) => updateDraft("description", event.target.value)}
                    placeholder={t.fields.description.placeholder}
                    rows={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" className="dashboard-card-surface">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t.photosTitle}</h2>
                <CardDescription className="mt-2">{t.photosDescription}</CardDescription>
              </div>

              {photoReview && translatedPhotoWarnings.length > 0 ? (
                <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_35%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)] px-4 py-3 text-sm text-[color:var(--foreground)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">{t.photoVerificationTitle}</p>
                    <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      {formatMessage(t.photoCountSummary, {
                        selected: photoReview.selectedCount,
                        total: photoReview.totalCount,
                      })}
                    </span>
                  </div>
                  <ul className="mt-2 list-disc pl-5">
                    {translatedPhotoWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!photoReview?.hasPhotos ? (
                <EmptyState
                  title={t.photosEmptyTitle}
                  description={t.photosEmptyDescription}
                  className="border-0 p-0 shadow-none"
                />
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoReview.activePhotoUrl}
                      alt={preview.photos.find((photo) => photo.url === photoReview.activePhotoUrl)?.alt ?? ""}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.primaryPhotoTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.primaryPhotoDescription}
                        </p>
                      </div>
                      <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                        {formatMessage(t.photoCountSummary, {
                          selected: photoReview.selectedCount,
                          total: photoReview.totalCount,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {preview.photos.map((photo) => {
                      const selected = draft.selectedImageUrls.includes(photo.url);
                      const active = photo.url === photoReview.activePhotoUrl;

                      return (
                        <button
                          key={photo.url}
                          type="button"
                          onClick={() =>
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    primaryImageUrl: photo.url,
                                  }
                                : current
                            )
                          }
                          className={`min-w-[7rem] overflow-hidden rounded-[var(--radius-md)] border text-left transition ${
                            active
                              ? "border-[color:var(--primary)] ring-2 ring-[color:color-mix(in_oklch,var(--primary)_20%,transparent)]"
                              : "border-[color:var(--border)]"
                          } ${selected ? "bg-[color:var(--background)]" : "bg-[color:var(--secondary)] opacity-80"}`}
                          aria-pressed={active}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={photo.alt ?? ""}
                            className="aspect-video w-full object-cover"
                          />
                          <div className="space-y-1 px-2 py-2">
                            <p className="text-xs font-semibold text-foreground">
                              {active ? t.photoActiveBadge : t.photoPreviewBadge}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {selected ? t.photoSelected : t.photoDeselected}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {preview.photos.map((photo) => {
                    const selected = draft.selectedImageUrls.includes(photo.url);
                    return (
                      <Selectable
                        key={photo.url}
                        mode="button"
                        variant="card"
                        selected={selected}
                        onClick={() => {
                          const nextSelected = togglePhotoSelection(
                            draft.selectedImageUrls,
                            photo.url
                          );
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  selectedImageUrls: nextSelected,
                                  primaryImageUrl: nextSelected.includes(current.primaryImageUrl ?? "")
                                    ? current.primaryImageUrl
                                    : nextSelected[0],
                                }
                              : current
                          );
                        }}
                        label={photo.alt ?? t.photoFallbackLabel}
                        description={selected ? t.photoSelected : t.photoDeselected}
                        badge={
                          <span className="text-xs font-medium text-muted-foreground">
                            {selected ? t.photoBadgeSelected : t.photoBadgeOptional}
                          </span>
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.alt ?? ""}
                          className="mt-4 aspect-video w-full rounded-[var(--radius-md)] object-cover"
                        />
                      </Selectable>
                    );
                  })}
                </div>
                </div>
              )}
            </CardContent>
          </Card>

          {errorMessage ? <ErrorState title={t.errors.title} description={errorMessage} /> : null}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={!canSave}>
              {saveState === "saving" ? t.actions.saveLoading : t.actions.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPreviewState("idle");
                setPreview(null);
                setDraft(null);
                setErrorMessage(null);
              }}
            >
              {t.actions.startOver}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
