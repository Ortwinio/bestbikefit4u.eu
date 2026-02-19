"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { reportClientError } from "@/lib/telemetry";
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
  X,
  Send,
} from "lucide-react";

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { sessionId } = use(params);

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Session not found
  if (session === null) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Session Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The fit session you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Processing state
  if (recommendation === null) {
    const canGenerateRecommendation =
      session.status === "questionnaire_complete" ||
      session.status === "processing";

    if (!canGenerateRecommendation) {
      return (
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Questionnaire Not Completed
          </h1>
          <p className="text-gray-600 mb-6">
            Complete your questionnaire first, then we can generate your fit
            recommendation.
          </p>
          <Link href={`/fit/${sessionId}/questionnaire`}>
            <Button>Continue Questionnaire</Button>
          </Link>
        </div>
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
        {generationError && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {generationError}
          </p>
        )}
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
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card variant="bordered" className="w-full max-w-md">
            <CardContent className="pt-6">
              {emailSent ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Email Sent!
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Check your inbox for your bike fit report.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Email Report
                    </h3>
                    <button
                      onClick={() => {
                        setEmailError(null);
                        setShowEmailModal(false);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Send your bike fit recommendations to your email for future
                    reference.
                  </p>

                  <Input
                    type="email"
                    label="Email address"
                    tooltip="Enter the email linked to your BestBikeFit4U account. We'll send the login code here."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

                  {emailError && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-3 rounded-lg">
                      {emailError}
                    </p>
                  )}

                  <div className="flex gap-3 mt-6">
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
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
        <Link href="/fit">
          <Button>Start New Fit Session</Button>
        </Link>
      </div>
      {downloadError && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {downloadError}
        </p>
      )}
    </div>
  );
}
