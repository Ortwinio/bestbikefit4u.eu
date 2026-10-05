// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { AccountSaddleHeight } from "./AccountSaddleHeight";
import { AccountKneeAngle } from "./AccountKneeAngle";

const mocks = vi.hoisted(() => ({ locale: "en" as "nl" | "en", isLoading: false, isAuthenticated: true, query: vi.fn(), mutation: vi.fn() }));
vi.mock("convex/react", () => ({ useConvexAuth: () => mocks, useQuery: () => mocks.query(), useMutation: () => mocks.mutation }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: mocks.locale }) }));
vi.mock("@/components/calculators/AccountCalculatorBike", () => ({ useAccountCalculatorBike: () => ({ ready: true, bikes: [], bikeId: undefined, setSelected: vi.fn() }) }));
beforeEach(() => { mocks.isLoading = false; mocks.isAuthenticated = true; mocks.query.mockReset(); mocks.mutation.mockReset(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe.each(["nl", "en"] as const)("account route states %s", (locale) => {
  const copy = accountReliabilityMessages[locale];
  beforeEach(() => { mocks.locale = locale; });
  for (const Page of [AccountSaddleHeight, AccountKneeAngle]) {
    it(`${Page.name} waits for auth before querying`, () => {
      mocks.isLoading = true;
      render(<Page />);
      expect(screen.getByRole("status").textContent).toBe(copy.loading);
      expect(mocks.query).not.toHaveBeenCalled();
    });
    it(`${Page.name} shows sign-in without querying when signed out`, () => {
      mocks.isAuthenticated = false;
      render(<Page />);
      expect(screen.getByRole("link", { name: copy.signIn }).getAttribute("href")).toBe(`/${locale}/login`);
      expect(mocks.query).not.toHaveBeenCalled();
    });
    it(`${Page.name} waits for query data without writing defaults`, () => {
      render(<Page />);
      expect(screen.getByRole("status").textContent).toBe(copy.loading);
      expect(mocks.mutation).not.toHaveBeenCalled();
    });
    it(`${Page.name} gives a localised retry state when the query fails`, () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      mocks.query.mockImplementation(() => { throw new Error("offline"); });
      render(<Page />);
      expect(screen.getByRole("alert").textContent).toBe(copy.loadError);
      expect(screen.getByRole("button", { name: copy.retry })).toBeTruthy();
      expect(mocks.mutation).not.toHaveBeenCalled();
    });
  }
});
