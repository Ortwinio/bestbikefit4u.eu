"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
        <main className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-8 shadow-xl">
            <h1 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
              An unexpected application error occurred. The error was captured for
              investigation.
            </p>
            {error.digest ? (
              <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
                Error ID: {error.digest}
              </p>
            ) : null}
            <div className="mt-6">
              <button
                type="button"
                onClick={reset}
                className="focus-ring inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--primary)] px-4 text-sm font-medium text-[color:var(--primary-foreground)] transition-all duration-200 hover:brightness-110"
              >
                Try again
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
