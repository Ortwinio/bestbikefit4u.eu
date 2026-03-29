"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import {
  Button,
  Input,
  AccessibleDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  useToast,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { reportClientError } from "@/lib/telemetry";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
import { trackFeedbackSignal } from "@/components/feedback/feedback-activity";
import { RiderProfileCard } from "./components/RiderProfileCard";
import { PriorityTable } from "./components/PriorityTable";
import { DetailedFitTable } from "./components/DetailedFitTable";
import { AdjustmentSequence } from "./components/AdjustmentSequence";
import { BikeContextCard } from "./components/BikeContextCard";
import { TirePressureSection } from "./components/TirePressureSection";
import { ValidationPlan } from "./components/ValidationPlan";
import {
  ArrowLeft,
  CheckCircle,
  Mail,
  Download,
  RefreshCw,
  Send,
} from "lucide-react";

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { sessionId } = use(params);
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const pagePath = withLocalePrefix(`/fit/${sessionId}/results`, locale);
  const logMarketingEvent = useMarketingEventLogger();
  const reportCopy = getReportV2Copy(locale);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "climbing">("main");
  const hasAutoTriggeredGenerationRef = useRef(false);
  const hasTrackedResultsViewRef = useRef(false);

  const reportSource = useQuery(api.recommendations.queries.getReportV2, {
    sessionId: sessionId as Id<"fitSessions">,
  });

  const user = useQuery(api.users.queries.getCurrentUser);
  const session = reportSource?.session ?? null;
  const recommendation = reportSource?.recommendation ?? null;
  const hasClimbingProfile = Boolean(recommendation?.climbingCalculatedFit);

  // Build the active report source — swap calculatedFit for climbingCalculatedFit when climbing tab is active
  const activeReportSource =
    reportSource && reportSource.recommendation && activeTab === "climbing" && hasClimbingProfile
      ? {
          ...reportSource,
          recommendation: {
            ...reportSource.recommendation,
            calculatedFit: reportSource.recommendation.climbingCalculatedFit!,
          },
        }
      : reportSource;

  const reportPayload =
    activeReportSource && activeReportSource.recommendation
      ? mapReportV2Payload(activeReportSource)
      : null;
  const reportDateLabel = reportPayload
    ? new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(reportPayload.reportDate))
    : null;

  const generateRecommendation = useMutation(
    api.recommendations.mutations.generate
  );

  const sendEmailReport = useAction(api.emails.actions.sendFitReport);

  const handleGenerateRecommendation = useCallback(async () => {
    if (isGenerating) return;

    setGenerationError(null);
    setIsGenerating(true);
    try {
      await generateRecommendation({ sessionId: sessionId as Id<"fitSessions"> });
    } catch (error) {
      setGenerationError(
        reportClientError(error, {
          area: "results",
          action: "generateRecommendation",
          operationType: "mutation",
          subjectId: sessionId,
          metadata: { sessionId },
        })
      );
    } finally {
      setIsGenerating(false);
    }
  }, [generateRecommendation, isGenerating, sessionId]);

  // Generate recommendation if session is complete but no recommendation exists
  useEffect(() => {
    if (
      session &&
      (session.status === "questionnaire_complete" ||
        session.status === "processing") &&
      recommendation === null &&
      !hasAutoTriggeredGenerationRef.current
    ) {
      hasAutoTriggeredGenerationRef.current = true;
      void handleGenerateRecommendation();
    }
  }, [session, recommendation, handleGenerateRecommendation]);

  useEffect(() => {
    if (!recommendation || hasTrackedResultsViewRef.current) {
      return;
    }
    hasTrackedResultsViewRef.current = true;
    trackFeedbackSignal(
      pagePath,
      "view_fit_results",
      "Viewed fit results"
    );
    logMarketingEvent({
      eventType: "funnel_results_view",
      locale,
      pagePath,
      section: "results_page",
    });
  }, [locale, logMarketingEvent, pagePath, recommendation]);

  // Pre-fill email from user
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const handleSendEmail = async () => {
    if (!email || !recommendation) return;

    setIsSending(true);
    setEmailError(null);

    try {
      await sendEmailReport({
        sessionId: sessionId as Id<"fitSessions">,
        recipientEmail: email,
      });
      trackFeedbackSignal(
        pagePath,
        "send_email_report",
        "Sent the fit report by email"
      );
      setEmailSent(true);
      toast.success({ description: messages.common.toasts.reportEmailed });
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSent(false);
      }, 2000);
    } catch (error) {
      logMarketingEvent({
        eventType: "report_send_error",
        locale,
        pagePath,
        section: "results_email_report",
      });
      setEmailError(
        reportClientError(error, {
          area: "results",
          action: "sendFitReport",
          operationType: "action",
          subjectId: sessionId,
          metadata: { sessionId, recipientEmail: email },
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(`/api/reports/${sessionId}/pdf?locale=${locale}`, {
        method: "GET",
      });

      if (!response.ok) {
        let errorMessage = messages.results.errors.pdfGenerateFailed;
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            errorMessage = payload.error;
          }
        } catch {
          // Keep default error message if payload is not JSON.
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `bestbikefit4u-report-${sessionId}-${locale}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      trackFeedbackSignal(
        pagePath,
        "download_pdf_report",
        "Downloaded the fit report PDF"
      );
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : messages.results.errors.pdfGenerateFailed
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (reportSource === undefined) {
    return <LoadingState label={messages.results.loading} />;
  }

  if (session === null) {
    return (
      <EmptyState
        title={messages.results.sessionNotFound.title}
        description={messages.results.sessionNotFound.description}
        action={
          <Button render={<Link href={withLocalePrefix("/dashboard", locale)} />}>
            {messages.results.sessionNotFound.cta}
          </Button>
        }
      />
    );
  }

  if (recommendation === null) {
    const canGenerateRecommendation =
      session.status === "questionnaire_complete" ||
      session.status === "processing";

    if (!canGenerateRecommendation) {
      return (
        <EmptyState
          title={messages.results.questionnaireIncomplete.title}
          description={messages.results.questionnaireIncomplete.description}
          action={
            <Button
              render={
                <Link href={withLocalePrefix(`/fit/${sessionId}/questionnaire`, locale)} />
              }
            >
              {messages.results.questionnaireIncomplete.cta}
            </Button>
          }
        />
      );
    }

    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <RefreshCw
          className={`mx-auto mb-4 h-12 w-12 text-[color:var(--primary)] ${
            isGenerating ? "animate-spin" : ""
          }`}
        />
        <h1 className="mb-4 text-2xl font-bold text-[color:var(--foreground)]">
          {messages.results.processing.title}
        </h1>
        <p className="text-[color:var(--muted-foreground)]">
          {messages.results.processing.description}
        </p>
        {generationError ? (
          <ErrorState className="mt-4 text-left" description={generationError} />
        ) : null}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={handleGenerateRecommendation}
            isLoading={isGenerating}
          >
            {generationError
              ? messages.results.processing.retryCta
              : messages.results.processing.generateNowCta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AccessibleDialog
        open={showEmailModal}
        onClose={() => {
          setEmailError(null);
          setShowEmailModal(false);
        }}
        title={
          emailSent
            ? messages.results.emailDialog.sentTitle
            : messages.results.emailDialog.title
        }
        description={
          emailSent
            ? messages.results.emailDialog.sentDescription
            : messages.results.emailDialog.description
        }
      >
        {emailSent ? (
          <div className="text-center py-2">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-[color:var(--success)]" />
          </div>
        ) : (
          <>
            <Input
              type="email"
              label={messages.results.emailDialog.emailLabel}
              tooltip={messages.results.emailDialog.emailTooltip}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={messages.results.emailDialog.emailPlaceholder}
            />

            {emailError ? (
              <ErrorState
                className="mt-3"
                title={messages.results.emailDialog.errors.sendTitle}
                description={emailError}
              />
            ) : null}

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEmailError(null);
                  setShowEmailModal(false);
                }}
                className="flex-1"
              >
                {messages.common.cancel}
              </Button>
              <Button
                onClick={handleSendEmail}
                isLoading={isSending}
                disabled={!email}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {messages.results.emailDialog.sendCta}
              </Button>
            </div>
          </>
        )}
      </AccessibleDialog>

      <div className="mb-4">
        <Link
          href={withLocalePrefix("/dashboard", locale)}
          className="mb-4 inline-flex items-center text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {messages.results.backToDashboard}
        </Link>
      </div>

      <Card
        variant="bordered"
        className="mb-6 overflow-hidden border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))]"
      >
        <div className="bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_16%,white_84%)_0%,color-mix(in_oklch,var(--secondary)_28%,white_72%)_100%)]">
          <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] lg:items-start">
            <div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)] shadow-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                {reportCopy.sections.about}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
                {reportCopy.introTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
                {reportCopy.introBody}
              </p>
              <p className="mt-4 text-sm font-medium text-[color:var(--foreground)]/85">
                {reportCopy.shell.coverSupport}
              </p>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-white/70 bg-white/88 p-5 shadow-sm backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                    {reportCopy.shell.dateLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                    {reportDateLabel}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                    {messages.results.algorithmVersionLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                    {recommendation.algorithmVersion}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    trackFeedbackSignal(
                      pagePath,
                      "open_email_report",
                      "Opened the fit report email dialog"
                    );
                    setShowEmailModal(true);
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {messages.results.actions.emailReport}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  isLoading={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {messages.results.actions.downloadPdf}
                </Button>
                <Button render={<Link href={withLocalePrefix("/fit", locale)} />}>
                  {messages.results.actions.startNewFit}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Profile tab switcher */}
      {hasClimbingProfile && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab("main")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "main"
                ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)]"
            }`}
          >
            {messages.results.mainProfileTab}
          </button>
          <button
            onClick={() => setActiveTab("climbing")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "climbing"
                ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)]"
            }`}
          >
            {messages.results.climbingProfileTab}
          </button>
        </div>
      )}

      {/* Climbing profile info banner */}
      {activeTab === "climbing" && (
        <div className="mb-4 rounded-lg border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/5 px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
          {messages.results.climbingProfileNote}
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-6">
        {reportPayload ? (
          <>
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>{reportCopy.sections.about}</CardTitle>
                <CardDescription>{reportCopy.shell.aboutBody}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_6%,white_94%)_0%,white_100%)] px-5 py-5">
                  <p className="text-base font-semibold text-[color:var(--foreground)]">
                    {reportCopy.shell.aboutTitle}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    {reportCopy.introBody}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--primary)_18%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card)_92%)] px-5 py-5">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {reportCopy.shell.aboutTitle}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    {reportCopy.shell.aboutBullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--primary)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            <RiderProfileCard
              profile={reportPayload.profile}
              frameTargets={reportPayload.frameTargets}
              copy={reportCopy}
            />
            <BikeContextCard bike={reportPayload.bike} copy={reportCopy} />
            <PriorityTable rows={reportPayload.prioritySummary} copy={reportCopy} />
            <DetailedFitTable rows={reportPayload.detailedFit} copy={reportCopy} />
            <AdjustmentSequence
              steps={reportPayload.adjustmentSequence}
              copy={reportCopy}
            />
            <TirePressureSection
              tirePressure={reportPayload.tirePressure}
              warningMessages={messages.results.pressureInsights.warningMessages}
              copy={reportCopy}
            />
            <ValidationPlan copy={reportCopy} />
            {reportPayload.fitNotes.length ? (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>{reportCopy.sections.fitNotes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
                    {reportPayload.fitNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}
      </div>
      {downloadError ? (
        <ErrorState
          className="mt-6 pb-8"
          title={messages.results.errors.downloadTitle}
          description={downloadError}
        />
      ) : <div className="pb-8" />}
    </div>
  );
}
