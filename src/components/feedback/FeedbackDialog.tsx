"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { Button, Card, Input, Selectable, Textarea } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { stripLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import {
  getFeedbackActivityTrail,
  inferFeedbackRouteFamily,
  summarizeFeedbackActivity,
} from "./feedback-activity";
import { getFeedbackCopy, getFeedbackLocale } from "./feedback-copy";
import { feedbackApi, type FeedbackType } from "./feedback-api";
import { createBrowserMetadata } from "./feedback-format";
import {
  buildFeedbackValidation,
  buildFeedbackSubmissionPayload,
  createEmptyFeedbackState,
  getFeedbackGuidedPrompts,
  type FeedbackFieldErrors,
  type FeedbackFormState,
  validationMessageForField,
} from "./feedback-flow";
import type { Id } from "../../../convex/_generated/dataModel";

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  defaultType?: FeedbackType;
  linkedSessionId?: Id<"fitSessions">;
  linkedBikeId?: Id<"bikes">;
  pagePath?: string;
}

const typeOrder: FeedbackType[] = ["bug", "feature_request", "support_case", "review"];

function feedbackTypeTone(type: FeedbackType) {
  if (type === "bug") return "border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))]";
  if (type === "feature_request")
    return "border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))]";
  return "border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))]";
}

function feedbackTypeAccent(type: FeedbackType) {
  if (type === "bug")
    return "bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--card)_90%)]";
  if (type === "feature_request")
    return "bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)]";
  return "bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)]";
}

export function FeedbackDialog({
  open,
  onClose,
  defaultType,
  linkedSessionId,
  linkedBikeId,
  pagePath,
}: FeedbackDialogProps) {
  const { locale } = useDashboardMessages();
  const { isAuthenticated } = useConvexAuth();
  const copy = getFeedbackCopy(getFeedbackLocale(locale));
  const pathname = usePathname();
  const submitFeedback = useMutation(feedbackApi.mutations.submitFeedback);
  const [step, setStep] = useState<"type" | "form" | "success">(defaultType ? "form" : "type");
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(defaultType ?? null);
  const [form, setForm] = useState<FeedbackFormState>(() =>
    createEmptyFeedbackState(pagePath ?? pathname ?? "", defaultType, createBrowserMetadata)
  );
  const [errors, setErrors] = useState<FeedbackFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedPagePath = pagePath ?? pathname ?? "";
  const liveValidation = buildFeedbackValidation(selectedType, form, copy);
  const isFormValid = Object.keys(liveValidation).length === 0;

  useEffect(() => {
    if (!open) {
      setStep("type");
      setSelectedType(null);
      setForm(createEmptyFeedbackState(resolvedPagePath, defaultType, createBrowserMetadata));
      setErrors({});
      setSubmitError(null);
      return;
    }

    const nextType = defaultType ?? null;
    setSelectedType(nextType);
    setStep(nextType ? "form" : "type");
    setForm(
      createEmptyFeedbackState(
        resolvedPagePath,
        nextType ?? undefined,
        createBrowserMetadata
      )
    );
    setErrors({});
    setSubmitError(null);
  }, [defaultType, open, resolvedPagePath]);

  useEffect(() => {
    if (!open || (selectedType !== "bug" && selectedType !== "support_case")) return;
    setForm((current) =>
      current.browserInfoJson
        ? current
        : {
            ...current,
            browserInfoJson: createBrowserMetadata(),
          }
    );
  }, [open, selectedType]);

  const canSubmit = Boolean(selectedType) && isFormValid;

  function updateField<K extends keyof FeedbackFormState>(field: K, value: FeedbackFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  function handleSelectType(type: FeedbackType) {
    setSelectedType(type);
    setErrors({});
    setSubmitError(null);
    setStep("form");
    setForm((current) => ({
      ...current,
      browserInfoJson:
        type === "bug" || type === "support_case"
          ? current.browserInfoJson || createBrowserMetadata()
          : "",
    }));
  }

  function handleBack() {
    if (defaultType) {
      onClose();
      return;
    }
    setStep("type");
    setSubmitError(null);
  }

  async function handleSubmit() {
    const validation = buildFeedbackValidation(selectedType, form, copy);
    setErrors(validation);
    const hasValidationError = Object.keys(validation).length > 0;
    if (hasValidationError || !selectedType) {
      setSubmitError(copy.dialog.errorGeneric);
      return;
    }

    setIsSubmitting(true);
    try {
      const strippedPathname = stripLocalePrefix(pathname ?? resolvedPagePath);
      const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const queryString =
        typeof window !== "undefined"
          ? window.location.search.replace(/^\?/, "") || undefined
          : undefined;
      const activityTrail = getFeedbackActivityTrail();
      await submitFeedback(
        buildFeedbackSubmissionPayload({
          type: selectedType,
          form,
          locale: getFeedbackLocale(locale),
          pathname: strippedPathname,
          pageUrl,
          queryString,
          routeFamily: inferFeedbackRouteFamily(strippedPathname),
          activityTrail,
          activitySummary: summarizeFeedbackActivity(
            selectedType,
            activityTrail,
            strippedPathname
          ),
          isAuthenticated,
          linkedSessionId,
          linkedBikeId,
        })
      );
      setStep("success");
    } catch (error) {
      console.error("Failed to submit feedback", error);
      setSubmitError(copy.dialog.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedTypeMeta = selectedType ? copy.types[selectedType] : null;
  const guidedPrompts = selectedType
    ? getFeedbackGuidedPrompts(selectedType, getFeedbackLocale(locale))
    : [];
  const showTypeStep = step === "type" && !defaultType;
  const showFormStep = step === "form";
  const showSuccessStep = step === "success";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        side="right"
        className="flex h-full w-full max-w-none flex-col border-l border-[color:var(--border)] bg-[color:var(--card)] p-0 text-[color:var(--foreground)] sm:max-w-xl"
      >
        <DialogHeader className="border-b border-[color:var(--border)] px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
            {copy.page.floatingCta}
          </p>
          <DialogTitle className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            {showTypeStep
              ? copy.dialog.chooseTypeTitle
              : showSuccessStep
                ? copy.dialog.successTitle
                : copy.dialog.formTitle}
          </DialogTitle>
          <DialogDescription className="space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
            <span className="block">
              {copy.dialog.mission}
            </span>
            <span className="block">
              {showTypeStep
                ? copy.dialog.chooseTypeSubtitle
                : showSuccessStep
                  ? copy.dialog.successSubtitle
                  : copy.dialog.formSubtitle}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
      {showTypeStep ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {typeOrder.map((type) => (
              <Selectable
                key={type}
                variant="card"
                selected={selectedType === type}
                onClick={() => handleSelectType(type)}
                className={cn(feedbackTypeTone(type), feedbackTypeAccent(type))}
                label={copy.types[type].label}
                description={copy.types[type].description}
              />
            ))}
          </div>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            {copy.dialog.typeDescription}
          </p>
        </div>
      ) : null}

      {showFormStep ? (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {selectedTypeMeta?.label ?? copy.dialog.typePrompt}
              </p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {selectedTypeMeta?.description}
              </p>
            </div>
            {!defaultType ? (
              <Button variant="ghost" size="sm" onClick={() => setStep("type")} type="button">
                {copy.dialog.changeType}
              </Button>
            ) : null}

            {!isAuthenticated ? (
              <>
                <Input
                  label={copy.dialog.contactNameLabel}
                  value={form.contactName}
                  onChange={(event) => updateField("contactName", event.target.value)}
                  placeholder={copy.dialog.placeholders.contactName}
                />
                <Input
                  label={copy.dialog.contactEmailLabel}
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => updateField("contactEmail", event.target.value)}
                  placeholder={copy.dialog.placeholders.contactEmail}
                />
              </>
            ) : null}
          </div>

          <div className="grid gap-4">
            <Card className="border border-[color:var(--border)] bg-[color:var(--secondary)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {copy.dialog.guidedPromptsTitle}
                </p>
                <ul className="space-y-1 text-sm text-[color:var(--foreground)]">
                  {guidedPrompts.map((prompt) => (
                    <li key={prompt}>• {prompt}</li>
                  ))}
                </ul>
              </div>
            </Card>
            <Input
              label={copy.dialog.titleLabel}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              error={errors.title ? validationMessageForField("title", copy) : undefined}
              placeholder={
                selectedType === "bug"
                  ? copy.dialog.placeholders.bugTitle
                  : selectedType === "feature_request"
                    ? copy.dialog.placeholders.featureRequestTitle
                    : selectedType === "review"
                      ? copy.dialog.placeholders.reviewTitle
                      : copy.dialog.placeholders.supportCaseTitle
              }
            />

            <Textarea
              label={copy.dialog.descriptionLabel}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              error={errors.description ? validationMessageForField("description", copy) : undefined}
              placeholder={copy.dialog.placeholders.description}
              rows={5}
            />

            {selectedType !== "review" ? (
              <Input
                label={copy.dialog.categoryLabel}
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder={copy.dialog.placeholders.category}
                helperText={copy.dialog.categoryHelper}
              />
            ) : null}

            {selectedType === "bug" ? (
              <>
                <Textarea
                  label={copy.dialog.expectedResultLabel}
                  value={form.expectedResult}
                  onChange={(event) => updateField("expectedResult", event.target.value)}
                  error={
                    errors.expectedResult ? validationMessageForField("expectedResult", copy) : undefined
                  }
                  placeholder={copy.dialog.placeholders.expectedResult}
                  rows={3}
                />
                <Textarea
                  label={copy.dialog.actualResultLabel}
                  value={form.actualResult}
                  onChange={(event) => updateField("actualResult", event.target.value)}
                  error={
                    errors.actualResult ? validationMessageForField("actualResult", copy) : undefined
                  }
                  placeholder={copy.dialog.placeholders.actualResult}
                  rows={3}
                />
                <Input
                  label={copy.dialog.pagePathLabel}
                  value={form.pagePath}
                  onChange={(event) => updateField("pagePath", event.target.value)}
                  helperText={copy.dialog.placeholders.pagePath}
                />
                <Textarea
                  label={copy.dialog.browserInfoLabel}
                  value={form.browserInfoJson}
                  onChange={(event) => updateField("browserInfoJson", event.target.value)}
                  helperText={copy.dialog.browserInfoHelper}
                  placeholder={copy.dialog.placeholders.browserInfo}
                  rows={6}
                />
              </>
            ) : null}

            {resolvedPagePath || linkedSessionId || linkedBikeId ? (
              <Card className="border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.dialog.linkedContextLabel}
                  </p>
                  {resolvedPagePath ? (
                    <p className="text-sm text-[color:var(--foreground)]">
                      {copy.dialog.pagePathLabel}: {resolvedPagePath}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {linkedSessionId ? (
                      <span className="rounded-full bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary)_88%)] px-3 py-1 text-xs font-medium text-[color:var(--primary)]">
                        {copy.dialog.linkedSessionLabel}: {String(linkedSessionId)}
                      </span>
                    ) : null}
                    {linkedBikeId ? (
                      <span className="rounded-full bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary)_88%)] px-3 py-1 text-xs font-medium text-[color:var(--primary)]">
                        {copy.dialog.linkedBikeLabel}: {String(linkedBikeId)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Card>
            ) : null}

            {submitError ? (
              <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--card)_90%)] px-4 py-3 text-sm text-[color:var(--danger)]">
                {submitError}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" type="button" onClick={handleBack}>
              {copy.dialog.back}
            </Button>
            <Button
              type="button"
              variant="default"
              isPending={isSubmitting}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? copy.dialog.submitting : copy.dialog.submit}
            </Button>
          </div>
        </div>
      ) : null}

      {showSuccessStep ? (
        <div className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_12%,var(--card)_88%)] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-[color:var(--success)]" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  {copy.dialog.successTitle}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  {copy.dialog.successSubtitle}
                </p>
              </div>
            </div>
          </div>

          <Card className="border border-[color:var(--border)] bg-[color:var(--secondary)]">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {copy.dialog.nextStepsTitle}
              </p>
              <ul className="space-y-2 text-sm text-[color:var(--foreground)]">
                {copy.dialog.nextSteps.map((stepLine) => (
                  <li key={stepLine}>• {stepLine}</li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" type="button" onClick={onClose}>
              {copy.dialog.close}
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setStep(defaultType ? "form" : "type");
                setSelectedType(defaultType ?? null);
                setForm(
                  createEmptyFeedbackState(
                    resolvedPagePath,
                    defaultType,
                    createBrowserMetadata
                  )
                );
                setErrors({});
                setSubmitError(null);
              }}
            >
              {copy.dialog.submitAnother}
            </Button>
          </div>
        </div>
      ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
