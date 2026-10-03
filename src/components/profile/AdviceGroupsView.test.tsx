// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ADVICE_GROUPS, type AdviceGroup, type AdviceItem } from "../../../shared/advice/types";
import { getAdviceCopy } from "@/i18n/account/advice";
import { AdviceGroupsView } from "./AdviceGroupsView";

afterEach(cleanup);
afterEach(() => vi.restoreAllMocks());

it("keeps persisted progress visible beside stale qualification and resets with the query revision", () => {
  const current = item({ source: "recommendations", adviceRevision: 1, status: "stale",
    staleness: { stale: true, status: "stale", reasons: [{ reason: "value_changed" }] },
    progress: { key: "saddleHeightMm", performedAt: Date.UTC(2026, 9, 3), feedback: { result: "better", recordedAt: Date.UTC(2026, 9, 4) } } });
  const view = render(<AdviceGroupsView groups={groups([current])} locale="nl" bikes={bikes} onMarkPerformed={vi.fn()} />);
  expect(screen.getByText("Verouderd")).toBeTruthy();
  expect(screen.getByText("Uitgevoerd")).toBeTruthy();
  view.rerender(<AdviceGroupsView groups={groups([item({ source: "recommendations", adviceRevision: 2 })])} locale="nl" bikes={bikes} onMarkPerformed={vi.fn()} />);
  expect(screen.queryByText("Uitgevoerd")).toBeNull();
  expect(screen.getByRole("button", { name: "Markeer als uitgevoerd" })).toBeTruthy();
});

it("retains only an owned bike scope in advice links", () => {
  render(<AdviceGroupsView groups={groups([item({ sourceLink: "/tools/bike-fit?bikeId=bike-1&height=180#private" })])} locale="nl" bikes={bikes} />);
  expect(within(screen.getByRole("article")).getByRole("link").getAttribute("href")).toBe("/nl/tools/bike-fit?bikeId=bike-1");
});
const bikes = [{ _id: "bike-1", name: "My gravel bike" }];
function item(overrides: Partial<AdviceItem> = {}): AdviceItem {
  return { id: "result-1", recordId: "record-1", key: "saddleHeightMm", bikeId: "bike-1", value: 742.5, unit: "mm", range: { min: 740, max: 745 }, current: 730, difference: 12.5, reliability: { value: 85, reason: "engine_confidence" }, status: "new", date: Date.UTC(2026, 9, 3, 12), staleness: { stale: false, status: "current", reasons: [] }, sourceLink: "/fit/session-1/results", changeOrder: 1, ...overrides };
}
function groups(items: AdviceItem[], improvements: AdviceGroup["improvements"] = []): AdviceGroup[] {
  return [{ key: "seating", titleKey: "seating", items, improvements }];
}

it.each(["nl", "en"] as const)("keeps all seven groups, including empty groups, in %s", locale => {
  render(<AdviceGroupsView groups={[]} locale={locale} bikes={[]} />);
  const copy = getAdviceCopy(locale);
  expect(screen.getAllByRole("region")).toHaveLength(7);
  for (const key of ADVICE_GROUPS) expect(screen.getByRole("region", { name: copy.groups[key] })).toBeTruthy();
  expect(screen.getAllByText(copy.empty)).toHaveLength(7);
  expect(screen.queryByText(/\bPro\b|mark done|afgerond/i)).toBeNull();
  const count = within(screen.getByRole("region", { name: copy.groups.seating })).getByText(copy.count(0));
  expect(count.className).toContain("sr-only");
  expect(count.previousElementSibling?.getAttribute("aria-hidden")).toBe("true");
  expect(count.parentElement?.hasAttribute("aria-label")).toBe(false);
});

it.each(["nl", "en"] as const)("renders actual numbers, ranges, dates and engine confidence in %s", locale => {
  render(<AdviceGroupsView groups={groups([item()])} locale={locale} bikes={bikes} />);
  const copy = getAdviceCopy(locale);
  const row = screen.getByRole("article");
  expect(within(row).getByText(locale === "nl" ? "742,5" : "742.5")).toBeTruthy();
  expect(within(row).getByText(locale === "nl" ? "+12,5" : "+12.5")).toBeTruthy();
  for (const value of ["740", "745", "730", "85%"]) expect(within(row).getByText(value)).toBeTruthy();
  expect(within(row).getByText(copy.reliability.engine_confidence)).toBeTruthy();
  expect(row.querySelector("time")?.dateTime).toBe("2026-10-03T12:00:00.000Z");
  expect(row.querySelector("time")?.textContent).toContain(copy.date);
  expect(within(row).getByRole("link").getAttribute("href")).toBe(`/${locale}/fit/session-1/results`);
});

it.each(["nl", "en"] as const)("labels saved inputs as saved, never calculated, in %s", locale => {
  render(<AdviceGroupsView groups={groups([item({ status: "needs_calculation", value: null, range: null, current: null, difference: null, reliability: { value: null, reason: "saved_inputs_only" } })])} locale={locale} bikes={bikes} />);
  const copy = getAdviceCopy(locale);
  const row = screen.getByRole("article");
  expect(row.querySelector("time")?.textContent).toContain(copy.savedDate);
  expect(row.querySelector("time")?.textContent).not.toContain(copy.date);
  expect(within(row).getByText(copy.statuses.needs_calculation)).toBeTruthy();
  expect(within(row).getByText(copy.reliability.saved_inputs_only)).toBeTruthy();
  expect(within(row).getAllByText("—")).toHaveLength(3);
  expect(within(row).queryByText("0%")).toBeNull();
});

it("distinguishes unknown provenance from stale, translating reasons without identifiers", () => {
  render(<AdviceGroupsView groups={groups([
    item({ staleness: { stale: false, status: "unknown", reasons: [{ reason: "legacy_provenance" }] } }),
    item({ id: "stale", key: "power", status: "stale", staleness: { stale: true, status: "stale", reasons: [{ field: "secret_field", reason: "value_changed", bikeId: "private-id" }] } }),
  ])} locale="nl" bikes={bikes} />);
  const copy = getAdviceCopy("nl");
  expect(screen.getByText(copy.statuses.unknown)).toBeTruthy();
  expect(screen.getByText(copy.freshnessUnknown)).toBeTruthy();
  expect(screen.getByText(copy.statuses.stale)).toBeTruthy();
  expect(screen.getByText(`${copy.unknownField}: ${copy.reasons.value_changed}`)).toBeTruthy();
  expect(screen.queryByText(/secret_field|private-id|legacy_provenance|Nieuw/)).toBeNull();
});

it.each(["nl", "en"] as const)("filters %s rider and bike records while retaining seven groups and resets removed bike selection", locale => {
  const data = groups([item(), item({ id: "rider", key: "ftp", bikeId: null })]);
  const view = render(<AdviceGroupsView groups={data} locale={locale} bikes={bikes} />);
  fireEvent.click(screen.getByRole("button", { name: locale === "nl" ? "Rijder" : "Rider" }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("article", { name: "FTP" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: bikes[0].name }));
  expect(screen.getByRole("article", { name: locale === "nl" ? "Zadelhoogte" : "Saddle height" })).toBeTruthy();
  expect(screen.getAllByRole("region")).toHaveLength(7);
  view.rerender(<AdviceGroupsView groups={data} locale={locale} bikes={[]} />);
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByRole("button", { name: locale === "nl" ? "Alles" : "All" }).getAttribute("aria-pressed")).toBe("true");
});

it("sorts actual change order without mutating the response", () => {
  const data = groups([item({ changeOrder: 2 }), item({ id: "first", key: "power", changeOrder: 0 })]);
  render(<AdviceGroupsView groups={data} locale="en" bikes={bikes} />);
  expect(screen.getAllByRole("article").map(row => row.getAttribute("aria-label"))).toEqual(["Power", "Saddle height"]);
  expect(data[0].items[0].changeOrder).toBe(2);
});

it("limits improvements to three positive finite gains, sorted descending with localized fallback", () => {
  const gains = [0, -4, 2.5, 8, 4, 3, Number.NaN];
  const improvements = gains.map((gain, index) => ({ key: `unknown_${index}`, field: `unknown_field_${index}`, gain, sourceLink: "/profile?value=secret" }));
  render(<AdviceGroupsView groups={groups([], improvements)} locale="nl" bikes={[]} />);
  const aside = screen.getByRole("complementary", { name: /Zitpositie:/ });
  const links = within(aside).getAllByRole("link");
  expect(links).toHaveLength(3);
  expect(links.map(link => link.querySelector("span span")?.textContent)).toEqual(["+8", "+4", "+3"]);
  expect(links.every(link => link.getAttribute("href") === "/nl/profile")).toBe(true);
  expect(aside.textContent).not.toMatch(/unknown_|secret/);
  expect(within(aside).getByText(getAdviceCopy("nl").gainNote)).toBeTruthy();
  expect(improvements.map(action => action.gain)).toEqual(gains);
});

it.each(["M-L", "56-57 cm"])("preserves frame string %s without numeric parsing or appended units", frame => {
  render(<AdviceGroupsView groups={groups([item({ key: "frameSize", value: frame, unit: "mm", range: null, current: null, difference: null })])} locale="nl" bikes={bikes} />);
  const row = screen.getByRole("article");
  expect(within(row).getByText(frame)).toBeTruthy();
  expect(within(row).queryByText("mm")).toBeNull();
});

it.each(["nl", "en"] as const)("uses explicit unknown unit and safe unknown advice labels in %s", locale => {
  render(<AdviceGroupsView groups={groups([item({ key: "future_engine_key", unit: "future_unit", date: 1e20, current: null, difference: null, range: null })])} locale={locale} bikes={bikes} />);
  const copy = getAdviceCopy(locale);
  expect(screen.getByRole("article", { name: copy.unknownAdvice })).toBeTruthy();
  expect(screen.getByText(copy.unknownUnit)).toBeTruthy();
  expect(screen.getByText(copy.unknownDate)).toBeTruthy();
  expect(screen.queryByText(/future_engine_key|future_unit/)).toBeNull();
});

it("preserves zero and negative values and notifies callback with the unmodified item", () => {
  const record = item({ value: 0, difference: -2.5, reliability: { value: 0, reason: "engine_confidence" }, sourceLink: "/en/fit/session-1/results?height=180#value" });
  const onOpenAdvice = vi.fn();
  render(<AdviceGroupsView groups={groups([record])} locale="nl" bikes={bikes} onOpenAdvice={onOpenAdvice} />);
  expect(within(screen.getByRole("article")).getByText("0")).toBeTruthy();
  expect(screen.getByText("0%")).toBeTruthy();
  expect(screen.getByText("-2,5")).toBeTruthy();
  const link = within(screen.getByRole("article")).getByRole("link");
  expect(link.getAttribute("href")).toBe("/nl/fit/session-1/results");
  link.addEventListener("click", event => event.preventDefault());
  fireEvent.click(link);
  expect(onOpenAdvice).toHaveBeenCalledWith(record);
});

it("localizes every current recalculated bike-fit output", () => {
  const keys = ["saddleSetback", "barDrop", "saddleToBarReach", "frameStack", "frameReach"];
  render(<AdviceGroupsView groups={groups(keys.map(key => item({ id: key, key })))} locale="nl" bikes={bikes} />);
  expect(screen.getAllByRole("article").map(row => row.getAttribute("aria-label"))).toEqual(["Zadelterugstand", "Zadel–stuur-drop", "Zadel–stuur-reach", "Aanbevolen stack", "Aanbevolen reach"]);
});

it.each(["__proto__", "constructor"])("rejects inherited dictionary keys such as %s without rendering raw keys", key => {
  render(<AdviceGroupsView groups={groups([item({ key, unit: key, range: null, current: null, difference: null, staleness: { stale: true, status: "stale", reasons: [{ field: key, reason: "value_changed" }] } })], [{ key, field: key, gain: 2.5, sourceLink: "/profile" }])} locale="nl" bikes={bikes} />);
  const copy = getAdviceCopy("nl");
  expect(screen.getByRole("article", { name: copy.unknownAdvice })).toBeTruthy();
  expect(screen.getByText(copy.unknownUnit)).toBeTruthy();
  expect(screen.getByText(`${copy.unknownField}: ${copy.reasons.value_changed}`)).toBeTruthy();
  const action = within(screen.getByRole("complementary", { name: /Zitpositie:/ })).getByRole("link");
  expect(within(action).getByText(copy.unknownField)).toBeTruthy();
  expect(within(action).getByText("+2,5")).toBeTruthy();
  expect(screen.queryByText(key)).toBeNull();
});

it.each(["nl", "en"] as const)("formats UTC day boundaries consistently in %s regardless of host timezone", locale => {
  const nativeFormat = Date.prototype.toLocaleDateString;
  const format = vi.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(function (this: Date, locales, options) {
    return nativeFormat.call(this, locales, { timeZone: "America/Los_Angeles", ...options });
  });
  const timestamp = Date.UTC(2026, 9, 3, 0, 30);
  render(<AdviceGroupsView groups={groups([item({ date: timestamp })])} locale={locale} bikes={bikes} />);
  const date = screen.getByRole("article").querySelector("time");
  const expected = nativeFormat.call(new Date(timestamp), locale === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  expect(date?.textContent).toBe(`${getAdviceCopy(locale).date} ${expected}`);
  expect(date?.dateTime).toBe("2026-10-03T00:30:00.000Z");
  expect(format).toHaveBeenCalledWith(locale === "nl" ? "nl-NL" : "en-GB", expect.objectContaining({ timeZone: "UTC" }));
});

it.each(["__proto__", "constructor", "future_reason"])("handles an untrusted reliability reason %s with translated fallback", reason => {
  const record = item();
  Object.defineProperty(record.reliability, "reason", { value: reason });
  render(<AdviceGroupsView groups={groups([record])} locale="nl" bikes={bikes} />);
  expect(screen.getByText(getAdviceCopy("nl").reliability.unknown)).toBeTruthy();
  expect(screen.queryByText(reason)).toBeNull();
});
