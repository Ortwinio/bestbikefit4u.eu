import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3003";
const routes = [
  { id: "home-en", path: "/en" },
  { id: "guide-en", path: "/en/guides/bike-fitting-for-knee-pain" },
  { id: "calculator-en", path: "/en/calculators/bike-fit" },
];

async function measureRoute(page, path) {
  await page.addInitScript(() => {
    window.__seoVitals = {
      cls: 0,
      lcp: null,
      fcp: null,
    };

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__seoVitals.cls += entry.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        window.__seoVitals.lcp = lastEntry.startTime;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        window.__seoVitals.fcp = entry.startTime;
      }
    }).observe({ type: "paint", buffered: true });
  });

  const response = await page.goto(`${baseUrl}${path}`, {
    waitUntil: "networkidle",
  });

  await page.waitForTimeout(1000);

  const payload = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      vitals: window.__seoVitals,
      navigation: navigation
        ? {
            domContentLoaded: navigation.domContentLoadedEventEnd,
            load: navigation.loadEventEnd,
            transferSize: navigation.transferSize,
            encodedBodySize: navigation.encodedBodySize,
            decodedBodySize: navigation.decodedBodySize,
            responseStart: navigation.responseStart,
            requestStart: navigation.requestStart,
          }
        : null,
    };
  });

  return {
    url: response?.url() ?? `${baseUrl}${path}`,
    status: response?.status() ?? null,
    ...payload,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const results = [];
  try {
    for (const route of routes) {
      const page = await context.newPage();
      const metrics = await measureRoute(page, route.path);
      results.push({
        id: route.id,
        path: route.path,
        ...metrics,
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
