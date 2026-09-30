/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";
import FitHistoryPage from "./page";

let locale: Locale = "nl";
let sessions: unknown;

vi.mock("convex/react", () => ({ useQuery: () => sessions }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));
vi.mock("@/components/bikes/BikeWithFitHistory", () => ({
  BikeWithFitHistory: ({ bike, sessions: entries }: {
    bike: { _id: string; name: string } | null;
    sessions: Array<{ session: { _id: string }; recommendation: { _id: string } | null }>;
  }) => (
    <section aria-label={bike?._id ?? "unlinked"}>
      <h2>{bike?.name ?? "No bike"}</h2>
      {entries.map(({ session, recommendation }) => (
        <p key={session._id}>{session._id}:{recommendation?._id ?? "none"}</p>
      ))}
    </section>
  ),
}));

beforeEach(() => { locale = "nl"; sessions = []; });
afterEach(cleanup);

describe("fit history page", () => {
  it.each(["nl", "en"] as const)("keeps a localized heading and empty action in %s", (language) => {
    locale = language;
    render(<FitHistoryPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      locale === "nl" ? "Afstellingsgeschiedenis" : "Bike fitting history"
    );
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/${locale}/fit`);
  });

  it("announces loading without showing an empty account", () => {
    sessions = undefined;
    render(<FitHistoryPage />);
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByText("Nog geen fit-sessies")).toBeNull();
  });

  it.each([null, {}])("renders an unavailable state for invalid query data %s", (value) => {
    sessions = value;
    render(<FitHistoryPage />);
    expect(screen.getByRole("alert").textContent).toContain("Geschiedenis niet beschikbaar");
  });

  it("preserves group order, newest sessions, bike identity and separate unlinked sessions", () => {
    const firstBike = { _id: "bike-a", name: "Same name" };
    const secondBike = { _id: "bike-b", name: "Same name" };
    sessions = [
      { bike: secondBike, session: { _id: "newest", createdAt: 500 }, recommendation: { _id: "report-newest" } },
      { bike: null, session: { _id: "unlinked-new", createdAt: 400 }, recommendation: null },
      { bike: firstBike, session: { _id: "middle", createdAt: 300 }, recommendation: null },
      { bike: secondBike, session: { _id: "oldest-linked", createdAt: 200 }, recommendation: null },
      { bike: null, session: { _id: "unlinked-old", createdAt: 100 }, recommendation: null },
    ];
    render(<FitHistoryPage />);
    expect(screen.getAllByRole("region").map((region) => region.getAttribute("aria-label")))
      .toEqual(["bike-b", "unlinked", "bike-a", "unlinked"]);
    expect(screen.getByRole("region", { name: "bike-b" }).textContent)
      .toBe("Same namenewest:report-newestoldest-linked:none");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
