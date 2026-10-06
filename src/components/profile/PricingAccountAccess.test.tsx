/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { getAccess, type PricingEntitlement } from "../../../shared/pricing/access";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getUsabilityPaidCopy } from "@/i18n/account/usabilityPaid";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { BikeCreationAccess } from "@/components/bikes/BikeCreationAccess";
import { LegacyReportBadge } from "@/components/bikes/LegacyReportBadge";
import { ProfileRefinements } from "./ProfileRefinements";
import { AccountProfileStrength } from "./AccountProfileStrength";

const state = vi.hoisted(() => ({
  enforced: false, locale: "en" as "en" | "nl", access: undefined as ReturnType<typeof getAccess> | undefined,
  bikes: [] as { _id: string }[], legacy: false, save: vi.fn(), remove: vi.fn(),
}));
vi.mock("../../../shared/pricing/flags", () => ({ isPaidAccessEnforced: () => state.enforced }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("convex/react", () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip") return undefined;
    const name = getFunctionName(reference);
    if (name === "pricing/queries:getAccess") return state.access;
    if (name === "bikes/queries:listSummariesByUser") return state.bikes;
    if (name === "profiles/queries:getMyProvenance") return { profile: { inseamCm: 81, heightCm: 174 }, observations: [] };
    if (name === "recommendations/queries:getReportAccess") return { enforced: state.enforced, legacyFullAccess: state.legacy };
    throw new Error(name);
  },
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference) === "profiles/mutations:removePaidField" ? state.remove : state.save,
}));

beforeEach(() => {
  state.enforced = true; state.locale = "en"; state.bikes = [{ _id: "bike-a" }]; state.legacy = false;
  state.access = getAccess(null, undefined, { enforced: true });
  state.save.mockReset().mockResolvedValue({ status: "saved" }); state.remove.mockReset().mockResolvedValue("profile");
});
afterEach(cleanup);

function paid(productId: PricingEntitlement["productId"] = "single") {
  return getAccess({ entitlements: [{ productId, bikeId: "bike-a", status: "active", startsAt: 1,
    expiresAt: 1000, source: "purchase", appointmentGranted: false }] }, "bike-a", { enforced: true, now: 100 });
}

it("leaves creation and the existing score unchanged when enforcement is off", () => {
  state.enforced = false;
  render(<><BikeCreationAccess><button>Create a real bike</button></BikeCreationAccess>
    <AccountProfileStrength locale="en" placement="mobile" /></>);
  expect(screen.getByRole("button", { name: "Create a real bike" })).toBeTruthy();
  expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe("30");
  expect(screen.queryByText(getPricingAccessCopy("en").bikeLimit)).toBeNull();
});

it.each(["nl", "en"] as const)("explains the one-bike limit and routes to annual checkout in %s", locale => {
  state.locale = locale;
  render(<BikeCreationAccess><button>Create</button></BikeCreationAccess>);
  expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
  expect(screen.getByText(getUsabilityPaidCopy(locale).boundaries["second-bike"].body)).toBeTruthy();
  expect(screen.getByRole("link").getAttribute("href")).toBe(`/${locale}/checkout?product=annual`);
});

it("permits the first real bike and annual additional bikes but not single-fit additional bikes", () => {
  state.bikes = [];
  const view = render(<BikeCreationAccess><button>Create</button></BikeCreationAccess>);
  expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
  state.bikes = [{ _id: "bike-a" }]; state.access = paid();
  view.rerender(<BikeCreationAccess><button>Create</button></BikeCreationAccess>);
  expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
  state.access = paid("annual");
  view.rerender(<BikeCreationAccess><button>Create</button></BikeCreationAccess>);
  expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
});

it("does not present a zero score or a creation form while access loads", () => {
  state.access = undefined;
  render(<><AccountProfileStrength locale="en" placement="mobile" />
    <BikeCreationAccess><button>Create</button></BikeCreationAccess></>);
  expect(screen.queryByRole("meter")).toBeNull();
  expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
});

it("adds the 80% marker to an access-aware live rider score", () => {
  render(<AccountProfileStrength locale="en" placement="sidebar" />);
  expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuetext")).toContain("up to 80 percent");
});

it.each(["nl", "en"] as const)("retains expired refinements without allowing edits, while permitting removal in %s", async locale => {
  render(<ProfileRefinements locale={locale} profile={{ femurLengthCm: 43 } as Doc<"profiles">} access={state.access} />);
  const copy = getPricingAccessCopy(locale);
  expect(screen.getByText("43 cm")).toBeTruthy();
  expect(screen.getByText(copy.retained)).toBeTruthy();
  expect(screen.queryByRole("spinbutton")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: `${copy.remove}: ${copy.fields.femurLengthCm}` }));
  await waitFor(() => expect(state.remove).toHaveBeenCalledWith({ field: "femurLengthCm", expectedCurrentValue: 43 }));
  expect(state.save).not.toHaveBeenCalled();
});

it("saves a guided test through the existing mutation, including a measured zero", async () => {
  render(<ProfileRefinements locale="en" profile={{} as Doc<"profiles">} access={paid()} />);
  fireEvent.click(screen.getByRole("button", { name: /Guided flexibility test/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Add measurement:/ }));
  fireEvent.change(screen.getByRole("slider"), { target: { value: "0" } });
  fireEvent.submit(screen.getByRole("slider").closest("form")!);
  await waitFor(() => expect(state.save).toHaveBeenCalledWith({ field: "flexibilityTestCm", value: 0,
    expectedCurrentValue: null, kind: "measured", method: "single_measurement" }));
});

it("shows legacy markings only with an explicit server marker and enforcement on", () => {
  const props = { sessionId: "session-a" as Id<"fitSessions">, locale: "en" as const };
  const view = render(<LegacyReportBadge {...props} />);
  expect(screen.queryByText("Created with full access")).toBeNull();
  state.legacy = true; view.rerender(<LegacyReportBadge {...props} />);
  expect(screen.getByText("Created with full access")).toBeTruthy();
  state.enforced = false; view.rerender(<LegacyReportBadge {...props} />);
  expect(screen.queryByText("Created with full access")).toBeNull();
});
