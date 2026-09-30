/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";
import AppInstallPage from "./page";

vi.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

const state = vi.hoisted(() => ({ locale: "nl", authenticated: true, replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: state.replace }) }));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: state.authenticated }),
}));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: state.locale,
    messages: state.locale === "nl" ? nl.dashboard : en.dashboard,
  }),
}));

beforeEach(() => {
  state.locale = "nl";
  state.authenticated = true;
  state.replace.mockReset();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: "Mozilla iPhone CriOS Safari",
  });
});
afterEach(cleanup);

describe("app installation presentation", () => {
  it("shows real Safari guidance and honest unsupported-device copy", () => {
    render(<AppInstallPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("beginscherm");
    expect(screen.getByText(nl.dashboard.settings.appInstall.openInSafariTitle)).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Android" }));
    expect(
      screen.getByText("Voor dit apparaat hebben we nog geen gecontroleerde installatiestappen."),
    ).toBeTruthy();
    expect(screen.queryByText(nl.dashboard.settings.appInstall.openInSafariTitle)).toBeNull();
  });

  it("routes an installed app to the existing authenticated destination", async () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<AppInstallPage />);
    await waitFor(() => expect(state.replace).toHaveBeenCalledWith("/nl/dashboard"));
  });

  it("routes an installed signed-out app to localized login", async () => {
    state.locale = "en";
    state.authenticated = false;
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<AppInstallPage />);
    await waitFor(() => expect(state.replace).toHaveBeenCalledWith("/en/login"));
    expect(screen.getByRole("button", { name: "Sign in" }).getAttribute("href")).toBe("/en/login");
  });
});
