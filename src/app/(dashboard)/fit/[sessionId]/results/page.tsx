"use client";
import { localizeAccountError } from "@/i18n/account/clientErrors";
import { fitAuditCopy, getFitReportCopy, localizeFitNotes } from "@/i18n/account/fitAudit";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getFitResultsCopy } from "@/i18n/account/fitResults";
import { FitResultsOverview } from "@/components/account/FitResultsOverview";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
import { getPdfResponseError } from "@/lib/reports/pdfResponseError";
import { isReportAccessOpen } from "@/config/commercial";
import { trackFeedbackSignal } from "@/components/feedback/feedback-activity";
import { RiderProfileCard } from "./components/RiderProfileCard";
import { PriorityTable } from "./components/PriorityTable";
import { DetailedFitTable } from "./components/DetailedFitTable";
import { AdjustmentSequence } from "./components/AdjustmentSequence";
import { BikeContextCard } from "./components/BikeContextCard";
import { TirePressureSection } from "./components/TirePressureSection";
import { ValidationPlan } from "./components/ValidationPlan";
import { CaseStudyOptIn } from "@/components/features/casestudy/CaseStudyOptIn";
import { FitPassPaywall } from "@/components/features/fitpass/FitPassPaywall";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = withLocalePrefix(`/fit/${sessionId}/results`, locale);
  const logMarketingEvent = useMarketingEventLogger();
  const reportCopy = getFitReportCopy(locale);
  const pageCopy = getFitResultsCopy(locale);

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
  const sessionAccess = useQuery(api.fitPass.queries.getSessionAccess, {
    sessionId: sessionId as Id<"fitSessions">,
  });
  const session = reportSource?.session ?? null;
  const recommendation = reportSource?.recommendation ?? null;
  const hasClimbingProfile = Boolean(recommendation?.climbingCalculatedFit);
  const hasPaidReportAccess = Boolean(
    isReportAccessOpen() ||
      sessionAccess?.hasAccess ||
      user?.tier === "pro" ||
      user?.tier === "premium"
  );

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
  if (reportPayload && locale === "nl" && !activeReportSource?.bike?.name?.trim()) {
    reportPayload.bike.name = fitAuditCopy.nl.unnamedBike;
  }
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
        localizeAccountError(reportClientError(error, {
          area: "results",
          action: "generateRecommendation",
          userMessage: fitAuditCopy[locale].error,
          operationType: "mutation",
          subjectId: sessionId,
          metadata: { sessionId },
        }), locale)
      );
    } finally {
      setIsGenerating(false);
    }
  }, [generateRecommendation, isGenerating, sessionId, locale]);

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

  // Handle checkout success redirect
  useEffect(() => {
    if (!searchParams) return;
    const checkoutParam = searchParams.get("checkout");
    if (checkoutParam !== "success") return;

    const storageKey = `fitpass_success_shown_${sessionId}`;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "1");
    toast.success({
      description: reportCopy.shell.fitPassActivated,
    });
    // Clean checkout params from URL
    const cleanParams = new URLSearchParams(searchParams.toString());
    cleanParams.delete("checkout");
    cleanParams.delete("checkout_session_id");
    const cleanPath = cleanParams.toString()
      ? `${window.location.pathname}?${cleanParams.toString()}`
      : window.location.pathname;
    router.replace(cleanPath);
  }, [
    searchParams,
    sessionId,
    toast,
    reportCopy.shell.fitPassActivated,
    router,
  ]);

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
        localizeAccountError(reportClientError(error, {
          area: "results",
          action: "sendFitReport",
          userMessage: fitAuditCopy[locale].error,
          operationType: "action",
          subjectId: sessionId,
          metadata: { sessionId, recipientEmail: email },
        }), locale)
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
        setDownloadError(getPdfResponseError(response.status, locale));
        return;
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
        locale !== "nl" && error instanceof Error
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
          <Button nativeButton={false} role="link" render={<Link href={withLocalePrefix("/dashboard", locale)} />}>
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
              nativeButton={false} role="link"
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
          className={`mx-auto mb-4 h-12 w-12 text-primary ${
            isGenerating ? "animate-spin" : ""
          }`}
        />
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          {messages.results.processing.title}
        </h1>
        <p className="text-muted-foreground">
          {messages.results.processing.description}
        </p>
        {generationError ? (
          <ErrorState className="mt-4 text-left" title={locale === "nl" ? fitAuditCopy.nl.error : undefined} description={generationError} />
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
    <div className="mx-auto min-w-0 max-w-[1080px] space-y-6">
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
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-primary" />
          </div>
        ) : (
          <>
            <Input
              type="email"
              className="min-h-11"
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

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  setEmailError(null);
                  setShowEmailModal(false);
                }}
                className="min-h-12 flex-1 whitespace-normal"
              >
                {messages.common.cancel}
              </Button>
              <Button
                onClick={handleSendEmail}
                isLoading={isSending}
                disabled={!email}
                className="min-h-12 flex-1 whitespace-normal"
              >
                <Send className="h-4 w-4 mr-2" />
                {messages.results.emailDialog.sendCta}
              </Button>
            </div>
          </>
        )}
      </AccessibleDialog>

      <Link
        href={withLocalePrefix("/dashboard", locale)}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
        {messages.results.backToDashboard}
      </Link>

      <header className="flex flex-col gap-5 rounded-[28px] bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] lg:flex-row lg:items-center lg:justify-between sm:p-8">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.08em]">{pageCopy.eyebrow}</p>
          <h1 className="text-[var(--bbf-inkt)] mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-[42px]">{pageCopy.title}</h1>
          <p className="mt-3">{reportPayload?.bike.name}</p>
        </div>
        <Button nativeButton={false} role="link" render={<Link href={withLocalePrefix("/fit", locale)} />} className="min-h-12 shrink-0 whitespace-normal" style={{ backgroundColor: "var(--bbf-inkt)", color: "var(--bbf-wit)" }}>
          {messages.results.actions.startNewFit}
        </Button>
      </header>

      {hasClimbingProfile && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={pageCopy.profileChoice}>
          {(["main", "climbing"] as const).map((tab) => (
            <Button key={tab} variant="outline" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}
              className="min-h-11 whitespace-normal"
              style={activeTab === tab ? { backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" } : undefined}>
              {tab === "main" ? messages.results.mainProfileTab : messages.results.climbingProfileTab}
            </Button>
          ))}
        </div>
      )}
      {activeTab === "climbing" && <p className="rounded-2xl bg-primary-soft p-4 text-sm leading-relaxed">{messages.results.climbingProfileNote}</p>}

      {reportPayload && activeReportSource?.recommendation && (
        <FitResultsOverview
          locale={locale} copy={reportCopy} report={reportPayload}
          fit={activeReportSource.recommendation.calculatedFit}
          profileLabel={activeTab === "main" ? messages.results.mainProfileTab : messages.results.climbingProfileTab}
          hasPaidAccess={hasPaidReportAccess}
        />
      )}

      <section className="flex flex-col gap-5 rounded-3xl bg-[var(--bbf-inkt)] p-6 text-white xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-bold text-white">{pageCopy.reportTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--bbf-op-donker)]">{pageCopy.reportBody}</p>
        </div>
        <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="min-h-12 whitespace-normal border-white/40 bg-transparent text-white hover-only:hover:bg-white/10"
                      onClick={() => {
                        if (!hasPaidReportAccess) {
                          toast.info({
                            description: reportCopy.paywall.emailUpgradeToast,
                          });
                          return;
                        }
                        trackFeedbackSignal(
                          pagePath,
                          "open_email_report",
                          "Opened the fit report email dialog"
                        );
                        setShowEmailModal(true);
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {hasPaidReportAccess
                        ? messages.results.actions.emailReport
                        : reportCopy.paywall.emailUpgradeButton}
                    </Button>
                    {hasPaidReportAccess ? (
                      <Button
                        variant="outline"
                      className="min-h-12 whitespace-normal border-white/40 bg-transparent text-white hover-only:hover:bg-white/10"
                        onClick={handleDownloadPdf}
                        isLoading={isDownloading}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {messages.results.actions.downloadPdf}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                      className="min-h-12 whitespace-normal border-white/40 bg-transparent text-white hover-only:hover:bg-white/10"
                        disabled
                        onClick={() => {
                          toast.info({
                            description: reportCopy.paywall.pdfUpgradeToast,
                          });
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {reportCopy.paywall.pdfUpgradeButton}
                      </Button>
                    )}

        </div>
      </section>
      {downloadError && <ErrorState title={messages.results.errors.downloadTitle} description={downloadError} />}

      {!hasPaidReportAccess && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>
                    {reportCopy.shell.unlockTitle}
                  </CardTitle>
                  <CardDescription>
                    {reportCopy.shell.unlockDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {reportCopy.shell.unlockItems.map((item) => (
                    <div
                      key={item}
                      className="dashboard-card-surface-muted rounded-[var(--radius-lg)] border border-dashed px-4 py-4 text-sm text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
      )}

      <details className="group rounded-3xl border border-border bg-card p-5 sm:p-6">
        <summary className="min-h-11 cursor-pointer rounded-lg py-3 font-display text-xl font-bold focus-visible:outline-2 focus-visible:outline-primary">{pageCopy.detailsTitle}</summary>
        <dl className="mt-4 flex flex-wrap gap-6 text-sm"><div><dt className="text-muted-foreground">{reportCopy.shell.dateLabel}</dt><dd>{reportDateLabel}</dd></div><div><dt className="text-muted-foreground">{messages.results.algorithmVersionLabel}</dt><dd className="font-mono">{recommendation.algorithmVersion}</dd></div></dl>
        <div className="mt-6 space-y-6">
        {reportPayload ? (
          <>
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>{reportCopy.sections.about}</CardTitle>
                <CardDescription>{reportCopy.shell.aboutBody}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
                <div className="dashboard-card-surface rounded-[var(--radius-lg)] border px-5 py-5">
                  <p className="text-base font-semibold text-foreground">
                    {reportCopy.shell.aboutTitle}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {reportCopy.introBody}
                  </p>
                </div>
                <div className="dashboard-card-surface-muted rounded-[var(--radius-lg)] border px-5 py-5">
                  <p className="text-sm font-semibold text-foreground">
                    {reportCopy.shell.aboutTitle}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {reportCopy.shell.aboutBullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            <RiderProfileCard
              rider={reportPayload.rider}
              profile={reportPayload.profile}
              frameTargets={reportPayload.frameTargets}
              copy={reportCopy}
            />
            <BikeContextCard bike={reportPayload.bike} copy={reportCopy} />
            <PriorityTable rows={reportPayload.prioritySummary} copy={reportCopy} />
            {hasPaidReportAccess ? (
              <>
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
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {localizeFitNotes(reportPayload.fitNotes, locale).map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : (
              null
            )}
          </>
        ) : null}
        </div>
      </details>
      <div className="space-y-6 [&_button]:min-h-11 [&_a]:min-h-11">
        {user && session && (
          <CaseStudyOptIn
            locale={locale}
            sessionId={sessionId}
            userEmail={user.email ?? ""}
          />
        )}
        {user && !hasPaidReportAccess && (
          <FitPassPaywall locale={locale} sessionId={sessionId} userTier={user.tier} />
        )}
      </div>

    </div>
  );
}
