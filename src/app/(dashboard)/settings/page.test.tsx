/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import SettingsPage from "./page";
const state = vi.hoisted(() => ({
  loading: false,
  locale: "nl" as "nl" | "en",
  queries: vi.fn(),
  actions: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  signOut: vi.fn(),
  push: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: state.push, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@convex-dev/auth/react", () => ({ useAuthActions: () => ({ signOut: state.signOut }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: state.locale,
    messages: state.locale === "nl" ? nl.dashboard : en.dashboard,
    languageSwitchLabels: nl.common,
  }),
}));
vi.mock("@/components/ui", async (load) => ({
  ...(await load<typeof import("@/components/ui")>()),
  useToast: () => state.toast,
}));
vi.mock("@/components/profile/ProfilePhotoUpload", () => ({ ProfilePhotoUpload: () => <div /> }));
vi.mock("@/components/settings/IPhoneAppInstallCard", () => ({
  IPhoneAppInstallCard: () => <div />,
}));
vi.mock("@/components/layout/LanguageSwitch", () => ({ LanguageSwitch: () => <div /> }));
vi.mock("@/components/ui/ThemeToggle", () => ({ ThemeToggle: () => <div /> }));
vi.mock("@/config/billing", () => ({ isStripeBillingEnabled: () => false }));
vi.mock("convex/react", () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => {
    state.queries(getFunctionName(reference));
    if (getFunctionName(reference).includes("getCurrentUser"))
      return state.loading
        ? undefined
        : {
            _id: "test-user",
            displayName: "Sanne",
            email: "fixture@example.invalid",
            tier: "free",
          };
    throw new Error(`Unexpected query: ${getFunctionName(reference)}`);
  },
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference).includes("deleteAccount") ? state.remove : state.update,
  useAction: state.actions,
}));
beforeEach(() => {
  state.loading = false;
  state.locale = "nl";
  state.queries.mockClear();
  state.actions.mockClear();
  state.update.mockReset().mockResolvedValue(null);
  state.remove.mockReset().mockResolvedValue(null);
  state.push.mockReset();
});
afterEach(cleanup);
describe("account settings", () => {
  it.each(["nl", "en"] as const)("has no Strava UI or integration calls in %s", (locale) => {
    state.locale = locale;
    const { container } = render(<SettingsPage />);
    expect(container.textContent).not.toMatch(/strava/i);
    expect(state.queries.mock.calls.flat()).toEqual(["users/queries:getCurrentUser"]);
    expect(state.actions).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveProperty("value", "Sanne");
    expect(container.querySelector(`a[href="/${locale}/privacy"]`)).toBeTruthy();
  });

  it("shows Dutch validation errors returned by the shared error reporter", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
    state.update.mockRejectedValueOnce(new Error("Invalid display name"));
    render(<SettingsPage />);
    const field = screen.getByRole("textbox", { name: nl.dashboard.settings.account.displayNameLabel });
    fireEvent.change(field, { target: { value: "New name" } });
    fireEvent.blur(field);
    expect(await screen.findByText("Niet opgeslagen")).toBeTruthy();
    expect(field).toHaveProperty("value", "New name");
    fireEvent.click(screen.getByRole("button", { name: "Opnieuw proberen" }));
    expect(await screen.findByText("Opgeslagen")).toBeTruthy();
    expect(screen.queryByText("Please check your input and try again.")).toBeNull();
    logged.mockRestore();
  });
  it("uses a real loading state instead of showing a free account", () => {
    state.loading = true;
    render(<SettingsPage />);
    expect(screen.getByText("Je instellingen worden geladen…")).toBeTruthy();
    expect(screen.queryByText("Betalingen tijdelijk gepauzeerd")).toBeNull();
  });
  it("saves a display name with the existing mutation and shows paused billing", async () => {
    render(<SettingsPage />);
    fireEvent.change(
      screen.getByRole("textbox", { name: nl.dashboard.settings.account.displayNameLabel }),
      {
        target: { value: "New rider name" },
      },
    );
    expect(screen.queryByRole("button", { name: nl.dashboard.settings.account.saveDisplayName })).toBeNull();
    fireEvent.blur(screen.getByRole("textbox", { name: nl.dashboard.settings.account.displayNameLabel }));
    await waitFor(() =>
      expect(state.update).toHaveBeenCalledWith({ displayName: "New rider name" }),
    );
    expect(screen.getByText("Betalingen tijdelijk gepauzeerd")).toBeTruthy();
    expect(screen.queryByText(nl.dashboard.settings.account.upgradeCta)).toBeNull();
  });
  it("requires the existing typed confirmation before deleting", async () => {
    render(<SettingsPage />);
    fireEvent.click(
      screen.getByRole("button", { name: nl.dashboard.profile.dangerZone.deleteAccount }),
    );
    const confirm = screen.getByRole("button", {
      name: nl.dashboard.profile.dangerZone.deleteConfirmCta,
    });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    expect(state.remove).not.toHaveBeenCalled();
    fireEvent.change(
      screen.getByRole("textbox", {
        name: nl.dashboard.profile.dangerZone.deleteConfirmInputLabel,
      }),
      { target: { value: nl.dashboard.profile.dangerZone.deleteConfirmWord } },
    );
    fireEvent.click(confirm);
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith({}));
    await waitFor(() => expect(state.push).toHaveBeenCalledWith("/nl"));
  });
});
