export const budgets = { "largest-contentful-paint": 2500, "cumulative-layout-shift": 0.1, "total-blocking-time": 200 };
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
export function summarize(reports, expectedUrls, runs = 3) {
  return expectedUrls.map(url => {
    const matches = reports.filter(report => report.requestedUrl.replace(/\/$/, "") === url.replace(/\/$/, ""));
    const valid = matches.filter(report => !report.runtimeError && report.audits?.["http-status-code"]?.score !== 0);
    const metrics = Object.fromEntries(Object.entries(budgets).map(([id, budget]) => {
      const values = valid.map(report => report.audits[id]?.numericValue).filter(Number.isFinite);
      const value = median(values);
      return [id, { values, median: value, budget, pass: values.length === runs && value < budget }];
    }));
    const representative = [...valid].sort((left, right) =>
      Math.abs(left.audits["largest-contentful-paint"]?.numericValue - metrics["largest-contentful-paint"].median)
      - Math.abs(right.audits["largest-contentful-paint"]?.numericValue - metrics["largest-contentful-paint"].median))[0];
    const lcpTables = representative?.audits["largest-contentful-paint-element"]?.details?.items ?? [];
    const lcpElement = lcpTables.flatMap(table => table.items ?? []).find(item => item.node)?.node;
    const blocking = representative?.audits["render-blocking-resources"]?.details?.items ?? [];
    return { url, runs: matches.length, validRuns: valid.length, metrics,
      diagnostics: { representativeFetchTime: representative?.fetchTime, lcpElement,
        renderBlockingResources: blocking.map(({ url, totalBytes, wastedMs }) => ({ url, totalBytes, wastedMs })) },
      pass: valid.length === runs && Object.values(metrics).every(metric => metric.pass),
      errors: matches.filter(report => report.runtimeError).map(report => report.runtimeError) };
  });
}
export function markdown(summary, label) {
  const lines = [`# Lighthouse mobile: ${label}`, "", "Local production lab measurements; not field Core Web Vitals.", "",
    "| Template URL | Runs | Median LCP ms | Median CLS | Median TBT ms | Budget |",
    "| --- | ---: | ---: | ---: | ---: | --- |"];
  for (const row of summary) {
    const metric = id => row.metrics[id].median === null ? "unavailable" : String(Number(row.metrics[id].median.toFixed(3)));
    lines.push(`| ${new URL(row.url).pathname} | ${row.validRuns}/${row.runs} | ${metric("largest-contentful-paint")} | ${metric("cumulative-layout-shift")} | ${metric("total-blocking-time")} | ${row.pass ? "PASS" : "FAIL"} |`);
  }
  lines.push("", "## Follow-up tickets", "");
  let count = 0;
  for (const row of summary) for (const [id, metric] of Object.entries(row.metrics)) {
    if (metric.pass) continue;
    count++;
    const evidence = id === "largest-contentful-paint" && row.diagnostics?.lcpElement
      ? ` Observed LCP element: ${row.diagnostics.lcpElement.selector} (${row.diagnostics.lcpElement.nodeLabel}).`
        + ` ${row.diagnostics.renderBlockingResources.length} render-blocking resources are recorded in the representative run; investigate the critical rendering path before adding image priority.`
      : "";
    lines.push(`- **PERF-${label}-${count}: ${new URL(row.url).pathname} / ${id}** — measured median ${metric.median ?? "unavailable"}; target < ${metric.budget}. Inspect the raw Lighthouse diagnostics, address the dominant cause, and rerun all three mobile samples. ${metric.median === null ? "Collection must succeed before claiming a performance result." : ""}${evidence}`);
  }
  if (!count) lines.push("No median budget violations in this run.");
  return lines.join("\n") + "\n";
}

/** Retain reproducible metric/element evidence without screenshot payloads or the entire network inventory. */
export function compactReport(report) {
  const audits = ["http-status-code", "first-contentful-paint", "largest-contentful-paint", "total-blocking-time",
    "cumulative-layout-shift", "server-response-time", "largest-contentful-paint-element", "lcp-lazy-loaded",
    "layout-shifts", "prioritize-lcp-image", "render-blocking-resources", "font-display", "font-display-insight",
    "lcp-discovery-insight", "lcp-phases-insight", "render-blocking-insight"];
  return { lighthouseVersion: report.lighthouseVersion, requestedUrl: report.requestedUrl, finalUrl: report.finalUrl,
    fetchTime: report.fetchTime, userAgent: report.userAgent, environment: report.environment,
    configSettings: report.configSettings, runtimeError: report.runtimeError, runWarnings: report.runWarnings,
    performanceScore: report.categories?.performance?.score,
    audits: Object.fromEntries(audits.filter(id => report.audits?.[id]).map(id => [id, report.audits[id]])) };
}
