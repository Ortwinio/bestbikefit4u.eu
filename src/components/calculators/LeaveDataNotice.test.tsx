// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LeaveDataNotice, LEAVE_DATA_NOTICE_KEY } from "./LeaveDataNotice";

const state = vi.hoisted(() => ({ path: "/nl/calculators/saddle-height", touch: false, log: vi.fn() }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => state.log }));
vi.mock("@/lib/cookieConsent", () => ({ canTrackMarketing: () => true }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));
vi.mock("@/i18n/useSharedUiMessages", () => ({ useSharedUiMessages: () => ({ dialogClose: "Close" }) }));

beforeEach(() => {
  sessionStorage.clear();
  state.log.mockClear();
  state.path = "/nl/calculators/saddle-height";
  state.touch = false;
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: state.touch, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(),
  })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("LeaveDataNotice", () => {
  it("opens only on a top exit after data entry and dismisses once per session", async () => {
    const view = render(<LeaveDataNotice locale="nl" hasEnteredData isAuthenticated={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(state.log).not.toHaveBeenCalled();
    fireEvent.mouseOut(document, { clientY: 100 });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.mouseOut(document, { clientY: 0, relatedTarget: document.body });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.mouseOut(document, { clientY: 0 });
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(state.log).toHaveBeenCalledWith({ eventType: "leave_data_notice_shown",
      locale: "nl", pagePath: "/nl/calculators/saddle-height" });
    expect(screen.getByText("Bewaar je gegevens voor de volgende keer")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/nl/login?handoff=1");
    fireEvent.click(screen.getByRole("button", { name: "Nee, bedankt" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(state.log).toHaveBeenCalledWith({ eventType: "leave_data_notice_dismissed",
      locale: "nl", pagePath: "/nl/calculators/saddle-height" });
    view.unmount();
    render(<LeaveDataNotice locale="nl" hasEnteredData isAuthenticated={false} />);
    fireEvent.mouseOut(document, { clientY: 0 });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(sessionStorage.getItem(LEAVE_DATA_NOTICE_KEY)).toBe("shown");
  });

  it("allows Escape dismissal through the shared accessible dialog", async () => {
    state.path = "/en/calculators/saddle-height";
    render(<LeaveDataNotice locale="en" hasEnteredData isAuthenticated={false} />);
    fireEvent.mouseOut(document, { clientY: 0 });
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(state.log).toHaveBeenCalledWith({ eventType: "leave_data_notice_dismissed",
      locale: "en", pagePath: "/en/calculators/saddle-height" });
  });

  it("records the sign-up click without including entered data", async () => {
    state.touch = true;
    render(<LeaveDataNotice locale="nl" hasEnteredData isAuthenticated={false} />);
    const link = await screen.findByRole("link");
    link.addEventListener("click", event => event.preventDefault());
    fireEvent.click(link);
    expect(state.log).toHaveBeenCalledWith({ eventType: "leave_data_notice_signup",
      locale: "nl", pagePath: "/nl/calculators/saddle-height" });
  });

  it("shows a dismissible touch bar only after data entry with an English handoff link", async () => {
    state.touch = true;
    const view = render(<LeaveDataNotice locale="en" hasEnteredData={false} isAuthenticated={false} />);
    expect(screen.queryByRole("complementary")).toBeNull();
    view.rerender(<LeaveDataNotice locale="en" hasEnteredData isAuthenticated={false} />);
    expect(await screen.findByRole("complementary", { name: "Save your measurements for next time" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/en/login?handoff=1");
    fireEvent.click(screen.getByRole("button", { name: "No, thanks" }));
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it.each(["/nl/login", "/en/signup", "/nl/auth/callback", "/en/checkout"])("excludes %s", (path) => {
    state.path = path;
    render(<LeaveDataNotice locale="nl" hasEnteredData isAuthenticated={false} />);
    fireEvent.mouseOut(document, { clientY: 0 });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(sessionStorage.getItem(LEAVE_DATA_NOTICE_KEY)).toBeNull();
  });

  it("never prompts authenticated visitors or visitors without data", () => {
    const view = render(<LeaveDataNotice locale="nl" hasEnteredData isAuthenticated />);
    fireEvent.mouseOut(document, { clientY: 0 });
    expect(screen.queryByRole("dialog")).toBeNull();
    view.rerender(<LeaveDataNotice locale="nl" hasEnteredData={false} isAuthenticated={false} />);
    fireEvent.mouseOut(document, { clientY: 0 });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
