"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { AccessibleDialog, Button, Card, Input, Selectable, Textarea } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";
import { getFeedbackCopy, getFeedbackLocale } from "./feedback-copy";
import { feedbackApi, type FeedbackType } from "./feedback-api";
import { createBrowserMetadata } from "./feedback-format";
import type { Id } from "../../../convex/_generated/dataModel";

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  defaultType?: FeedbackType;
  linkedSessionId?: Id<"fitSessions">;
  linkedBikeId?: Id<"bikes">;
  pagePath?: string;
}

type FeedbackFormState = {
  title: string;
  description: string;
  category: string;
  expectedResult: string;
  actualResult: string;
  pagePath: string;
  browserInfoJson: string;
};

type FeedbackFieldErrors = Partial<Record<keyof FeedbackFormState | "type", string>>;

const typeOrder: FeedbackType[] = ["bug", "feature_request", "support_case"];

function createEmptyState(pagePath: string, type?: FeedbackType): FeedbackFormState {
  return {
    title: "",
    description: "",
    category: "",
    expectedResult: "",
    actualResult: "",
    pagePath,
    browserInfoJson: type === "bug" ? createBrowserMetadata() : "",
  };
}

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

function buildValidation(
  type: FeedbackType | null,
  state: FeedbackFormState,
  copy = getFeedbackCopy("en")
) {
  const errors: FeedbackFieldErrors = {};
  if (!type) {
    errors.type = copy.dialog.typePrompt;
    return errors;
  }

  if (!state.title.trim()) {
    errors.title = copy.dialog.titleLabel;
  }
  if (!state.description.trim()) {
    errors.description = copy.dialog.descriptionLabel;
  }
  if (type === "bug") {
    if (!state.expectedResult.trim()) {
      errors.expectedResult = copy.dialog.expectedResultLabel;
    }
    if (!state.actualResult.trim()) {
      errors.actualResult = copy.dialog.actualResultLabel;
    }
  }

  return errors;
}

function validationMessageFor(field: string, copy = getFeedbackCopy("en")) {
  switch (field) {
    case "type":
      return copy.dialog.typeDescription;
    case "title":
      return `${copy.dialog.titleLabel} is required.`;
    case "description":
      return `${copy.dialog.descriptionLabel} is required.`;
    case "expectedResult":
      return `${copy.dialog.expectedResultLabel} is required.`;
    case "actualResult":
      return `${copy.dialog.actualResultLabel} is required.`;
    default:
      return copy.dialog.errorGeneric;
  }
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
  const copy = getFeedbackCopy(getFeedbackLocale(locale));
  const pathname = usePathname();
  const submitFeedback = useMutation(feedbackApi.mutations.submitFeedback);
  const [step, setStep] = useState<"type" | "form" | "success">(defaultType ? "form" : "type");
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(defaultType ?? null);
  const [form, setForm] = useState<FeedbackFormState>(() =>
    createEmptyState(pagePath ?? pathname ?? "", defaultType)
  );
  const [errors, setErrors] = useState<FeedbackFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedPagePath = pagePath ?? pathname ?? "";
  const liveValidation = buildValidation(selectedType, form, copy);
  const isFormValid = Object.keys(liveValidation).length === 0;

  useEffect(() => {
    if (!open) {
      setStep("type");
      setSelectedType(null);
      setForm(createEmptyState(resolvedPagePath, defaultType));
      setErrors({});
      setSubmitError(null);
      return;
    }

    const nextType = defaultType ?? null;
    setSelectedType(nextType);
    setStep(nextType ? "form" : "type");
    setForm(createEmptyState(resolvedPagePath, nextType ?? undefined));
    setErrors({});
    setSubmitError(null);
  }, [defaultType, open, resolvedPagePath]);

  useEffect(() => {
    if (!open || selectedType !== "bug") return;
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
      browserInfoJson: type === "bug" ? current.browserInfoJson || createBrowserMetadata() : "",
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
    const validation = buildValidation(selectedType, form, copy);
    setErrors(validation);
    const hasValidationError = Object.keys(validation).length > 0;
    if (hasValidationError || !selectedType) {
      setSubmitError(copy.dialog.errorGeneric);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        type: selectedType,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || undefined,
        pagePath: form.pagePath.trim() || undefined,
        linkedSessionId,
        linkedBikeId,
        expectedResult: selectedType === "bug" ? form.expectedResult.trim() : undefined,
        actualResult: selectedType === "bug" ? form.actualResult.trim() : undefined,
        browserInfoJson:
          selectedType === "bug" ? form.browserInfoJson || createBrowserMetadata() : undefined,
      });
      setStep("success");
    } catch (error) {
      console.error("Failed to submit feedback", error);
      setSubmitError(copy.dialog.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedTypeMeta = selectedType ? copy.types[selectedType] : null;
  const showTypeStep = step === "type" && !defaultType;
  const showFormStep = step === "form";
  const showSuccessStep = step === "success";

  return (
    <AccessibleDialog
      open={open}
      onClose={onClose}
      title={
        showTypeStep
          ? copy.dialog.chooseTypeTitle
          : showSuccessStep
            ? copy.dialog.successTitle
            : copy.dialog.formTitle
      }
      description={
        showTypeStep
          ? copy.dialog.chooseTypeSubtitle
          : showSuccessStep
            ? copy.dialog.successSubtitle
            : copy.dialog.formSubtitle
      }
    >
      {showTypeStep ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
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
            <Button variant="ghost" size="sm" onClick={() => setStep("type")} type="button">
              {copy.dialog.changeType}
            </Button>
          </div>

          <div className="grid gap-4">
            <Input
              label={copy.dialog.titleLabel}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              error={errors.title ? validationMessageFor("title", copy) : undefined}
              placeholder={
                selectedType === "bug"
                  ? copy.dialog.placeholders.bugTitle
                  : selectedType === "feature_request"
                    ? copy.dialog.placeholders.featureRequestTitle
                    : copy.dialog.placeholders.supportCaseTitle
              }
            />

            <Textarea
              label={copy.dialog.descriptionLabel}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              error={errors.description ? validationMessageFor("description", copy) : undefined}
              placeholder={copy.dialog.placeholders.description}
              rows={5}
            />

            <Input
              label={copy.dialog.categoryLabel}
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder={copy.dialog.placeholders.category}
              helperText={copy.dialog.categoryHelper}
            />

            {selectedType === "bug" ? (
              <>
                <Textarea
                  label={copy.dialog.expectedResultLabel}
                  value={form.expectedResult}
                  onChange={(event) => updateField("expectedResult", event.target.value)}
                  error={
                    errors.expectedResult ? validationMessageFor("expectedResult", copy) : undefined
                  }
                  placeholder={copy.dialog.placeholders.expectedResult}
                  rows={3}
                />
                <Textarea
                  label={copy.dialog.actualResultLabel}
                  value={form.actualResult}
                  onChange={(event) => updateField("actualResult", event.target.value)}
                  error={
                    errors.actualResult ? validationMessageFor("actualResult", copy) : undefined
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
                setForm(createEmptyState(resolvedPagePath, defaultType));
                setErrors({});
                setSubmitError(null);
              }}
            >
              {copy.dialog.submitAnother}
            </Button>
          </div>
        </div>
      ) : null}
    </AccessibleDialog>
  );
}
