import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  beforeSend(event) {
    // Scrub email addresses from breadcrumbs and message
    if (event.request?.data) {
      delete event.request.data;
    }
    return event;
  },
});
