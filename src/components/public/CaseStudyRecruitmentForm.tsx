"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Card, CardContent, FieldLabel, Input, Textarea, useToast } from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { trackAdConversion } from "@/lib/analytics/conversions";
import { reportClientError } from "@/lib/telemetry";
import type { Locale } from "@/i18n/config";

export function CaseStudyRecruitmentForm({
  locale,
  sourcePath,
  painSlug,
  copy,
}: {
  locale: Locale;
  sourcePath: string;
  painSlug?: string;
  copy: {
    nameLabel: string;
    emailLabel: string;
    ridingGoalLabel: string;
    painSummaryLabel: string;
    consentLabel: string;
    submitLabel: string;
    success: string;
    helpText: string;
  };
}) {
  const toast = useToast();
  const logMarketingEvent = useMarketingEventLogger();
  const submitLead = useMutation(api.caseStudyLeads.mutations.submit);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ridingGoal, setRidingGoal] = useState("");
  const [painSummary, setPainSummary] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      await submitLead({
        locale,
        sourcePath,
        painSlug,
        name,
        email,
        ridingGoal,
        painSummary,
        consentAccepted,
      });

      logMarketingEvent({
        eventType: "case_study_recruitment_submit",
        locale,
        pagePath: sourcePath,
        section: painSlug ?? "general",
      });
      trackAdConversion("case_study_lead", {
        locale,
        pagePath: sourcePath,
        painSlug,
      });
      toast.success({ description: copy.success });
      setName("");
      setEmail("");
      setRidingGoal("");
      setPainSummary("");
      setConsentAccepted(false);
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "case-study",
          action: "submitLead",
          operationType: "mutation",
          metadata: { sourcePath, painSlug },
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="dashboard-card-surface rounded-[2rem] border border-border/70">
      <CardContent className="p-6 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel label={copy.nameLabel} />
              <Input value={name} onChange={(event) => setName(event.currentTarget.value)} required />
            </div>
            <div className="space-y-2">
              <FieldLabel label={copy.emailLabel} />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel label={copy.ridingGoalLabel} />
            <Input
              value={ridingGoal}
              onChange={(event) => setRidingGoal(event.currentTarget.value)}
              placeholder={copy.helpText}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel label={copy.painSummaryLabel} />
            <Textarea
              value={painSummary}
              onChange={(event) => setPainSummary(event.currentTarget.value)}
              rows={6}
              required
            />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-foreground">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.currentTarget.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
              required
            />
            <span>{copy.consentLabel}</span>
          </label>

          <Button type="submit" isLoading={isSubmitting}>
            {copy.submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
