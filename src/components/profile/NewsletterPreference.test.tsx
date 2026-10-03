// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewsletterPreference } from "./NewsletterPreference";

const state = vi.hoisted(() => ({ preferences: undefined as undefined | null | { service: boolean; marketing: boolean; newsletter?: boolean }, save: vi.fn(), log: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: () => state.preferences, useMutation: () => state.save }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => state.log }));
beforeEach(() => {
  vi.resetAllMocks();
  state.preferences = { service: true, marketing: true, newsletter: false };
  state.save.mockResolvedValue({ newsletter: true, granted: true });
});
afterEach(cleanup);

describe("profile newsletter preference", () => {
  it("waits for actual data before showing an unchecked control", () => {
    state.preferences = undefined;
    const view = render(<NewsletterPreference locale="en" />);
    expect(screen.getByRole("status").textContent).toContain("Loading");
    expect(screen.queryByRole("checkbox")).toBeNull();
    state.preferences = { service: true, marketing: true };
    view.rerender(<NewsletterPreference locale="en" />);
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe("false");
    expect(state.save).not.toHaveBeenCalled();
  });
  it("requires authentication and never opts in on render", () => {
    state.preferences = null;
    render(<NewsletterPreference locale="en" />);
    expect(screen.getByText("Sign in to manage your newsletter preference.")).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(state.save).not.toHaveBeenCalled();
  });
  it.each(["nl", "en"] as const)("saves explicit consent and logs only a value-free grant in %s", async locale => {
    render(<NewsletterPreference locale={locale} />);
    fireEvent.click(screen.getByRole("checkbox"));
    await screen.findByText(locale === "nl" ? "Je nieuwsbriefvoorkeur is opgeslagen." : "Your newsletter preference has been saved.");
    expect(screen.queryByRole("button", { name: /Save newsletter|Bewaar nieuwsbrief/ })).toBeNull();
    expect(state.save).toHaveBeenCalledExactlyOnceWith({ subscribed: true, source: "profile", consent: { requestId: expect.stringMatching(/^[a-zA-Z0-9_-]{8,128}$/), locale, wordingVersion: "newsletter-v1" } });
    expect(state.log).toHaveBeenCalledExactlyOnceWith({ eventType: "newsletter_opt_in", locale, pagePath: `/${locale}/profile` });
  });
  it("reuses the action UUID after failure and does not log a replay", async () => {
    state.save.mockRejectedValueOnce(new Error("private email details")).mockResolvedValueOnce({ newsletter: false, granted: false });
    render(<NewsletterPreference locale="en" />);
    fireEvent.click(screen.getByRole("checkbox"));
    await screen.findByRole("alert");
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe("true");
    expect(screen.queryByText("private email details")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText("Your newsletter preference has been saved.");
    expect(state.save.mock.calls[1][0].consent.requestId).toBe(state.save.mock.calls[0][0].consent.requestId);
    expect(state.log).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe("false");
  });
  it("discards retry identity when the user makes a new choice", async () => {
    state.save.mockRejectedValueOnce(new Error("offline"));
    render(<NewsletterPreference locale="en" />);
    fireEvent.click(screen.getByRole("checkbox"));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(state.save).toHaveBeenCalledTimes(2));
    expect(state.save.mock.calls[1][0].consent.requestId).not.toBe(state.save.mock.calls[0][0].consent.requestId);
  });
  it("allows unsubscribe without an opt-in event", async () => {
    state.preferences = { service: true, marketing: true, newsletter: true };
    state.save.mockResolvedValue({ newsletter: false, granted: false });
    render(<NewsletterPreference locale="en" />);
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(state.save).toHaveBeenCalledWith(expect.objectContaining({ subscribed: false, source: "profile" })));
    expect(state.log).not.toHaveBeenCalled();
  });
  it("autosaves a checkbox change once, showing pending then saved without a Save button", async () => {
    let finish!: (value: { newsletter: boolean; granted: boolean }) => void;
    state.save.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<NewsletterPreference locale="en" />);
    expect(screen.queryByRole("button")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("status").textContent).toBe("Saving newsletter choice…");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(state.save).toHaveBeenCalledTimes(1);
    expect(state.log).not.toHaveBeenCalled();
    await act(async () => finish({ newsletter: true, granted: true }));
    expect(screen.getByRole("status").textContent).toBe("Your newsletter preference has been saved.");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
