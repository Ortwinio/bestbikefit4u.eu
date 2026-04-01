"use client";

import Link from "next/link";
import { useState, type ComponentType, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { Bike, CopyPlus, Images, Link2, ShieldCheck } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  ErrorState,
  Input,
  LoadingState,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import { formatMessage } from "@/i18n/dashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeTypeOptions } from "@/lib/bikes";
import { getErrorMessage, reportClientError } from "@/lib/telemetry";
import {
  buildBikePassportDraft,
  getBikePassportTypeLabel,
  isSupportedBikePassportId,
  normalizeBikePassportInput,
  normalizeBikePassportPreview,
  normalizePassportCreatedBikeId,
  type BikePassportDraft,
  type BikePassportImportPreview,
} from "./bikePassportImport";

type PreviewState = "idle" | "loading" | "ready" | "error";
type SaveState = "idle" | "saving";

function summaryCard(
  icon: ComponentType<{ className?: string }>,
  label: string,
  value: string
) {
  const Icon = icon;
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/45 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">{value}</p>
    </div>
  );
}

function translatePassportError(
  error: unknown,
  fallback: string,
  t: ReturnType<typeof useDashboardMessages>["messages"]["bikeForm"]["passportImport"]["errors"]
) {
  const safeMessage = reportClientError(error, {
    area: "bikes",
    action: "passportImport",
    operationType: "client",
    userMessage: fallback,
  });
  const raw = getErrorMessage(error, safeMessage);

  if (raw === "backend_unavailable") {
    return t.backendUnavailable;
  }
  if (raw.includes("invalid") && raw.includes("passport")) {
    return t.invalidPassport;
  }
  if (raw.includes("not_found") || raw.includes("not found")) {
    return t.notFound;
  }
  if (raw.includes("owned_by_user") || raw.includes("already belongs to you")) {
    return t.alreadyOwned;
  }

  return raw || fallback;
}

export function BikePassportImportFlow() {
  const router = useRouter();
  const toast = useToast();
  const { locale, messages } = useDashboardMessages();
  const t = messages.bikeForm.passportImport;
  const bikeTypeOptions = getBikeTypeOptions(messages);

  const importByPassport = useMutation(api.bikes.mutations.importByPassport);
  const previewImportByPassportId = useAction(api.bikes.actions.previewImportByPassportId);

  const [passportId, setPassportId] = useState("");
  const [previewState, setPreviewState] = useState<PreviewState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<BikePassportImportPreview | null>(null);
  const [draft, setDraft] = useState<BikePassportDraft | null>(null);

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPassportId = normalizeBikePassportInput(passportId);
    if (!isSupportedBikePassportId(normalizedPassportId)) {
      setPreviewState("error");
      setErrorMessage(t.errors.invalidPassport);
      return;
    }

    setPreviewState("loading");
    setErrorMessage(null);
    setPreview(null);
    setDraft(null);

    try {
      const rawPreview = await previewImportByPassportId({
        bikePassportId: normalizedPassportId,
      });

      const record = rawPreview as Record<string, unknown> | null;
      if (record && record.status === "self_owned") {
        setPreviewState("error");
        setErrorMessage(t.errors.alreadyOwned);
        return;
      }

      const normalized = normalizeBikePassportPreview(rawPreview, normalizedPassportId);
      if (!normalized) {
        setPreviewState("error");
        setErrorMessage(t.errors.notFound);
        return;
      }

      setPreview(normalized);
      setDraft(buildBikePassportDraft(normalized));
      setPreviewState("ready");
    } catch (error) {
      setPreviewState("error");
      setErrorMessage(translatePassportError(error, t.errors.notFound, t.errors));
    }
  }

  async function handleImport() {
    if (!draft) {
      return;
    }

    setSaveState("saving");
    setErrorMessage(null);

    try {
      const payload = await importByPassport({
        bikePassportId: draft.bikePassportId,
        name: draft.name.trim(),
        brand: draft.brand.trim() || undefined,
        model: draft.model.trim() || undefined,
        bikeType: draft.bikeType,
        description: draft.description.trim() || undefined,
      });
      const bikeId = normalizePassportCreatedBikeId(payload);
      if (!bikeId) {
        throw new Error("missing_bike_id");
      }

      toast.success({
        description: formatMessage(t.success, { bikeName: draft.name }),
      });
      router.push(withLocalePrefix(`/bikes/${bikeId}`, locale));
    } catch (error) {
      setErrorMessage(translatePassportError(error, t.errors.saveFailed, t.errors));
    } finally {
      setSaveState("idle");
    }
  }

  const canPreview =
    normalizeBikePassportInput(passportId).length > 0 && previewState !== "loading";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
      </div>

      <Card variant="bordered" className="dashboard-card-surface">
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{t.entryTitle}</h2>
              <CardDescription>{t.entryDescription}</CardDescription>
              <form className="space-y-4" onSubmit={handlePreview}>
                <Input
                  label={t.fields.passportId.label}
                  value={passportId}
                  onChange={(event) => setPassportId(event.target.value.toUpperCase())}
                  placeholder={t.fields.passportId.placeholder}
                  helperText={t.fields.passportId.helper}
                />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={!canPreview}>
                    {previewState === "loading" ? t.actions.previewLoading : t.actions.preview}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
                  >
                    {t.actions.back}
                  </Button>
                </div>
              </form>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--secondary)_72%,var(--background)_28%),color-mix(in_oklch,var(--card)_88%,var(--primary)_12%))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                {t.copyCard.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{t.copyCard.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t.copyCard.description}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-foreground">
                <li className="flex gap-3">
                  <CopyPlus className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{t.copyCard.ownCopy}</span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{t.copyCard.sourceUnaffected}</span>
                </li>
                <li className="flex gap-3">
                  <Link2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{t.copyCard.shareableId}</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewState === "loading" ? <LoadingState label={t.loading.preview} /> : null}

      {previewState === "error" && errorMessage ? (
        <ErrorState title={t.errors.title} description={errorMessage} />
      ) : null}

      {previewState === "ready" && preview && draft ? (
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="space-y-6 pt-6">
            {errorMessage ? (
              <ErrorState title={t.errors.title} description={errorMessage} />
            ) : null}

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t.previewTitle}</h2>
                <CardDescription className="mt-2">{t.previewDescription}</CardDescription>
              </div>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {preview.bikePassportId}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-5">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                    {t.previewBikeLabel}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">{preview.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[preview.brand, preview.model].filter(Boolean).join(" ") || t.emptyBrandModel}
                  </p>
                  {preview.description ? (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {preview.description}
                    </p>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {t.noDescription}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {summaryCard(
                    Bike,
                    t.summary.type,
                    getBikePassportTypeLabel(preview.bikeType, messages)
                  )}
                  {summaryCard(
                    Images,
                    t.summary.photos,
                    formatMessage(t.summary.photoCount, { count: preview.photoCount })
                  )}
                  {summaryCard(Link2, t.summary.frameSize, preview.frameSize ?? "-")}
                  {summaryCard(
                    ShieldCheck,
                    t.summary.geometry,
                    [preview.stackMm, preview.reachMm].some((value) => value !== undefined)
                      ? formatMessage(t.summary.geometryValue, {
                          stack: preview.stackMm ?? "-",
                          reach: preview.reachMm ?? "-",
                        })
                      : t.summary.geometryMissing
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/30 p-5">
                  <p className="text-sm font-semibold text-foreground">{t.confirmationTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t.confirmationDescription}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{t.photoNotCopied}</p>
                </div>

                <div className="space-y-4 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)] p-5">
                  <Input
                    label={messages.bikeForm.fields.name.label}
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, name: event.target.value } : current
                      )
                    }
                    placeholder={messages.bikeForm.fields.name.placeholder}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={messages.bikeForm.fields.brand.label}
                      value={draft.brand}
                      onChange={(event) =>
                        setDraft((current) =>
                          current ? { ...current, brand: event.target.value } : current
                        )
                      }
                      placeholder={messages.bikeForm.fields.brand.placeholder}
                    />
                    <Input
                      label={messages.bikeForm.fields.model.label}
                      value={draft.model}
                      onChange={(event) =>
                        setDraft((current) =>
                          current ? { ...current, model: event.target.value } : current
                        )
                      }
                      placeholder={messages.bikeForm.fields.model.placeholder}
                    />
                  </div>
                  <Select
                    label={messages.bikeForm.fields.type.label}
                    value={draft.bikeType}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, bikeType: event.target.value as BikePassportDraft["bikeType"] }
                          : current
                      )
                    }
                    options={bikeTypeOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                  <Textarea
                    label={messages.bikeForm.marktplaatsImport.fields.description.label}
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, description: event.target.value } : current
                      )
                    }
                    placeholder={messages.bikeForm.marktplaatsImport.fields.description.placeholder}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleImport}
                    isLoading={saveState === "saving"}
                    disabled={!draft.name.trim()}
                  >
                    {saveState === "saving" ? t.actions.importLoading : t.actions.import}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setPreviewState("idle")}>
                    {t.actions.startOver}
                  </Button>
                  {preview.existingBikeId ? (
                    <Button
                      type="button"
                      variant="outline"
                      render={
                        <Link
                          href={withLocalePrefix(`/bikes/${preview.existingBikeId}`, locale)}
                        />
                      }
                    >
                      {messages.dashboardHome.viewBike}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
