"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, AccessibleDialog, Input, FieldLabel, useToast } from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { reportClientError } from "@/lib/telemetry";
import type { Locale } from "@/i18n/config";

interface Props {
  locale: Locale;
  sessionId: string;
  userEmail: string;
}

type State = "idle" | "form" | "submitted" | "dismissed";

const EXPERIENCE_OPTIONS = [
  { key: "lt_1yr", labelEn: "Less than 1 year", labelNl: "Minder dan 1 jaar" },
  { key: "1_3yr", labelEn: "1–3 years", labelNl: "1–3 jaar" },
  { key: "3_10yr", labelEn: "3–10 years", labelNl: "3–10 jaar" },
  { key: "10plus_yr", labelEn: "10+ years", labelNl: "10+ jaar" },
] as const;

const HELP_RATING_OPTIONS = [
  { key: "yes", labelEn: "Yes, they gave me clear direction", labelNl: "Ja, ik heb duidelijke richting gekregen" },
  { key: "partial", labelEn: "Partially — still working on it", labelNl: "Gedeeltelijk — ik werk er nog aan" },
  { key: "still_testing", labelEn: "Still testing", labelNl: "Ik test nog" },
] as const;

export function CaseStudyOptIn({ locale, sessionId, userEmail }: Props) {
  const isNl = locale === "nl";
  const toast = useToast();
  const logMarketingEvent = useMarketingEventLogger();
  const submitLead = useMutation(api.caseStudyLeads.mutations.submit);

  const [state, setState] = useState<State>("idle");
  const [experience, setExperience] = useState("");
  const [problem, setProblem] = useState("");
  const [helpRating, setHelpRating] = useState("");
  const [willingToInterview, setWillingToInterview] = useState<"yes" | "no" | "">("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState(userEmail);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourcePath = `/fit/${sessionId}/results`;

  const handleOptInShown = () => {
    logMarketingEvent({ eventType: "case_study_opt_in_shown", locale, pagePath: sourcePath, section: "results" });
  };

  const handleClickYes = () => {
    setState("form");
    logMarketingEvent({ eventType: "case_study_opt_in_clicked", locale, pagePath: sourcePath, section: "results" });
  };

  const handleDismiss = () => {
    setState("dismissed");
    logMarketingEvent({ eventType: "case_study_dismissed", locale, pagePath: sourcePath, section: "results" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;

    const painSummaryParts = [
      `Cycling experience: ${experience}`,
      `Did the fit help: ${helpRating}`,
      `Willing to interview: ${willingToInterview}`,
    ];
    if (problem) painSummaryParts.push(`Problem: ${problem}`);

    setIsSubmitting(true);
    try {
      await submitLead({
        locale,
        sourcePath,
        name: firstName,
        email,
        ridingGoal: experience,
        painSummary: painSummaryParts.join("\n"),
        consentAccepted: consent,
      });

      logMarketingEvent({ eventType: "case_study_submitted", locale, pagePath: sourcePath, section: "results" });
      setState("submitted");
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "case-study",
          action: "submitOptIn",
          operationType: "mutation",
          metadata: { sourcePath },
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === "dismissed" || state === "submitted") return null;

  // Fire shown event when card renders for the first time
  void (state === "idle" && handleOptInShown);

  return (
    <>
      <div className="mt-8 rounded-[2rem] border border-border/70 bg-[color:color-mix(in_oklch,var(--card)_90%,var(--primary)_10%)] p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          {isNl ? "Wil je worden uitgelicht?" : "Want to be featured?"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isNl
            ? "We verzamelen echte fietserverhalen. Als deze fit je bruikbare doelwaarden heeft gegeven, horen we dat graag. Duurt 10 minuten via e-mail. Geen marketing zonder toestemming."
            : "We're collecting real rider stories. If this fit gave you useful targets, we'd love to include your experience on BestBikeFit4U. Takes 10 minutes by email. No marketing without consent."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button size="sm" onClick={handleClickYes}>
            {isNl ? "Ja, ik ben geïnteresseerd" : "Yes, I'm interested"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            {isNl ? "Misschien later" : "Maybe later"}
          </Button>
        </div>
      </div>

      <AccessibleDialog
        open={state === "form"}
        onClose={() => setState("idle")}
        title={isNl ? "Vertel ons over je ervaring" : "Tell us about your experience"}
      >
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Cycling experience */}
          <fieldset>
            <legend className="text-sm font-medium text-foreground">
              {isNl ? "Hoe lang fiets je al?" : "How long have you been cycling?"}
            </legend>
            <div className="mt-2 space-y-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="experience"
                    value={opt.key}
                    checked={experience === opt.key}
                    onChange={() => setExperience(opt.key)}
                    required
                    className="h-4 w-4"
                  />
                  {isNl ? opt.labelNl : opt.labelEn}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Problem description */}
          <div className="space-y-2">
            <FieldLabel
              label={isNl ? "Wat wilde je oplossen? (optioneel, max 200 tekens)" : "What were you trying to solve? (optional, max 200 chars)"}
            />
            <Input
              value={problem}
              onChange={(e) => setProblem(e.currentTarget.value.slice(0, 200))}
              placeholder={isNl ? "Beschrijf kort je situatie…" : "Briefly describe your situation…"}
            />
          </div>

          {/* Help rating */}
          <fieldset>
            <legend className="text-sm font-medium text-foreground">
              {isNl ? "Heeft de fit je geholpen?" : "Did the fit targets help?"}
            </legend>
            <div className="mt-2 space-y-2">
              {HELP_RATING_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="helpRating"
                    value={opt.key}
                    checked={helpRating === opt.key}
                    onChange={() => setHelpRating(opt.key)}
                    required
                    className="h-4 w-4"
                  />
                  {isNl ? opt.labelNl : opt.labelEn}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Willing to interview */}
          <fieldset>
            <legend className="text-sm font-medium text-foreground">
              {isNl ? "Ben je bereid een kort e-mailinterview te doen?" : "Would you be willing to do a short email interview?"}
            </legend>
            <div className="mt-2 flex gap-4">
              {(["yes", "no"] as const).map((val) => (
                <label key={val} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="willingToInterview"
                    value={val}
                    checked={willingToInterview === val}
                    onChange={() => setWillingToInterview(val)}
                    required
                    className="h-4 w-4"
                  />
                  {val === "yes" ? (isNl ? "Ja" : "Yes") : (isNl ? "Nee" : "No")}
                </label>
              ))}
            </div>
          </fieldset>

          {/* First name */}
          <div className="space-y-2">
            <FieldLabel label={isNl ? "Voornaam" : "Your first name"} />
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <FieldLabel label={isNl ? "E-mailadres" : "Email address"} />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
          </div>

          {/* GDPR consent */}
          <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.currentTarget.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
              required
            />
            <span>
              {isNl
                ? "Ik ga akkoord dat BestBikeFit4U mij per e-mail benadert over deze case study. (Verplicht — AVG-toestemming. Je kunt je op elk moment afmelden.)"
                : "I agree to BestBikeFit4U contacting me by email about this case study. (Required — GDPR consent. You can withdraw at any time.)"}
            </span>
          </label>

          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} disabled={!consent}>
              {isNl ? "Verstuur" : "Submit"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setState("idle")}>
              {isNl ? "Annuleer" : "Cancel"}
            </Button>
          </div>
        </form>
      </AccessibleDialog>
    </>
  );
}
