/* @vitest-environment jsdom */
import type { ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADVICE_GROUPS, type AdviceGroup, type AdviceItem } from "../../../../../shared/advice/types";
import { advicePageCopy } from "@/i18n/account/advicePage";
import { AdvicePageClient, type RecalculationResult } from "./AdvicePageClient";
import type { AdviceProgressHandlers } from "@/components/profile/AdviceProgressActions";

type ViewProps = { groups: AdviceGroup[]; bikes: Array<{ _id: string; name: string }>;
  locale: "nl" | "en"; onOpenAdvice: (item: AdviceItem) => void } & AdviceProgressHandlers;
const state = vi.hoisted(() => ({
  authenticated: true,
  groups: undefined as AdviceGroup[] | undefined,
  bikes: undefined as ViewProps["bikes"] | undefined,
  query: vi.fn(), recalculate: vi.fn(), interest: vi.fn(), view: vi.fn(),
  perform: vi.fn(), feedback: vi.fn(), userId: "user-one",
  retainDataWhenSkipped: false,
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: state.authenticated }),
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: object | "skip") => {
    const name = getFunctionName(reference);
    state.query(name, args);
    if (args === "skip" && !state.retainDataWhenSkipped) return undefined;
    if (name === "pricing/queries:getAccess") return undefined;
    if (name === "advice/queries:listAdviceGroups") return state.groups;
    if (name === "bikes/queries:listSummariesByUser") return state.bikes;
    if (name === "users/queries:getCurrentUser") return { _id: state.userId };
    throw new Error(`Unexpected query ${name}`);
  },
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(reference);
    if (name === "advice/mutations:recalculateAll") return state.recalculate;
    if (name === "profiles/mutations:recordPromptInterest") return state.interest;
    if (name === "advice/progress:markPerformed") return state.perform;
    if (name === "advice/progress:submitFeedback") return state.feedback;
    throw new Error(`Unexpected mutation ${name}`);
  },
}));
vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }));
vi.mock("@/components/ui", () => ({
  Button: ({ isPending, ...props }: ComponentProps<"button"> & { isPending?: boolean }) =>
    <button {...props} aria-busy={isPending} />,
}));
vi.mock("@/components/profile/AdviceGroupsView", () => ({
  AdviceGroupsView: (props: ViewProps) => {
    state.view(props);
    return <div data-testid="advice-view">{props.groups.map(group =>
      <section key={group.key} data-testid={`group-${group.key}`}>
        {group.items.map(item => <a key={item.id} href={item.sourceLink}
          onClick={event => { event.preventDefault(); props.onOpenAdvice(item); }}>
          {item.key}: {String(item.value)}
        </a>)}
      </section>)}</div>;
  },
}));

function item(overrides: Partial<AdviceItem> = {}): AdviceItem {
  return { id: "old-report:saddleHeightMm", recordId: "old-report", key: "saddleHeightMm", bikeId: "bike-one",
    value: 715, unit: "mm", range: { min: 703, max: 727 }, current: 728, difference: -13,
    reliability: { value: 88, reason: "engine_confidence" }, status: "stale", date: 1700000000000,
    staleness: { stale: true, status: "stale", reasons: [{ field: "inseamCm", reason: "value_changed" }] },
    sourceLink: "/fit/old-session/results", changeOrder: 2, ...overrides };
}

function groups(items: AdviceItem[] = []): AdviceGroup[] {
  return ADVICE_GROUPS.map(key => ({ key, titleKey: key, items: key === "seating" ? items : [], improvements: [] }));
}

function latestView(): ViewProps {
  return state.view.mock.calls.at(-1)![0] as ViewProps;
}

it("passes authenticated identity and the displayed revision without optimistic changes", async () => {
  render(<AdvicePageClient locale="nl" />);
  const record = item({ source: "recommendations", adviceRevision: 123 });
  await latestView().onMarkPerformed!(record, { performedAt: Date.UTC(2026, 9, 3), note: "Done" });
  expect(state.perform).toHaveBeenCalledWith({ source: "recommendations", recordId: record.recordId, key: record.key,
    expectedRevision: 123, expectedUserId: "user-one", performedAt: Date.UTC(2026, 9, 3), note: "Done" });
  await latestView().onSubmitFeedback!(record, { result: "same", rideFeedbackId: "ride" });
  expect(state.feedback).toHaveBeenCalledWith({ source: "recommendations", recordId: record.recordId, key: record.key,
    expectedRevision: 123, expectedUserId: "user-one", result: "same", rideFeedbackId: "ride" });
  expect(latestView().groups).toBe(state.groups);
  expect(latestView().groups[0].items[0].progress).toBeUndefined();
});

it("does not submit progress after sign-out even if stale query data remains", async () => {
  const view = render(<AdvicePageClient locale="en" />);
  state.authenticated = false;
  state.retainDataWhenSkipped = true;
  view.rerender(<AdvicePageClient locale="en" />);
  expect(() => latestView().onMarkPerformed!(item({ source: "recommendations", adviceRevision: 1 }), { performedAt: 1 }))
    .toThrow("AUTH_CHANGED");
  expect(state.perform).not.toHaveBeenCalled();
});

function deferred() {
  let resolve!: (value: RecalculationResult) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<RecalculationResult>((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}

beforeEach(() => {
  state.userId = "user-one";
  state.perform.mockReset().mockResolvedValue(undefined);
  state.feedback.mockReset().mockResolvedValue(undefined);
  state.authenticated = true;
  state.retainDataWhenSkipped = false;
  state.groups = groups([item()]);
  state.bikes = [{ _id: "bike-one", name: "Saved bike" }];
  state.query.mockClear();
  state.view.mockClear();
  state.recalculate.mockReset().mockResolvedValue({ items: [] });
  state.interest.mockReset().mockResolvedValue(null);
});
afterEach(cleanup);

describe("advice route queries and loading", () => {
  it("skips both queries without authentication and never presents fixture advice", () => {
    state.authenticated = false;
    render(<AdvicePageClient locale="en" />);
    expect(state.query.mock.calls).toEqual([
      ["pricing/queries:getAccess", "skip"],
      ["advice/queries:listAdviceGroups", "skip"], ["bikes/queries:listSummariesByUser", "skip"],
      ["users/queries:getCurrentUser", "skip"],
    ]);
    expect(screen.getByRole("status").textContent).toBe(advicePageCopy.en.loading);
    expect(state.view).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).toBeNull();
    expect(state.recalculate).not.toHaveBeenCalled();
    expect(state.interest).not.toHaveBeenCalled();
  });

  it.each(["groups", "bikes"] as const)("waits for %s without rendering fake or partial advice", missing => {
    state[missing] = undefined;
    render(<AdvicePageClient locale="nl" />);
    expect(state.query).toHaveBeenCalledWith("advice/queries:listAdviceGroups", {});
    expect(state.query).toHaveBeenCalledWith("bikes/queries:listSummariesByUser", {});
    expect(screen.getByRole("status").textContent).toBe(advicePageCopy.nl.loading);
    expect(state.view).not.toHaveBeenCalled();
    expect(screen.queryByText(advicePageCopy.nl.empty)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it.each(["nl", "en"] as const)("retains all seven empty groups and a localized calculator link in %s", locale => {
    state.groups = groups();
    state.bikes = [];
    render(<AdvicePageClient locale={locale} />);
    expect(screen.getByRole("heading", { name: advicePageCopy[locale].empty })).toBeTruthy();
    expect(screen.getByRole("link", { name: advicePageCopy[locale].calculators }).getAttribute("href"))
      .toBe(`/${locale}/dashboard#dashboard-calculators-title`);
    expect(latestView()).toMatchObject({ groups: state.groups, bikes: [], locale });
    for (const key of ADVICE_GROUPS) expect(screen.getByTestId(`group-${key}`).textContent).toBe("");
    expect(screen.queryByRole("button")).toBeNull();
    expect(state.recalculate).not.toHaveBeenCalled();
  });

  it("distinguishes stale rows from unknown provenance and saved inputs without changing their data", () => {
    state.groups = groups([item(), item({ id: "legacy", status: "new",
      staleness: { stale: false, status: "unknown", reasons: [{ reason: "legacy_provenance" }] } }),
    item({ id: "inputs", status: "needs_calculation", value: null,
      staleness: { stale: false, status: "current", reasons: [] } })]);
    render(<AdvicePageClient locale="en" />);
    const banner = screen.getByRole("status");
    expect(banner.textContent).toContain(`${advicePageCopy.en.stale}: 1.`);
    expect(banner.textContent).toContain(`${advicePageCopy.en.unknown}: 2.`);
    expect(latestView().groups).toBe(state.groups);
    expect(state.interest).not.toHaveBeenCalled();
  });
});

describe("advice route recalculation", () => {
  it("calls only the real recalculate-all endpoint with empty args and blocks simultaneous submissions", async () => {
    const request = deferred();
    state.recalculate.mockReturnValue(request.promise);
    render(<AdvicePageClient locale="en" />);
    const button = screen.getByRole("button", { name: advicePageCopy.en.recalc });
    act(() => { fireEvent.click(button); fireEvent.click(button); });
    expect(state.recalculate.mock.calls).toEqual([[{}]]);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("button").textContent).toBe(advicePageCopy.en.recalculating);
    expect(screen.getByText(advicePageCopy.en.recalcHint)).toBeTruthy();
    await act(async () => request.resolve({ items: [] }));
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText(advicePageCopy.en.noUpdates)).toBeTruthy();
    expect(state.interest).not.toHaveBeenCalled();
  });

  it("guards recalculation after authentication is lost even if a stale view remains visible", () => {
    const view = render(<AdvicePageClient locale="en" />);
    state.authenticated = false;
    state.retainDataWhenSkipped = true;
    view.rerender(<AdvicePageClient locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: advicePageCopy.en.recalc }));
    expect(state.recalculate).not.toHaveBeenCalled();
    expect(state.query).toHaveBeenCalledWith("advice/queries:listAdviceGroups", "skip");
  });

  it.each(["nl", "en"] as const)("shows mixed %s results and mapped reasons without leaking backend payloads", async locale => {
    state.recalculate.mockResolvedValue({ items: [
      { source: "calculatorStates", id: "private-updated-id", status: "updated" },
      { source: "recommendations", id: "old-report", status: "pending", replacementId: "private-new-session" },
      { source: "gearingSessions", id: "private-skip-id", status: "skipped", reason: "MISSING_CURRENT_INPUTS" },
      { source: "pressureCalculations", id: "private-fail-id", status: "failed", reason: "private@example.com secret-stack" },
      { source: "calculatorStates", id: "private-duplicate-id", status: "skipped", reason: "MISSING_CURRENT_INPUTS" },
    ] } satisfies RecalculationResult);
    render(<AdvicePageClient locale={locale} />);
    fireEvent.click(screen.getByRole("button", { name: advicePageCopy[locale].recalc }));
    const summary = await screen.findByRole("status", { name: advicePageCopy[locale].summary });
    for (const [status, count] of [["updated", 1], ["pending", 1], ["skipped", 2], ["failed", 1]] as const) {
      expect(within(summary).getByText(advicePageCopy[locale][status]).parentElement?.querySelector("dd")?.textContent).toBe(String(count));
    }
    expect(within(summary).getAllByText(advicePageCopy[locale].reasons.MISSING_CURRENT_INPUTS)).toHaveLength(1);
    expect(within(summary).getByText(advicePageCopy[locale].unknownReason)).toBeTruthy();
    expect(within(summary).getByText(advicePageCopy[locale].pendingHint)).toBeTruthy();
    expect(summary.textContent).not.toMatch(/private-|private@|secret-stack|MISSING_CURRENT_INPUTS|recommendations/);
  });

  it.each(Object.keys(advicePageCopy.en.reasons) as Array<keyof typeof advicePageCopy.en.reasons>)("maps reason %s", async reason => {
    state.recalculate.mockResolvedValue({ items: [{ source: "recommendations", id: "old-report", status: "skipped", reason }] });
    render(<AdvicePageClient locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: advicePageCopy.en.recalc }));
    expect(await screen.findByText(advicePageCopy.en.reasons[reason])).toBeTruthy();
  });

  it.each(["pending", "updated", "skipped", "failed"] as const)("preserves old query advice after a %s result until reactive data actually changes", async status => {
    const original = state.groups!;
    const snapshot = structuredClone(original);
    state.recalculate.mockResolvedValue({ items: [{ source: "recommendations", id: "old-report", status,
      ...(status === "pending" ? { replacementId: "new-session" } : {}) }] });
    const view = render(<AdvicePageClient locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: advicePageCopy.en.recalc }));
    await screen.findByRole("status", { name: advicePageCopy.en.summary });
    expect(latestView().groups).toBe(original);
    expect(original).toEqual(snapshot);
    expect(screen.getByRole("link", { name: "saddleHeightMm: 715" }).getAttribute("href")).toBe("/fit/old-session/results");
    expect(screen.getByText(advicePageCopy.en.staleHint, { exact: false })).toBeTruthy();
    state.groups = groups([item({ id: "new-report:saddleHeightMm", recordId: "new-report", value: 710,
      date: 1800000000000, sourceLink: "/fit/new-session/results", status: "new",
      staleness: { stale: false, status: "current", reasons: [] } })]);
    view.rerender(<AdvicePageClient locale="en" />);
    expect(latestView().groups).toBe(state.groups);
    expect(screen.getByRole("link", { name: "saddleHeightMm: 710" }).getAttribute("href")).toBe("/fit/new-session/results");
    expect(screen.queryByText(advicePageCopy.en.staleHint, { exact: false })).toBeNull();
  });

  it("preserves the old report on rejected mutation, suppresses raw errors and permits retry", async () => {
    const snapshot = structuredClone(state.groups);
    state.recalculate.mockRejectedValueOnce(new Error("private@example.com secret-stack"));
    render(<AdvicePageClient locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: advicePageCopy.en.recalc }));
    expect((await screen.findByRole("alert")).textContent).toBe(advicePageCopy.en.recalcError);
    expect(document.body.textContent).not.toContain("private@example.com");
    expect(latestView().groups).toEqual(snapshot);
    expect(screen.getByRole("link", { name: "saddleHeightMm: 715" }).getAttribute("href")).toBe("/fit/old-session/results");
    fireEvent.click(screen.getByRole("button", { name: advicePageCopy.en.recalc }));
    await screen.findByRole("status", { name: advicePageCopy.en.summary });
    expect(state.recalculate).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("value-free advice interest", () => {
  it.each([
    ["saddleHeightMm", "bike-fit"], ["saddleWidthMm", "saddle-width"], ["gearRangePercent", "gearing"],
    ["pressureFrontBar", "tire-pressure"], ["pressureRearBar", "tire-pressure"], ["wattsPerKg", "ftp-wkg"],
    ["speed", "power-speed"], ["climbPower", "climb-planner"], ["fluid", "fuel-hydration"],
    ["crankLength", "crank-length"], ["saddleHeight", "saddle-height"], ["frameSize", "frame-size"],
    ["saddleSetback", "bike-fit"], ["barDrop", "bike-fit"], ["saddleToBarReach", "bike-fit"],
    ["frameStack", "bike-fit"], ["frameReach", "bike-fit"],
    ["ftp-wkg", "ftp-wkg"], ["bike-fit", "bike-fit"],
  ])("records only the calculator when opening %s", async (key, calculator) => {
    state.groups = groups([item({ key })]);
    render(<AdvicePageClient locale="en" />);
    expect(state.interest).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: `${key}: 715` }));
    await waitFor(() => expect(state.interest.mock.calls).toEqual([[{ calculator }]]));
    expect(state.recalculate).not.toHaveBeenCalled();
  });

  it.each(["unrecognized", "constructor", "__proto__"])("ignores unknown or inherited key %s", key => {
    render(<AdvicePageClient locale="en" />);
    act(() => latestView().onOpenAdvice(item({ key, sourceLink: "/tools/unrecognized" })));
    expect(state.interest).not.toHaveBeenCalled();
  });

  it.each(["/tools/bike-fit", "/tools/bike-fit?bikeId=bike-one#result"])("uses the allowlisted source calculator %s without forwarding URL data", sourceLink => {
    render(<AdvicePageClient locale="en" />);
    act(() => latestView().onOpenAdvice(item({ key: "saddleHeight", sourceLink })));
    expect(state.interest.mock.calls).toEqual([[{ calculator: "bike-fit" }]]);
  });

  it("recognizes a known calculator source even for a newly introduced output key", () => {
    render(<AdvicePageClient locale="en" />);
    act(() => latestView().onOpenAdvice(item({ key: "new-output-key", sourceLink: "/tools/ftp-wkg" })));
    expect(state.interest.mock.calls).toEqual([[{ calculator: "ftp-wkg" }]]);
  });

  it("does not replace advice with an error if interest recording fails", async () => {
    state.interest.mockRejectedValue(new Error("private-interest-error"));
    render(<AdvicePageClient locale="en" />);
    await act(async () => fireEvent.click(screen.getByRole("link", { name: "saddleHeightMm: 715" })));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(latestView().groups).toBe(state.groups);
    expect(document.body.textContent).not.toContain("private-interest-error");
  });
});
