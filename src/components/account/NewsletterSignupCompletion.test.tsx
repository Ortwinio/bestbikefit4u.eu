/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewsletterSignupCompletion } from "./NewsletterSignupCompletion";
import type { NewsletterSignupIntent } from "@/lib/newsletter/signupIntent";
import { NEWSLETTER_INTENT_TTL } from "@/lib/newsletter/signupIntent";

const state = vi.hoisted(() => ({ user: { email: "rider@example.invalid" } as {email?: string} | null | undefined,
  save: vi.fn(), log: vi.fn(), complete: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: () => state.user, useMutation: () => state.save }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => state.log }));

let intent: NewsletterSignupIntent;
beforeEach(() => {
  vi.clearAllMocks();
  state.user = { email: "rider@example.invalid" };
  state.save.mockResolvedValue({ newsletter: true, granted: true });
  intent = { requestId: "request-12345678", locale: "nl", wordingVersion: "newsletter-v1",
    provider: "google", createdAt: Date.now() };
});
afterEach(cleanup);

describe("newsletter signup completion", () => {
  it.each(["nl", "en"] as const)("requires an explicit account confirmation for Google in %s", async locale => {
    render(<NewsletterSignupCompletion intent={intent} locale={locale} verifiedEmail={null} onComplete={state.complete} />);
    expect(screen.getByText("rider@example.invalid")).toBeTruthy();
    expect(state.save).not.toHaveBeenCalled();
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(state.complete).toHaveBeenCalledOnce());
    expect(state.save).toHaveBeenCalledWith({ subscribed: true, source: "signup",
      expectedEmail: "rider@example.invalid", consent: { requestId: intent.requestId, locale, wordingVersion: "newsletter-v1" } });
    expect(state.log).toHaveBeenCalledWith({ eventType: "newsletter_opt_in", locale,
      pagePath: `/${locale}/login`, section: "newsletter" });
  });

  it("persists only after the successful local email verification matches the authenticated address", async () => {
    intent.provider = "email";
    render(<NewsletterSignupCompletion intent={intent} locale="en" verifiedEmail=" RIDER@example.invalid " onComplete={state.complete} />);
    await waitFor(() => expect(state.complete).toHaveBeenCalledOnce());
    expect(state.save).toHaveBeenCalledOnce();
    expect(state.save.mock.calls[0][0].consent.locale).toBe("nl");
  });

  it.each([null, "someone-else@example.invalid"])("does not silently consume an ambiguous email intent (%s)", verifiedEmail => {
    intent.provider = "email";
    render(<NewsletterSignupCompletion intent={intent} locale="en" verifiedEmail={verifiedEmail} onComplete={state.complete} />);
    expect(state.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(state.complete).toHaveBeenCalledOnce();
    expect(state.log).not.toHaveBeenCalled();
  });

  it("keeps the same request ID on retry and logs no grant for a replay after withdrawal", async () => {
    state.save.mockRejectedValueOnce(new Error("lost response"));
    state.save.mockResolvedValueOnce({ newsletter: false, granted: false });
    render(<NewsletterSignupCompletion intent={intent} locale="en" verifiedEmail={null} onComplete={state.complete} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(state.complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button")[0]);
    await waitFor(() => expect(state.complete).toHaveBeenCalledOnce());
    expect(state.save.mock.calls[1][0]).toEqual(state.save.mock.calls[0][0]);
    expect(state.log).not.toHaveBeenCalled();
  });

  it("cannot grant an expired intent or a user without an address", () => {
    intent.createdAt = Date.now() - NEWSLETTER_INTENT_TTL;
    const first = render(<NewsletterSignupCompletion intent={intent} locale="en" verifiedEmail={null} onComplete={state.complete} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(state.complete).toHaveBeenCalledOnce();
    expect(state.save).not.toHaveBeenCalled();
    first.unmount();
    state.user = null;
    render(<NewsletterSignupCompletion intent={intent} locale="nl" verifiedEmail={null} onComplete={state.complete} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(state.save).not.toHaveBeenCalled();
  });

  it("waits for the actual account rather than defaulting its identity", () => {
    state.user = undefined;
    render(<NewsletterSignupCompletion intent={intent} locale="en" verifiedEmail={null} onComplete={state.complete} />);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(state.save).not.toHaveBeenCalled();
  });
});
