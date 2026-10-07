import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ clear: vi.fn(), addEventProcessor: vi.fn(), captureMessage: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({
  withScope: (run: (scope: typeof mock) => void) => run(mock), captureMessage: mock.captureMessage,
}));
import { reportBillingAlert } from "./billingAlert";
beforeEach(() => vi.clearAllMocks());
it("sends only the stable billing code and removes ambient sensitive context", () => {
  reportBillingAlert("BILLING_REQUEST_FAILED");
  expect(mock.clear).toHaveBeenCalled();
  expect(mock.captureMessage).toHaveBeenCalledWith("BILLING_REQUEST_FAILED", "error");
  const sanitize = mock.addEventProcessor.mock.calls[0][0];
  expect(sanitize({ event_id: "event", timestamp: 123, user: { id: "private" },
    request: { data: "private" }, breadcrumbs: [{ message: "private" }], extra: { error: "private" },
    exception: { values: [{ value: "private" }] }, tags: { userId: "private" }, contexts: { private: {} },
  })).toEqual({ event_id: "event", timestamp: 123, level: "error", message: "BILLING_REQUEST_FAILED",
    tags: { area: "billing", code: "BILLING_REQUEST_FAILED" } });
});
