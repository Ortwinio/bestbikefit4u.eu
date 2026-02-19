"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { reportClientError } from "@/lib/telemetry";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { extractLocaleFromPathname, withLocalePrefix } from "@/i18n/navigation";
import {
  FitSummaryCard,
  AdjustmentPriorities,
  FrameSizeRecommendation,
  FitNotes,
  PainSolutions,
} from "@/components/results";
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
  const pathname = usePathname();
  const locale = useMemo(
    () => extractLocaleFromPathname(pathname ?? "") ?? DEFAULT_LOCALE,
    [pathname]
  );
  const pagePath = withLocalePrefix(`/fit/${sessionId}/results`, locale);
  const logMarketingEvent = useMarketingEventLogger();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const hasAutoTriggeredGenerationRef = useRef(false);
  const hasTrackedResultsViewRef = useRef(false);

  const session = useQuery(api.sessions.queries.getById, {
    sessionId: sessionId as Id<"fitSessions">,
  });

  const recommendation = useQuery(api.recommendations.queries.getBySession, {
    sessionId: sessionId as Id<"fitSessions">,
  });

  const user = useQuery(api.users.queries.getCurrentUser);

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
      setEmailSent(true);
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
      const response = await fetch(`/api/reports/${sessionId}/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate PDF report.";
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
      anchor.download = `bestbikefit4u-report-${sessionId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Failed to generate PDF report."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (session === undefined || recommendation === undefined) {
    return <LoadingState label="Loading fit results..." />;
  }

  if (session === null) {
    return (
      <EmptyState
        title="Session not found"
        description="The fit session you're looking for doesn't exist."
        action={
          <Link href={withLocalePrefix("/dashboard", locale)}>
            <Button>Go to Dashboard</Button>
          </Link>
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
          title="Questionnaire not completed"
          description="Complete your questionnaire first, then we can generate your fit recommendation."
          action={
            <Link href={withLocalePrefix(`/fit/${sessionId}/questionnaire`, locale)}>
              <Button>Continue Questionnaire</Button>
            </Link>
          }
        />
      );
    }

    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <RefreshCw
          className={`h-12 w-12 text-blue-600 mx-auto mb-4 ${
            isGenerating ? "animate-spin" : ""
          }`}
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Calculating Your Fit
        </h1>
        <p className="text-gray-600">
          We&apos;re analyzing your measurements and preferences to generate
          personalized recommendations...
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
            {generationError ? "Retry Generation" : "Generate Now"}
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
        title={emailSent ? "Email sent" : "Email report"}
        description={
          emailSent
            ? "Check your inbox for your bike fit report."
            : "Send your bike fit recommendations to your email for future reference."
        }
      >
        {emailSent ? (
          <div className="text-center py-2">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
          </div>
        ) : (
          <>
            <Input
              type="email"
              label="Email address"
              tooltip="Enter the email address where you want to receive this report."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            {emailError ? (
              <ErrorState className="mt-3" title="Failed to send report" description={emailError} />
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
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                isLoading={isSending}
                disabled={!email}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Report
              </Button>
            </div>
          </>
        )}
      </AccessibleDialog>

      {/* Header */}
      <div className="mb-8">
        <Link
          href={withLocalePrefix("/dashboard", locale)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900">
            Your Bike Fit Recommendations
          </h1>
        </div>
        <p className="text-gray-600">
          Based on your measurements and riding preferences, here are your
          personalized bike fit settings.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Algorithm version: {recommendation.algorithmVersion}
        </p>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {/* Frame Size */}
        <FrameSizeRecommendation
          recommendations={recommendation.frameSizeRecommendations}
        />

        {/* Main Measurements */}
        <FitSummaryCard
          fit={recommendation.calculatedFit}
          confidenceScore={recommendation.confidenceScore}
        />

        {/* Adjustment Steps */}
        <AdjustmentPriorities priorities={recommendation.adjustmentPriorities} />

        {/* Pain Solutions */}
        {recommendation.painPointSolutions && (
          <PainSolutions solutions={recommendation.painPointSolutions} />
        )}

        {/* Fit Notes */}
        <FitNotes notes={recommendation.fitNotes} />
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap gap-3 pb-8">
        <Button variant="outline" onClick={() => setShowEmailModal(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Email Report
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          isLoading={isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Link href={withLocalePrefix("/fit", locale)}>
          <Button>Start New Fit Session</Button>
        </Link>
      </div>
      {downloadError ? (
        <ErrorState className="mt-2" title="Failed to download PDF" description={downloadError} />
      ) : null}
    </div>
  );
}
