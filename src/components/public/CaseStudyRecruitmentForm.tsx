"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Input } from "@/components/prototyper-ui/ui/input";
import { Label } from "@/components/prototyper-ui/ui/label";
import { Textarea } from "@/components/prototyper-ui/ui/textarea";
import { useToast } from "@/components/prototyper-ui/ui/toast";
import { PublicSurfaceCard } from "@/components/public/PublicSurfaceCard";
import { trackAdConversion } from "@/lib/analytics/conversions";
import { reportClientError } from "@/lib/telemetry";
import type { Locale } from "@/i18n/config";

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

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
    <PublicSurfaceCard className="rounded-[2rem]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="case-study-name" label={copy.nameLabel}>
              <Input id="case-study-name" value={name} onChange={(event) => setName(event.currentTarget.value)} required />
            </FormField>
            <FormField id="case-study-email" label={copy.emailLabel}>
              <Input
                id="case-study-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
              />
            </FormField>
          </div>

          <FormField id="case-study-goal" label={copy.ridingGoalLabel}>
            <Input
              id="case-study-goal"
              value={ridingGoal}
              onChange={(event) => setRidingGoal(event.currentTarget.value)}
              placeholder={copy.helpText}
            />
          </FormField>

          <FormField id="case-study-summary" label={copy.painSummaryLabel}>
            <Textarea
              id="case-study-summary"
              value={painSummary}
              onChange={(event) => setPainSummary(event.currentTarget.value)}
              rows={6}
              required
            />
          </FormField>

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

          <Button type="submit" isPending={isSubmitting}>
            {copy.submitLabel}
          </Button>
        </form>
    </PublicSurfaceCard>
  );
}
