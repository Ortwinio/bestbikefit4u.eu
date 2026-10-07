import * as Sentry from "@sentry/nextjs";

type BillingAlertCode = "BILLING_REQUEST_FAILED" | "BILLING_INVALID_JSON" | "BILLING_CANCELLATION_FAILED";

/** Never accept the caught exception: provider errors may contain payment or rider details. */
export function reportBillingAlert(code: BillingAlertCode): void {
  Sentry.withScope((scope) => {
    scope.clear();
    // Strip ambient request, user, breadcrumbs and SDK-enriched context as well as the raw error.
    scope.addEventProcessor((event) => ({
      event_id: event.event_id,
      timestamp: event.timestamp,
      level: "error",
      message: code,
      tags: { area: "billing", code },
    }));
    Sentry.captureMessage(code, "error");
  });
}
