/* @vitest-environment jsdom */
import type { ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { AdviceItem } from "../../../shared/advice/types";
import { AdviceProgressActions } from "./AdviceProgressActions";
import { getAdviceProgressCopy } from "@/i18n/account/adviceProgress";

vi.mock("@/components/ui", () => ({
  Button: ({ isPending, variant, ...props }: ComponentProps<"button"> & { isPending?: boolean; variant?: string }) => {
    void variant; return <button {...props} aria-busy={isPending} />;
  },
  Input: ({ label, tooltip, helperText, ...props }: ComponentProps<"input"> & { label: string; tooltip?: string; helperText?: string }) => {
    void tooltip; return <label>{label}<input {...props} />{helperText}</label>;
  },
  Textarea: ({ label, tooltip, ...props }: ComponentProps<"textarea"> & { label: string; tooltip?: string }) => {
    void tooltip; return <label>{label}<textarea {...props} /></label>;
  },
  Select: ({ label, tooltip, options, ...props }: ComponentProps<"select"> & { label: string; tooltip?: string; options: {value:string;label:string}[] }) => {
    void tooltip; return <label>{label}<select {...props}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  },
}));
afterEach(cleanup);
const advice: AdviceItem = { id: "report:saddleHeightMm", recordId: "report", key: "saddleHeightMm", source: "recommendations",
  adviceRevision: 10, bikeId: null, value: 700, unit: "mm", range: null, current: 710, difference: -10,
  reliability: { value: 80, reason: "engine_confidence" }, status: "new", date: Date.UTC(2019, 0, 1),
  staleness: { stale: false, status: "current", reasons: [] }, sourceLink: "/fit/session/results", changeOrder: 1 };

it.each(["nl", "en"] as const)("saves the UTC date and optional note without optimistic status in %s", async locale => {
  const copy = getAdviceProgressCopy(locale);
  let resolve!: () => void;
  const save = vi.fn(() => new Promise<void>(done => { resolve = done; }));
  const view = render(<AdviceProgressActions item={advice} locale={locale} onMarkPerformed={save} />);
  fireEvent.click(screen.getByRole("button", { name: copy.mark }));
  fireEvent.change(screen.getByLabelText(copy.date, { exact: false }), { target: { value: "2020-02-03" } });
  fireEvent.change(screen.getByLabelText(copy.note), { target: { value: "  Small adjustment  " } });
  const form = screen.getByRole("form");
  fireEvent.submit(form); fireEvent.submit(form);
  expect(save).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText(copy.note).hasAttribute("readonly")).toBe(true);
  expect(screen.getByLabelText(copy.note).hasAttribute("disabled")).toBe(false);
  expect(save).toHaveBeenCalledWith(advice, { performedAt: Date.UTC(2020, 1, 3), note: "Small adjustment" });
  expect(screen.queryByText(copy.waiting)).toBeNull();
  await act(async () => resolve());
  expect(screen.queryByText(copy.waiting)).toBeNull();
  view.rerender(<AdviceProgressActions item={{ ...advice, status: "waiting_feedback", progress: { key: advice.key, performedAt: Date.UTC(2020, 1, 3) } }}
    locale={locale} onSubmitFeedback={vi.fn()} />);
  expect(screen.getByText(copy.waiting)).toBeTruthy();
  expect(screen.getByRole("button", { name: copy.feedback })).toBeTruthy();
});

it.each(["better", "same", "worse"] as const)("persists explicit %s feedback and optional existing ride, not an inferred result", async result => {
  const save = vi.fn().mockResolvedValue(undefined);
  const copy = getAdviceProgressCopy("nl");
  const item = { ...advice, progress: { key: advice.key, performedAt: Date.UTC(2020, 0, 1) },
    eligibleRideFeedback: [{ id: "ride", date: Date.UTC(2020, 0, 2), note: "Earlier ride note" }] };
  render(<AdviceProgressActions item={item} locale="nl" onSubmitFeedback={save} />);
  fireEvent.click(screen.getByRole("button", { name: copy.feedback }));
  fireEvent.change(screen.getByLabelText(copy.ride), { target: { value: "ride" } });
  fireEvent.submit(screen.getByRole("form"));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toBe(copy.errors.INVALID_FEEDBACK);
  fireEvent.click(screen.getByRole("radio", { name: copy[result] }));
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(save).toHaveBeenCalledWith(item, { result, rideFeedbackId: "ride" }));
  expect(screen.queryByText(copy.performed, { exact: true })).toBeNull();
});

it.each(["AUTH_CHANGED", "ADVICE_CHANGED", "INVALID_DATE", "INVALID_NOTE", "ADVICE_ALREADY_PERFORMED", "FEEDBACK_ALREADY_RECORDED"] as const)("localizes %s without changing stored status", async code => {
  const copy = getAdviceProgressCopy("nl");
  const save = vi.fn().mockRejectedValue(new Error(`Server: ${code}`));
  render(<AdviceProgressActions item={advice} locale="nl" onMarkPerformed={save} />);
  fireEvent.click(screen.getByRole("button", { name: copy.mark }));
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(copy.errors[code]));
  expect(screen.getByRole("alert").className.split(" ")).toContain("text-destructive-text");
  expect(screen.queryByText(copy.waiting)).toBeNull();
});

it("rejects future dates before mutation and never offers actions for uncalculated advice", () => {
  const save = vi.fn();
  const copy = getAdviceProgressCopy("nl");
  const view = render(<AdviceProgressActions item={advice} locale="nl" onMarkPerformed={save} />);
  fireEvent.click(screen.getByRole("button", { name: copy.mark }));
  fireEvent.change(screen.getByLabelText(copy.date, { exact: false }), { target: { value: "2099-01-01" } });
  fireEvent.submit(screen.getByRole("form"));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toBe(copy.errors.INVALID_DATE);
  view.unmount();
  render(<AdviceProgressActions item={{ ...advice, status: "needs_calculation", value: null }} locale="nl" onMarkPerformed={save} />);
  expect(screen.queryByRole("button")).toBeNull();
});
