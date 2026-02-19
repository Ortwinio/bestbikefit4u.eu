import { query } from "../_generated/server";
import { v } from "convex/values";

type AggregateRow = {
  key: string;
  value: number;
};

type MarketingEvent = {
  eventType: "cta_click" | "login_code_requested" | "login_verified";
  locale: "en" | "nl";
  pagePath: string;
  section?: string;
  sourceTag?: string;
};

type OccurredAtRangeQuery = {
  gte: (
    field: "occurredAt",
    value: number
  ) => {
    lte: (field: "occurredAt", value: number) => unknown;
  };
};

type MarketingEventsQuery = {
  withIndex: (
    indexName: "by_occurred_at",
    builder: (q: OccurredAtRangeQuery) => unknown
  ) => {
    collect: () => Promise<MarketingEvent[]>;
  };
};

type MarketingEventDb = {
  query: (tableName: "marketingEvents") => MarketingEventsQuery;
};

function incrementCount(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function buildSortedRows(map: Map<string, number>, limit = 25): AggregateRow[] {
  return Array.from(map.entries())
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function toRatePercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

export const getKpiDashboard = query({
  args: {
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const to = args.to ?? Date.now();
    const from = args.from ?? to - 30 * 24 * 60 * 60 * 1000;

    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
      throw new Error("Invalid date range");
    }

    const db = ctx.db as unknown as MarketingEventDb;
    const events = await db
      .query("marketingEvents")
      .withIndex("by_occurred_at", (q) =>
        q.gte("occurredAt", from).lte("occurredAt", to)
      )
      .collect();

    const ctaByLocale = new Map<string, number>();
    const ctaByPage = new Map<string, number>();
    const ctaByPageSection = new Map<string, number>();
    const loginRequestedBySource = new Map<string, number>();
    const loginVerifiedBySource = new Map<string, number>();

    let ctaClicks = 0;
    let loginCodeRequested = 0;
    let loginVerified = 0;

    for (const event of events) {
      if (event.eventType === "cta_click") {
        ctaClicks += 1;
        incrementCount(ctaByLocale, event.locale);
        incrementCount(ctaByPage, event.pagePath);
        incrementCount(
          ctaByPageSection,
          `${event.locale}|${event.pagePath}|${event.section ?? "unknown"}`
        );
        continue;
      }

      if (event.eventType === "login_code_requested") {
        loginCodeRequested += 1;
        incrementCount(loginRequestedBySource, event.sourceTag ?? "direct_or_unknown");
        continue;
      }

      if (event.eventType === "login_verified") {
        loginVerified += 1;
        incrementCount(loginVerifiedBySource, event.sourceTag ?? "direct_or_unknown");
      }
    }

    const ctaByLocaleRows = buildSortedRows(ctaByLocale).map(({ key, value }) => ({
      locale: key,
      clicks: value,
    }));

    const ctaByPageRows = buildSortedRows(ctaByPage).map(({ key, value }) => ({
      pagePath: key,
      clicks: value,
    }));

    const ctaByPageSectionRows = buildSortedRows(ctaByPageSection).map(
      ({ key, value }) => {
        const [locale, pagePath, section] = key.split("|");
        return { locale, pagePath, section, clicks: value };
      }
    );

    const loginSourceRows = Array.from(
      new Set([
        ...loginRequestedBySource.keys(),
        ...loginVerifiedBySource.keys(),
      ])
    )
      .map((sourceTag) => {
        const requested = loginRequestedBySource.get(sourceTag) ?? 0;
        const verified = loginVerifiedBySource.get(sourceTag) ?? 0;
        return {
          sourceTag,
          codeRequested: requested,
          verified,
          completionRatePct: toRatePercent(verified, requested),
        };
      })
      .sort((a, b) => b.codeRequested - a.codeRequested)
      .slice(0, 25);

    return {
      range: { from, to },
      totals: {
        trackedEvents: events.length,
        ctaClicks,
        loginCodeRequested,
        loginVerified,
        loginCompletionRatePct: toRatePercent(loginVerified, loginCodeRequested),
      },
      cta: {
        byLocale: ctaByLocaleRows,
        byPage: ctaByPageRows,
        byPageSection: ctaByPageSectionRows,
      },
      loginFunnel: {
        bySource: loginSourceRows,
      },
    };
  },
});
