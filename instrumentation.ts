import * as Sentry from "@sentry/nextjs";

const commonOptions = {
  tracesSampleRate: 0.1,
  debug: false,
} as const;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      ...commonOptions,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      ...commonOptions,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
