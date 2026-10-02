/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitch } from "./LanguageSwitch";
import { MarketingLanguageSwitch } from "./MarketingNavigation";

const mocks = vi.hoisted(() => ({ authenticated: true, save: vi.fn(), push: vi.fn() }));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: mocks.authenticated }),
  useMutation: () => mocks.save,
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/guides",
  useSearchParams: () => new URLSearchParams("source=test"),
  useRouter: () => ({ push: mocks.push }),
}));
afterEach(cleanup);
beforeEach(() => {
  mocks.authenticated = true;
  mocks.save.mockReset().mockResolvedValue(null);
  mocks.push.mockReset();
});

describe.each(["account", "marketing"])("%s language switch", (variant) => {
  function mount() {
    render(variant === "account"
      ? <LanguageSwitch locale="en" labels={{ language: "Language", english: "English", dutch: "Dutch" }} />
      : <MarketingLanguageSwitch locale="en" />);
  }

  it("saves immediately before navigating with the existing query", async () => {
    let finish!: () => void;
    mocks.save.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    mount();
    fireEvent.click(screen.getByRole("link", { name: "Dutch" }));
    expect(mocks.save).toHaveBeenCalledWith({ locale: "nl" });
    expect(mocks.push).not.toHaveBeenCalled();
    finish();
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("/nl/guides?source=test")));
  });

  it("keeps anonymous navigation as a link without a mutation", () => {
    mocks.authenticated = false;
    mount();
    const link = screen.getByRole("link", { name: "Dutch" });
    expect(link.getAttribute("href")).toBe("/nl/guides?source=test");
    fireEvent.click(link, { ctrlKey: true });
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("does not block navigation when saving fails", async () => {
    mocks.save.mockRejectedValue(new Error("Session expired"));
    mount();
    fireEvent.click(screen.getByRole("link", { name: "Dutch" }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
  });

  it("also persists an explicit English selection", async () => {
    mount();
    fireEvent.click(screen.getByRole("link", { name: "English" }));
    expect(mocks.save).toHaveBeenCalledWith({ locale: "en" });
    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
  });
});
