"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { getPdfResponseError } from "@/lib/reports/pdfResponseError";
import { reportClientError } from "@/lib/telemetry";
import { localizeAccountError } from "@/i18n/account/clientErrors";
import { reportErrors } from "@/i18n/account/reportErrors";
import { reportAccessCopy } from "@/i18n/account/reportAccess";
import { isPaidAccessEnforced } from "../../../shared/pricing/flags";

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
  const access = useQuery(api.recommendations.queries.getReportAccess, { sessionId });
  const enforced = isPaidAccessEnforced() || access?.enforced === true;
  const canDownload = !enforced || access?.canDownloadPdf === true;
  const canEmail = !enforced || access?.canEmailReport === true;
  const fullReport = !enforced || access?.fullReport === true;
  const accessCopy = reportAccessCopy[locale];
  const sendFitReport = useAction(api.emails.actions.sendFitReport);
  const objectUrlRef = useRef<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isFetchingPdf, setIsFetchingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    setPdfUrl(null);
    setViewerOpen(false);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [sessionId, locale, canDownload, fullReport]);

  const fetchPdfObjectUrl = useCallback(async () => {
    if (!canDownload) throw new Error(accessCopy.latestOnly);
    if (objectUrlRef.current) {
      return objectUrlRef.current;
    }

    setIsFetchingPdf(true);
    setPdfError(null);
    let localizedFailure = messages.results.errors.pdfGenerateFailed;

    try {
      const response = await fetch(`/api/reports/${sessionId}/pdf?locale=${locale}`, {
        method: "GET",
      });

      if (!response.ok) {
        localizedFailure = getPdfResponseError(response.status, locale);
        throw new Error(localizedFailure);
      }

      const pdfBytes = await response.arrayBuffer();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;
      setPdfUrl(objectUrl);
      return objectUrl;
    } catch (error) {
      const message =
        locale !== "nl" && error instanceof Error
          ? error.message
          : localizedFailure;
      setPdfError(message);
      throw new Error(message);
    } finally {
      setIsFetchingPdf(false);
    }
  }, [locale, messages.results.errors.pdfGenerateFailed, sessionId, canDownload, accessCopy.latestOnly]);

  const handleOpenViewer = async () => {
    setViewerOpen(true);
    try {
      await fetchPdfObjectUrl();
    } catch {
      // The viewer displays the localized response error.
    }
  };

  const handleDownload = async () => {
    try {
      const objectUrl = await fetchPdfObjectUrl();
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `bikefitboost-report-${sessionId}-${locale}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      toast.error({
        description: error instanceof Error ? error.message : messages.results.errors.pdfGenerateFailed,
      });
    }
  };

  const handleSendEmail = async () => {
    if (!canEmail) return;
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
        description: localizeAccountError(reportClientError(error, {
          area: "report-actions",
          action: "sendFitReport",
          operationType: "action",
          subjectId: sessionId,
          metadata: { pagePath, recipientEmail: email },
          userMessage: reportErrors[locale].emailFallback,
        }), locale),
      });
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <>
      <div className={className ?? "flex flex-wrap gap-2"}>
        <Button size="sm" variant="outline" onClick={handleOpenViewer} disabled={!canDownload}>
          <FileText className="h-4 w-4" />
          {messages.fitHistory.viewReport}
        </Button>
        <Button size="sm" variant="outline" onClick={handleDownload} isLoading={isFetchingPdf} disabled={!canDownload}>
          <Download className="h-4 w-4" />
          {fullReport ? messages.results.actions.downloadPdf : accessCopy.corePdf}
        </Button>
        <Button size="sm" variant="outline" onClick={handleSendEmail} isLoading={isEmailing} disabled={!canEmail}>
          <Mail className="h-4 w-4" />
          {messages.results.actions.emailReport}
        </Button>
      </div>
      {enforced && !canDownload && (
        <p className="mt-2 text-sm text-muted-foreground" role="status">
          {access === undefined ? accessCopy.unavailable : accessCopy.latestOnly}
        </p>
      )}

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
              disabled={!pdfUrl || Boolean(pdfError)}
              render={<a href={pdfUrl ?? undefined} target="_blank" rel="noreferrer" />}
            >
              <FileText className="h-4 w-4" />
              {messages.results.viewer.openFullPage}
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} isLoading={isFetchingPdf}>
              <Download className="h-4 w-4" />
              {messages.results.actions.downloadPdf}
            </Button>
            <Button size="sm" variant="outline" onClick={handleSendEmail} isLoading={isEmailing} disabled={!canEmail}>
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
                  <ErrorState title={locale === "nl" ? messages.results.errors.pdfGenerateFailed : undefined} description={pdfError} />
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!pdfUrl || Boolean(pdfError)}
                      render={<a href={pdfUrl ?? undefined} target="_blank" rel="noreferrer" />}
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
              ) : pdfUrl ? (
                <iframe
                  title={messages.results.viewer.iframeTitle}
                  src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
                  className="h-full w-full bg-white"
                  onLoad={() => setPdfError(null)}
                  onError={() => {
                    setPdfError(messages.results.viewer.inlineFailed);
                  }}
                />
              ) : (
                <div role="status" className="p-6">{messages.results.actions.downloadPdf}…</div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
