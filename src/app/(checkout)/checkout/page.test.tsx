import { describe, expect, it, vi } from "vitest";
import CheckoutPage from "./page";

vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => "nl" }));
vi.mock("@/components/checkout/CheckoutClient", () => ({ CheckoutClient: () => null }));

describe("checkout return parameters", () => {
  it("passes a session ID for authoritative lookup without converting it to a success preview", async () => {
    const page = await CheckoutPage({ searchParams: Promise.resolve({ session_id: "cs_mock" }) });
    expect(page.props.sessionId).toBe("cs_mock");
    expect(page.props.preview).toBeNull();
    expect(page.props.cancelled).toBe(false);
  });

  it("preserves a cancelled standalone selection for retry", async () => {
    const page = await CheckoutPage({ searchParams: Promise.resolve({ cancelled: "1", product: "personal_fit_standalone" }) });
    expect(page.props.cancelled).toBe(true);
    expect(page.props.initialSelection).toEqual({ product: "personal_fit_standalone", bikeId: "" });
  });

  it("ignores ambiguous array return parameters", async () => {
    const page = await CheckoutPage({ searchParams: Promise.resolve({ session_id: ["cs_first", "cs_second"], cancelled: ["1"] }) });
    expect(page.props.sessionId).toBeUndefined();
    expect(page.props.cancelled).toBe(false);
  });
});
