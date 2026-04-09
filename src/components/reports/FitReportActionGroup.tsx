"use client";

import { useCallback, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { Mail, Download, FileText } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button, Card, CardContent, ErrorState, useToast } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { reportClientError } from "@/lib/telemetry";

type FitReportActionGroupProps = {
  sessionId: Id<"fitSessions">;
  pagePath: string;
  className?: string;
};

export function FitReportActionGroup({
  sessionId,
  pagePath,
  className,
}: FitReportActionGroupProps) {
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const user = useQuery(api.users.queries.getCurrentUser);
  const sendFitReport = useAction(api.emails.actions.sendFitReport);
  const objectUrlRef = useRef<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isFetchingPdf, setIsFetchingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);
  const inlinePdfUrl = `/api/reports/${sessionId}/pdf?locale=${locale}&disposition=inline`;

  const fetchPdfObjectUrl = useCallback(async () => {
    if (objectUrlRef.current) {
      return objectUrlRef.current;
    }

    setIsFetchingPdf(true);
    setPdfError(null);

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
          // Keep the default localized error when the response is not JSON.
        }
        throw new Error(errorMessage);
      }

      const pdfBytes = await response.arrayBuffer();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;
      return objectUrl;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : messages.results.errors.pdfGenerateFailed;
      setPdfError(message);
      throw error;
    } finally {
      setIsFetchingPdf(false);
    }
  }, [locale, messages.results.errors.pdfGenerateFailed, sessionId]);

  const handleOpenViewer = async () => {
    setViewerOpen(true);
    setPdfError(null);
  };

  const handleDownload = async () => {
    try {
      const objectUrl = await fetchPdfObjectUrl();
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `bestbikefit4u-report-${sessionId}-${locale}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch {
      // Error state is already handled in fetchPdfObjectUrl and shown in the viewer.
      toast.error({ description: messages.results.errors.pdfGenerateFailed });
    }
  };

  const handleSendEmail = async () => {
    const email = user?.email?.trim();
    if (!email) {
      toast.error({ description: messages.results.viewer.emailMissing });
      return;
    }

    setIsEmailing(true);
    try {
      await sendFitReport({
        sessionId,
        recipientEmail: email,
      });
      toast.success({ description: messages.common.toasts.reportEmailed });
    } catch (error) {
      toast.error({
        title: messages.results.emailDialog.errors.sendTitle,
        description: reportClientError(error, {
          area: "report-actions",
          action: "sendFitReport",
          operationType: "action",
          subjectId: sessionId,
          metadata: { pagePath, recipientEmail: email },
        }),
      });
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <>
      <div className={className ?? "flex flex-wrap gap-2"}>
        <Button size="sm" variant="outline" onClick={handleOpenViewer}>
          <FileText className="h-4 w-4" />
          {messages.fitHistory.viewReport}
        </Button>
        <Button size="sm" variant="outline" onClick={handleDownload} isLoading={isFetchingPdf}>
          <Download className="h-4 w-4" />
          {messages.results.actions.downloadPdf}
        </Button>
        <Button size="sm" variant="outline" onClick={handleSendEmail} isLoading={isEmailing}>
          <Mail className="h-4 w-4" />
          {messages.results.actions.emailReport}
        </Button>
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent
          showCloseButton
          className="flex h-screen w-screen max-w-none flex-col gap-4 rounded-none p-4 sm:h-[92vh] sm:w-[min(68vw,1040px)] sm:rounded-[var(--radius-xl)] lg:w-[min(56vw,980px)]"
        >
          <DialogHeader className="gap-2 pr-10">
            <DialogTitle className="text-xl font-semibold text-[color:var(--foreground)]">
              {messages.results.viewer.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-[color:var(--muted-foreground)]">
              {messages.results.viewer.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              render={<a href={inlinePdfUrl} target="_blank" rel="noreferrer" />}
            >
              <FileText className="h-4 w-4" />
              {messages.results.viewer.openFullPage}
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} isLoading={isFetchingPdf}>
              <Download className="h-4 w-4" />
              {messages.results.actions.downloadPdf}
            </Button>
            <Button size="sm" variant="outline" onClick={handleSendEmail} isLoading={isEmailing}>
              <Mail className="h-4 w-4" />
              {messages.results.actions.emailReport}
            </Button>
          </div>

          <Card
            variant="bordered"
            className="dashboard-card-surface min-h-0 flex-1 overflow-hidden"
          >
            <CardContent className="flex h-full min-h-0 flex-col p-0">
              {pdfError ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                  <ErrorState description={pdfError} />
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      render={<a href={inlinePdfUrl} target="_blank" rel="noreferrer" />}
                    >
                      <FileText className="h-4 w-4" />
                      {messages.results.viewer.openFullPage}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                      {messages.results.actions.downloadPdf}
                    </Button>
                  </div>
                </div>
              ) : (
                <iframe
                  title={messages.results.viewer.iframeTitle}
                  src={`${inlinePdfUrl}#toolbar=1&navpanes=0&view=FitH`}
                  className="h-full w-full bg-white"
                  onLoad={() => setPdfError(null)}
                  onError={() => {
                    setPdfError(messages.results.viewer.inlineFailed);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
