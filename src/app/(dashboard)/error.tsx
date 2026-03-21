"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, messages } = useDashboardMessages();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full px-4 text-center">
        <div className="mb-8">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-warning" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {messages.errors.generic.title}
          </h1>
          <p className="text-muted-foreground">
            {messages.errors.generic.description}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              {messages.errors.generic.errorIdLabel} {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {messages.errors.generic.retry}
          </Button>
          <Button render={<Link href={withLocalePrefix("/dashboard", locale)} />}>
            <Home className="h-4 w-4 mr-2" />
            {messages.errors.generic.goDashboard}
          </Button>
        </div>
      </div>
    </div>
  );
}
