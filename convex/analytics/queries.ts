import { query } from "../_generated/server";
import { v } from "convex/values";

type AggregateRow = {
  key: string;
  value: number;
};

type MarketingEventType =
  | "cta_click"
  | "login_code_requested"
  | "login_code_resent"
  | "login_verified"
  | "funnel_landing_view"
  | "funnel_login_view"
  | "funnel_profile_view"
  | "funnel_fit_view"
  | "funnel_questionnaire_complete"
  | "funnel_results_view"
  | "login_send_error"
  | "login_verify_error"
  | "questionnaire_complete_error"
  | "report_send_error";

type MarketingEvent = {
  eventType: MarketingEventType;
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
    const funnelCounts: Record<
      | "landingView"
      | "loginView"
      | "profileView"
      | "fitView"
      | "questionnaireComplete"
      | "resultsView",
      number
    > = {
      landingView: 0,
      loginView: 0,
      profileView: 0,
      fitView: 0,
      questionnaireComplete: 0,
      resultsView: 0,
    };
    const stepErrors: Record<
      | "loginSendError"
      | "loginVerifyError"
      | "questionnaireCompleteError"
      | "reportSendError",
      number
    > = {
      loginSendError: 0,
      loginVerifyError: 0,
      questionnaireCompleteError: 0,
      reportSendError: 0,
    };

    let ctaClicks = 0;
    let loginCodeRequested = 0;
    let loginCodeResent = 0;
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

      if (event.eventType === "login_code_resent") {
        loginCodeResent += 1;
        continue;
      }

      if (event.eventType === "login_verified") {
        loginVerified += 1;
        incrementCount(loginVerifiedBySource, event.sourceTag ?? "direct_or_unknown");
        continue;
      }

      if (event.eventType === "funnel_landing_view") {
        funnelCounts.landingView += 1;
        continue;
      }

      if (event.eventType === "funnel_login_view") {
        funnelCounts.loginView += 1;
        continue;
      }

      if (event.eventType === "funnel_profile_view") {
        funnelCounts.profileView += 1;
        continue;
      }

      if (event.eventType === "funnel_fit_view") {
        funnelCounts.fitView += 1;
        continue;
      }

      if (event.eventType === "funnel_questionnaire_complete") {
        funnelCounts.questionnaireComplete += 1;
        continue;
      }

      if (event.eventType === "funnel_results_view") {
        funnelCounts.resultsView += 1;
        continue;
      }

      if (event.eventType === "login_send_error") {
        stepErrors.loginSendError += 1;
        continue;
      }

      if (event.eventType === "login_verify_error") {
        stepErrors.loginVerifyError += 1;
        continue;
      }

      if (event.eventType === "questionnaire_complete_error") {
        stepErrors.questionnaireCompleteError += 1;
        continue;
      }

      if (event.eventType === "report_send_error") {
        stepErrors.reportSendError += 1;
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
        loginCodeResent,
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
      usabilityFunnel: {
        counts: funnelCounts,
        conversionRatePct: {
          landingToLogin: toRatePercent(
            funnelCounts.loginView,
            funnelCounts.landingView
          ),
          loginToProfile: toRatePercent(
            funnelCounts.profileView,
            funnelCounts.loginView
          ),
          profileToFit: toRatePercent(
            funnelCounts.fitView,
            funnelCounts.profileView
          ),
          fitToQuestionnaireComplete: toRatePercent(
            funnelCounts.questionnaireComplete,
            funnelCounts.fitView
          ),
          questionnaireToResults: toRatePercent(
            funnelCounts.resultsView,
            funnelCounts.questionnaireComplete
          ),
        },
      },
      errorsByStep: stepErrors,
    };
  },
});
