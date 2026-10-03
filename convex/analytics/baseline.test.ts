import { describe, expect, it, vi } from "vitest";
import type { QueryCtx } from "../_generated/server";
import { aggregateRiderProfileBaseline, riderProfileBaseline, type BaselineData } from "./baseline";

const DAY = 86_400_000;
const from = Date.UTC(2026, 0, 1);
const to = from + 14 * DAY;
const observed = from + 60 * DAY;
const empty = (): BaselineData => ({ users: [], profiles: [], events: [], states: [], recommendations: [], feedback: [] });
function fixture(): BaselineData {
  return {
    users: [
      { _id: "private-user-1", _creationTime: from, lastLoginAt: from + 5 * DAY },
      { _id: "private-user-2", _creationTime: from + DAY, lastLoginAt: from + 45 * DAY },
      { _id: "private-user-3", _creationTime: from + DAY },
      { _id: "excluded-user", _creationTime: to },
    ],
    profiles: [
      { userId: "private-user-1", heightCm: 181, inseamCm: 83, hasPain: "no", adminNotes: "private-note" },
      { userId: "private-user-2", heightCm: 181 },
    ],
    events: [
      { eventType: "calculator_result_view", sourceTag: "saddle-height", occurredAt: from },
      { eventType: "calculator_login_cta_click", sourceTag: "saddle-height", occurredAt: from + 1 },
      { eventType: "login_verified", sourceTag: "saddle-height", occurredAt: from + 2 },
      { eventType: "login_verified", sourceTag: "person@example.com", occurredAt: from + 2 },
      { eventType: "calculator_result_view", sourceTag: "saddle-height", occurredAt: to },
    ],
    states: [
      { userId: "private-user-1", updatedAt: from },
      { userId: "private-user-1", updatedAt: from + 1 },
      { userId: "private-user-2", updatedAt: from + 2 },
      { userId: "private-user-2", updatedAt: to },
    ],
    recommendations: [{ sessionId: "private-session", createdAt: from }],
    feedback: [
      { sessionId: "private-session", createdAt: from + DAY },
      { sessionId: "private-session", createdAt: from + 2 * DAY },
    ],
  };
}

describe("riderProfileBaseline", () => {
  it("returns aggregate counts and explicit unavailable historical metrics", () => {
    const result = aggregateRiderProfileBaseline(fixture(), from, to, observed);
    expect(result.newUsers).toBe(3);
    expect(result.publicCalculators.find((row) => row.calculator === "saddle-height")).toMatchObject({
      resultViews: 1, loginCtaClicks: 1, verifiedLogins: 1, loginClicksPerResultView: 1,
    });
    expect(result.verifiedLoginsFromCalculators).toBe(1);
    expect(result.profileCompleteness.at7Days).toMatchObject({
      eligibleUsers: 3, medianFilledFieldsAtAge: null, currentMedianFilledFieldsForEligibleUsers: 1,
    });
    expect(result.profileCompleteness.at30Days.medianFilledFieldsAtAge).toBeNull();
    expect(result.accountCalculatorUse).toEqual([{
      month: "2026-01", activeUpdatingUsers: 2, latestUpdatedStateRows: 3,
      rowsPerActiveUpdatingUser: 1.5, medianRowsPerActiveUpdatingUser: 1.5,
    }]);
    expect(result.recommendationFeedback).toEqual({ recommendations: 1, withRideFeedback: 1, share: 1 });
    expect(result.returnWithin30Days).toEqual({
      eligibleUsers: 3, observedReturns: 1, unknownUsers: 2, observedLowerBoundShare: 1 / 3,
    });
  });
  it("does not leak PII keys, arbitrary tags, measurement values or records", () => {
    const result = aggregateRiderProfileBaseline(fixture(), from, to, observed);
    const serialized = JSON.stringify(result);
    for (const sensitive of ["private-user", "private-session", "private-note", "person@example", '"heightCm"', ':181']) {
      expect(serialized).not.toContain(sensitive);
    }
    function check(value: unknown) {
      if (!value || typeof value !== "object") return;
      for (const [key, item] of Object.entries(value)) {
        expect(key).not.toMatch(/^(userId|sessionId|email|name|values|state|_id)$/);
        check(item);
      }
    }
    check(result);
  });
  it("reports undefined rates as null and never invents mature cohorts", () => {
    const data = empty();
    data.users.push({ _id: "new", _creationTime: to - DAY });
    const result = aggregateRiderProfileBaseline(data, from, to, to);
    expect(result.profileCompleteness.at7Days.eligibleUsers).toBe(0);
    expect(result.profileCompleteness.at7Days.currentMedianFilledFieldsForEligibleUsers).toBeNull();
    expect(result.recommendationFeedback.share).toBeNull();
    expect(result.returnWithin30Days.observedLowerBoundShare).toBeNull();
  });
  it("aggregates a read-only fake DB through the internal query", async () => {
    vi.spyOn(Date, "now").mockReturnValue(observed);
    const data = fixture();
    const tables: Record<string, unknown[]> = {
      users: data.users, profiles: data.profiles, marketingEvents: data.events,
      calculatorStates: data.states, recommendations: data.recommendations, rideFeedbackEntries: data.feedback,
    };
    const query = vi.fn((table: string) => {
      const result = { collect: async () => tables[table], withIndex: vi.fn(() => result) };
      return result;
    });
    const handler = (riderProfileBaseline as unknown as {
      _handler: (ctx: QueryCtx, args: { from: number; to: number }) => Promise<unknown>;
    })._handler;
    try {
      const result = await handler({ db: { query } } as unknown as QueryCtx, { from, to });
      expect(result).toEqual(aggregateRiderProfileBaseline(data, from, to, observed));
      expect(query).toHaveBeenCalledTimes(6);
      await expect(handler({ db: { query } } as unknown as QueryCtx, { from: to, to: from }))
        .rejects.toThrow("Invalid baseline date range");
      expect(query).toHaveBeenCalledTimes(6);
    } finally {
      vi.restoreAllMocks();
    }
  });
});
