"use client";

import { useEffect, useState } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { useQuery } from "convex/react";
import Image from "next/image";
import { AlertTriangle, Bike, Loader2, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/prototyper-ui/ui/card";
import { Input as PrototyperInput } from "@/components/prototyper-ui/ui/input";
import { Label } from "@/components/prototyper-ui/ui/label";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "@/i18n/config";
import { PublicInfoPanel } from "./PublicInfoPanel";

type LookupResponse = {
  brand?: string;
  model?: string;
  bikeType?: string;
  sizeLabel?: string;
  geometryQuality?: "full" | "partial" | "none";
  primaryPhotoUrl?: string;
  thumbnailUrls?: string[];
  previewToken: string;
};

type QuickMatchResponse = {
  score: number;
  scoreMax: 75;
  scoreBand: "unlikely" | "weak" | "borderline" | "could_fit";
  confidence: "high" | "medium" | "limited";
  explanationCode: string;
  estimatedInseamCm: number;
  dimensionScores: {
    frameSize: number;
    cockpit: number;
    geometryConfidence: number;
  };
  calcVersion: "qm_v1";
};

type BikeQuickCheckCopy = {
  badge: string;
  collapsedTitle: string;
  collapsedDescription: string;
  expandLabel: string;
  codeLabel: string;
  codePlaceholder: string;
  codeHelper: string;
  lookupButton: string;
  lookupLoading: string;
  invalidTitle: string;
  invalidDescription: string;
  invalidRetry: string;
  rateLimitedTitle: string;
  rateLimitedDescription: string;
  rateLimitedRetry: string;
  previewTitle: string;
  previewDescription: string;
  previewHeightPrompt: string;
  previewSupport: string;
  previewButton: string;
  previewLoading: string;
  heightLabel: string;
  heightPlaceholder: string;
  bikeSummaryLabel: string;
  sizeLabel: string;
  geometryLabel: string;
  geometryLimited: string;
  noPhoto: string;
  resultTitle: string;
  resultSupport: string;
  scoreLabel: string;
  scoreSuffix: string;
  confidenceLabel: string;
  inseamEstimateLabel: string;
  limitedEstimate: string;
  geometryWeakNote: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
  ctaSecondary: string;
  signedInCtaTitle: string;
  signedInCtaDescription: string;
  signedInPrimaryCta: string;
  signedInSecondaryCta: string;
  confidenceLevels: Record<QuickMatchResponse["confidence"], string>;
  scoreBands: Record<QuickMatchResponse["scoreBand"], string>;
  geometryQualityLabels: Record<"full" | "partial" | "none", string>;
  explanationCodes: Record<string, string>;
};

type BikeQuickCheckCardProps = {
  locale: Locale;
  pagePath: string;
  loginHref: string;
  profileHref: string;
  fitHref: string;
  copy: BikeQuickCheckCopy;
};

type ViewState =
  | "collapsed"
  | "loading_lookup"
  | "preview"
  | "loading_match"
  | "result"
  | "invalid"
  | "rate_limited";

function formatBikeLabel(preview: LookupResponse) {
  return [preview.brand, preview.model].filter(Boolean).join(" ").trim() || preview.bikeType || "Bike";
}

function formatRetrySeconds(value: number | null) {
  if (value === null || value <= 0) {
    return "0";
  }

  return String(value);
}

function confidenceTone(confidence: QuickMatchResponse["confidence"]) {
  switch (confidence) {
    case "high":
      return "border-[color:color-mix(in_oklch,var(--success)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)] text-[color:var(--success)]";
    case "medium":
      return "border-[color:color-mix(in_oklch,var(--primary)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)] text-[color:var(--primary)]";
    default:
      return "border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)] text-[color:var(--warning)]";
  }
}

function scoreTone(scoreBand: QuickMatchResponse["scoreBand"]) {
  switch (scoreBand) {
    case "could_fit":
      return "text-[color:var(--success)]";
    case "borderline":
      return "text-[color:var(--primary)]";
    case "weak":
      return "text-[color:var(--warning)]";
    default:
      return "text-[color:var(--danger)]";
  }
}

function QuickCheckInput({
  id,
  label,
  value,
  onChange,
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<React.ComponentProps<typeof PrototyperInput>, "id" | "value" | "onChange">) {
  return (
    <BaseField.Root className="flex w-full flex-col gap-2" name={id}>
      <Label htmlFor={id}>{label}</Label>
      <PrototyperInput id={id} value={value} onChange={onChange} {...props} />
    </BaseField.Root>
  );
}

export function BikeQuickCheckCard({
  locale,
  pagePath,
  loginHref,
  profileHref,
  fitHref,
  copy,
}: BikeQuickCheckCardProps) {
  const user = useQuery(api.users.queries.getCurrentUser);
  const logMarketingEvent = useMarketingEventLogger();
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("collapsed");
  const [code, setCode] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [lookup, setLookup] = useState<LookupResponse | null>(null);
  const [match, setMatch] = useState<QuickMatchResponse | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);

  function trackPublicFitEvent(
    eventType:
      | "bike_public_fit_lookup_submitted"
      | "bike_public_fit_lookup_succeeded"
      | "bike_public_fit_lookup_failed"
      | "bike_public_fit_rate_limited"
      | "bike_public_fit_quick_match_completed"
      | "bike_public_fit_signup_cta_clicked"
  ) {
    logMarketingEvent({
      eventType,
      locale,
      pagePath,
      section: "homepage_quick_check",
    });
  }

  useEffect(() => {
    if (viewState !== "rate_limited" || retryAfterSeconds === null || retryAfterSeconds <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setRetryAfterSeconds((current) => (current === null ? null : Math.max(0, current - 1)));
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [retryAfterSeconds, viewState]);

  async function handleLookupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsExpanded(true);
    setViewState("loading_lookup");
    setLookup(null);
    setMatch(null);
    trackPublicFitEvent("bike_public_fit_lookup_submitted");

    try {
      const response = await fetch("/api/public-fit/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicFitCode: code.trim() }),
      });

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "300");
        setRetryAfterSeconds(Number.isFinite(retryAfter) ? retryAfter : 300);
        setViewState("rate_limited");
        trackPublicFitEvent("bike_public_fit_rate_limited");
        return;
      }

      if (!response.ok) {
        setViewState("invalid");
        trackPublicFitEvent("bike_public_fit_lookup_failed");
        return;
      }

      const payload = (await response.json()) as LookupResponse;
      setLookup(payload);
      setViewState("preview");
      trackPublicFitEvent("bike_public_fit_lookup_succeeded");
    } catch {
      setViewState("invalid");
      trackPublicFitEvent("bike_public_fit_lookup_failed");
    }
  }

  async function handleQuickMatchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lookup) {
      return;
    }

    setIsExpanded(true);
    setViewState("loading_match");
    setMatch(null);

    try {
      const response = await fetch("/api/public-fit/quick-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          previewToken: lookup.previewToken,
          heightCm: Number(heightCm),
        }),
      });

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "300");
        setRetryAfterSeconds(Number.isFinite(retryAfter) ? retryAfter : 300);
        setViewState("rate_limited");
        trackPublicFitEvent("bike_public_fit_rate_limited");
        return;
      }

      if (!response.ok) {
        setViewState("invalid");
        trackPublicFitEvent("bike_public_fit_lookup_failed");
        return;
      }

      const payload = (await response.json()) as QuickMatchResponse;
      setMatch(payload);
      setViewState("result");
      trackPublicFitEvent("bike_public_fit_quick_match_completed");
    } catch {
      setViewState("invalid");
      trackPublicFitEvent("bike_public_fit_lookup_failed");
    }
  }

  const bikeLabel = lookup ? formatBikeLabel(lookup) : null;

  return (
    <Card
      variant="default"
      className="relative w-full overflow-hidden border-[color:color-mix(in_oklch,var(--primary)_20%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--card)_95%,var(--primary)_5%)_0%,color-mix(in_oklch,var(--card)_98%,var(--secondary)_2%)_100%)] shadow-[0_22px_70px_-28px_color-mix(in_oklch,var(--foreground)_34%,transparent)]"
    >
      <CardHeader className="gap-3 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_80%,var(--background)_20%)] text-[color:var(--primary)]">
            <Search className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
              {copy.collapsedTitle}
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {copy.collapsedDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
            <span>{copy.badge}</span>
          </div>

          {viewState === "collapsed" ? (
            <div className="space-y-4">
              <PublicInfoPanel tone="secondary" icon={<ShieldCheck className="mt-0.5 h-4 w-4" />}>
                {copy.codeHelper}
              </PublicInfoPanel>
              {!isExpanded ? (
                <Button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="w-full sm:w-auto"
                >
                  {copy.expandLabel}
                </Button>
              ) : null}
            </div>
          ) : null}

        {viewState === "loading_lookup" ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[color:var(--primary)]" />
            <p className="text-sm font-medium text-[color:var(--foreground)]">{copy.lookupLoading}</p>
          </div>
        ) : null}

        {viewState === "invalid" ? (
          <div className="space-y-4">
            <PublicInfoPanel
              title={copy.invalidTitle}
              tone="warning"
              role="alert"
              icon={<AlertTriangle className="mt-0.5 h-4 w-4" />}
            >
              {copy.invalidDescription}
            </PublicInfoPanel>
            <form className="space-y-3" onSubmit={handleLookupSubmit}>
              <QuickCheckInput
                id="bike-quick-check-code-invalid"
                label={copy.codeLabel}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={copy.codePlaceholder}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  className="min-w-44 bg-[color:var(--primary)] text-white hover:bg-[color:color-mix(in_oklch,var(--primary)_88%,black_12%)]"
                >
                  {copy.lookupButton}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--secondary)]"
                  onClick={() => {
                    setIsExpanded(false);
                    setViewState("collapsed");
                  }}
                >
                  {copy.invalidRetry}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {viewState === "rate_limited" ? (
          <div className="space-y-4">
            <PublicInfoPanel
              title={copy.rateLimitedTitle}
              tone="danger"
              role="alert"
              icon={<LockKeyhole className="mt-0.5 h-4 w-4" />}
            >
              {copy.rateLimitedDescription} {formatRetrySeconds(retryAfterSeconds)}s
            </PublicInfoPanel>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={(retryAfterSeconds ?? 0) > 0}
                onClick={() => {
                  setRetryAfterSeconds(null);
                  setIsExpanded(true);
                  setViewState("invalid");
                }}
              >
                {copy.rateLimitedRetry}
              </Button>
            </div>
          </div>
        ) : null}

        {viewState === "preview" && lookup ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-4 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{copy.previewTitle}</p>
                  <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">{copy.previewDescription}</p>
                </div>
                <div className="grid gap-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_84%,var(--background)_16%)] p-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                      {copy.bikeSummaryLabel}
                    </p>
                    <p className="mt-1 font-medium text-[color:var(--foreground)]">{bikeLabel}</p>
                  </div>
                  {lookup.sizeLabel ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        {copy.sizeLabel}
                      </p>
                      <p className="mt-1 text-[color:var(--foreground)]">{lookup.sizeLabel}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                      {copy.geometryLabel}
                    </p>
                    <p className="mt-1 text-[color:var(--foreground)]">
                      {copy.geometryQualityLabels[lookup.geometryQuality ?? "none"]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)]">
                {lookup.primaryPhotoUrl ? (
                  <Image
                    src={lookup.primaryPhotoUrl}
                    alt={bikeLabel ?? copy.noPhoto}
                    width={960}
                    height={720}
                    className="h-full min-h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-56 flex-col items-center justify-center gap-3 bg-[color:color-mix(in_oklch,var(--secondary)_82%,var(--background)_18%)] p-6 text-center text-[color:var(--muted-foreground)]">
                    <Bike className="h-8 w-8 text-[color:var(--primary)]" />
                    <p className="text-sm">{copy.noPhoto}</p>
                  </div>
                )}
              </div>
            </div>

            <form className="space-y-3" onSubmit={handleQuickMatchSubmit}>
              <QuickCheckInput
                id="bike-quick-check-height"
                label={copy.heightLabel}
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
                placeholder={copy.heightPlaceholder}
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
              <PublicInfoPanel tone="secondary">{copy.previewSupport}</PublicInfoPanel>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  className="min-w-44 bg-[color:var(--primary)] text-white hover:bg-[color:color-mix(in_oklch,var(--primary)_88%,black_12%)]"
                >
                  {copy.previewButton}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--secondary)]"
                  onClick={() => {
                    setMatch(null);
                    setLookup(null);
                    setHeightCm("");
                    setViewState("collapsed");
                  }}
                >
                  {copy.invalidRetry}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {viewState === "loading_match" ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[color:var(--primary)]" />
            <p className="text-sm font-medium text-[color:var(--foreground)]">{copy.previewLoading}</p>
          </div>
        ) : null}

        {viewState === "result" && lookup && match ? (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{copy.resultTitle}</p>
                  <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">{copy.resultSupport}</p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${confidenceTone(
                    match.confidence
                  )}`}
                >
                  {copy.confidenceLabel}: {copy.confidenceLevels[match.confidence]}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_82%,var(--background)_18%)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    {copy.scoreLabel}
                  </p>
                  <p className={`mt-2 text-4xl font-bold ${scoreTone(match.scoreBand)}`}>
                    {match.score}
                    <span className="ml-1 text-2xl text-[color:var(--muted-foreground)]">
                      {copy.scoreSuffix}
                    </span>
                  </p>
                  <p className="mt-3 text-sm font-medium text-[color:var(--foreground)]">
                    {copy.scoreBands[match.scoreBand]}
                  </p>
                </div>

                <div className="space-y-3">
                  <PublicInfoPanel
                    tone={match.confidence === "limited" ? "warning" : "secondary"}
                    title={copy.explanationCodes[match.explanationCode] ?? copy.limitedEstimate}
                  >
                    {copy.limitedEstimate}
                  </PublicInfoPanel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        {copy.inseamEstimateLabel}
                      </p>
                      <p className="mt-1 font-medium text-[color:var(--foreground)]">
                        {match.estimatedInseamCm} cm
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        {copy.geometryLabel}
                      </p>
                      <p className="mt-1 font-medium text-[color:var(--foreground)]">
                        {lookup.geometryQuality === "none"
                          ? copy.geometryWeakNote
                          : copy.geometryQualityLabels[lookup.geometryQuality ?? "none"]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[color:color-mix(in_oklch,var(--primary)_16%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card)_92%)] p-4">
              {user ? (
                <>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{copy.signedInCtaTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">{copy.signedInCtaDescription}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      render={
                        <TrackedCtaLink
                          href={profileHref}
                          locale={locale}
                          pagePath={pagePath}
                          section="bike_quick_check_result_profile"
                          ctaLabel={copy.signedInPrimaryCta}
                        />
                      }
                    >
                      {copy.signedInPrimaryCta}
                    </Button>
                    <Button
                      variant="outline"
                      render={
                        <TrackedCtaLink
                          href={fitHref}
                          locale={locale}
                          pagePath={pagePath}
                          section="bike_quick_check_result_fit"
                          ctaLabel={copy.signedInSecondaryCta}
                        />
                      }
                    >
                      {copy.signedInSecondaryCta}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{copy.ctaTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">{copy.ctaDescription}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      render={
                        <TrackedCtaLink
                          href={loginHref}
                          locale={locale}
                          pagePath={pagePath}
                          section="bike_quick_check_result"
                          ctaLabel={copy.ctaButton}
                          onClick={() => trackPublicFitEvent("bike_public_fit_signup_cta_clicked")}
                        />
                      }
                    >
                      {copy.ctaButton}
                    </Button>
                    <span className="text-sm text-[color:var(--muted-foreground)]">{copy.ctaSecondary}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

          {isExpanded &&
          viewState === "collapsed" ? (
            <form className="mt-4 space-y-3" onSubmit={handleLookupSubmit}>
              <p className="text-sm text-[color:var(--muted-foreground)]">{copy.previewHeightPrompt}</p>
              <QuickCheckInput
                id="bike-quick-check-code"
                label={copy.codeLabel}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={copy.codePlaceholder}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="w-full sm:w-auto">
                  {copy.lookupButton}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsExpanded(false);
                    setCode("");
                  }}
                >
                  {copy.invalidRetry}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
