"use client";

import { useEffect } from "react";
import Link from "next/link";
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
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full px-4 text-center">
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {messages.errors.generic.title}
          </h1>
          <p className="text-gray-600">
            {messages.errors.generic.description}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-2">
              {messages.errors.generic.errorIdLabel} {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {messages.errors.generic.retry}
          </Button>
          <Link href={withLocalePrefix("/dashboard", locale)}>
            <Button>
              <Home className="h-4 w-4 mr-2" />
              {messages.errors.generic.goDashboard}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
