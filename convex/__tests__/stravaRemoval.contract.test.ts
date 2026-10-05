import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

const { addHttpRoutes } = vi.hoisted(() => ({ addHttpRoutes: vi.fn() }));
vi.mock("../auth", () => ({ auth: { addHttpRoutes } }));

import crons from "../crons";
import http from "../http";

describe("retired Strava backend contract", () => {
  it("has no integration modules left to register API functions or call Strava", () => {
    const directory = fileURLToPath(new URL("../integrations", import.meta.url));
    const files = existsSync(directory) ? readdirSync(directory, { recursive: true }) : [];
    expect(files.filter((file) => String(file).endsWith(".ts"))).toEqual([]);
    for (const path of ["../http.ts", "../crons.ts"]) {
      expect(readFileSync(new URL(path, import.meta.url), "utf8")).not.toMatch(/strava|integrations/i);
    }
  });

  it("retains auth registration, unsubscribe GET/POST and Stripe POST only", () => {
    expect(addHttpRoutes).toHaveBeenCalledExactlyOnceWith(http);
    expect(http.getRoutes().map(([path, method]) => [path, method])).toEqual([
      ["/emails/unsubscribe", "GET"],
      ["/emails/unsubscribe", "POST"],
      ["/stripe/webhook", "POST"],
    ]);
    expect(http.lookup("/strava/callback", "GET")).toBeNull();
  });

  it("schedules the existing email jobs and pricing expiry without retired integrations", () => {
    expect(JSON.parse((crons as unknown as { export(): string }).export())).toEqual({
      "expire gift invitations and remove recipient details": {
        name: "gifts/mutations:expire",
        args: [{}],
        schedule: { type: "hourly", minuteUTC: 20 },
      },
      "expire pricing entitlements": {
        name: "pricing/internal:expireEntitlements",
        args: [{}],
        schedule: { type: "daily", hourUTC: 0, minuteUTC: 15 },
      },
      "day 1 measuring tips emails": {
        name: "emails/lifecycle:runDay1TipsBatch",
        args: [{}],
        schedule: { type: "daily", hourUTC: 6, minuteUTC: 30 },
      },
      "fit reminder emails": {
        name: "emails/lifecycle:runFitReminderBatch",
        args: [{}],
        schedule: { type: "daily", hourUTC: 7, minuteUTC: 0 },
      },
      "upgrade nudge emails": {
        name: "emails/lifecycle:runUpgradeNudgeBatch",
        args: [{}],
        schedule: { type: "daily", hourUTC: 8, minuteUTC: 0 },
      },
      "win-back emails": {
        name: "emails/lifecycle:runWinbackBatch",
        args: [{}],
        schedule: { type: "weekly", dayOfWeek: "wednesday", hourUTC: 9, minuteUTC: 0 },
      },
      "24h pro nudge emails": {
        name: "emails/fitpass:run24hProNudgeBatch",
        args: [{}],
        schedule: { type: "daily", hourUTC: 10, minuteUTC: 0 },
      },
    });
  });
});
