import { analyzeDutchText, collectDutchLanguage } from "./nl-language.mjs";

/** Browser checks shared by live public pages and rendered account fixtures. */
export const CHECK_NAMES = [
  "status", "errors", "overflow", "h1", "locale", "seo", "language", "touchTargets", "images", "axe",
];

export const LANGUAGE_LEAKS = {
  nl: ["Save", "Sign in", "Loading", "Settings", "Intermediate", "Balanced", "hrs/week"],
  en: ["Opslaan", "Inloggen", "Instellingen"],
};

export function findLanguageLeaks(text, locale) {
  return (LANGUAGE_LEAKS[locale] ?? []).filter((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "iu").test(text);
  });
}

const result = (details = []) => ({ status: details.length ? "fail" : "pass", details });
const skip = (reason) => ({ status: "skip", details: [reason] });

export async function checkPage(page, options) {
  const {
    locale, viewportWidth, publicPage = true, errors = [], axeResults = null,
    axeUnavailableReason = "Axe was not run; installing @axe-core/playwright requires lead approval.",
    expectedStatus = 200, status = 200, expectedRedirect = null, finalUrl = page.url(), seoUnavailableReason = null,
    requiredAlternateLocales = ["nl", "en"],
  } = options;
  const measured = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
      if (!element.getClientRects().length || bounds.width <= 0 || bounds.height <= 0) return false;
      // The sweep captures the initial, unfocused page at scroll zero. Hidden skip links above it
      // are not visible targets; controls farther down the document still need to be checked.
      if (bounds.bottom + scrollY <= 0) return false;
      // Screen-reader-only controls are represented by their visible labels or custom widgets.
      const clipped = style.clip !== "auto" || style.clipPath !== "none";
      if (clipped && bounds.width <= 1 && bounds.height <= 1) return false;
      return true;
    };
    const describe = (element) => ({
      tag: element.tagName.toLowerCase(),
      label: (element.getAttribute("aria-label") || element.innerText || element.getAttribute("name") || "")
        .trim().replace(/\s+/g, " ").slice(0, 120),
      id: element.id || undefined,
      href: element.getAttribute("href") || undefined,
    });
    const interactive = [...document.querySelectorAll(
      "a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[tabindex]",
    )].filter((element) => {
      if (!visible(element) || element.matches(":disabled,[aria-disabled=true],[tabindex='-1']")) return false;
      // A text link embedded in a prose paragraph is exempt. Navigation and isolated links are checked.
      if (element.matches("a") && element.closest("p,li") && getComputedStyle(element).display === "inline") {
        const parent = element.closest("p,li");
        if (parent.innerText.trim() !== element.innerText.trim() && !parent.closest("nav")) return false;
      }
      return true;
    });
    const touchTargets = interactive.flatMap((element) => {
      const bounds = element.getBoundingClientRect();
      // Associated labels may supply the clickable area of native radios and checkboxes.
      const labels = element.matches("input[type=checkbox],input[type=radio]") ? [...element.labels ?? []] : [];
      if (labels.some((label) => {
        const size = label.getBoundingClientRect();
        return visible(label) && size.width >= 44 && size.height >= 44;
      })) return [];
      return bounds.width < 44 || bounds.height < 44
        ? [{ ...describe(element), width: Math.round(bounds.width * 10) / 10,
          height: Math.round(bounds.height * 10) / 10 }]
        : [];
    });
    const images = [...document.images].filter(visible).flatMap((element) => {
      const issues = [];
      if (!element.hasAttribute("alt")) issues.push("missing alt");
      if (!element.complete || element.naturalWidth === 0) issues.push("broken or unloaded image");
      return issues.length ? [{ src: element.currentSrc || element.src, issues }] : [];
    });
    const overflowing = [...document.body.querySelectorAll("*")].filter(visible).flatMap((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.right > innerWidth + 1 || bounds.left < -1 ? [describe(element)] : [];
    }).slice(0, 20);
    return {
      width: innerWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      overflowing,
      h1Count: document.querySelectorAll("h1").length,
      lang: document.documentElement.lang,
      canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((element) => element.href),
      alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((element) => ({
        lang: element.hreflang, href: element.href,
      })),
      text: document.body.innerText,
      touchTargets,
      images,
    };
  });
  const accepted = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  const statusDetails = accepted.includes(status) ? [] : [`HTTP ${status}; expected ${accepted.join(" or ")}`];
  if (expectedRedirect && new URL(finalUrl).pathname !== expectedRedirect) {
    statusDetails.push(`Redirect landed on ${new URL(finalUrl).pathname}; expected ${expectedRedirect}`);
  }
  const expected404 = status === 404 && accepted.includes(404);
  const seoDetails = [];
  if (measured.canonical.length !== 1) seoDetails.push(`Expected one canonical; found ${measured.canonical.length}`);
  for (const language of requiredAlternateLocales) {
    if (!measured.alternates.some((alternate) => alternate.lang === language && alternate.href)) {
      seoDetails.push(`Missing ${language} hreflang alternate`);
    }
  }
  const axeDetails = axeResults?.violations?.filter((item) => ["serious", "critical"].includes(item.impact))
    .map(({ id, impact, description, helpUrl, nodes }) => ({
      id, impact, description, helpUrl,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
  const languageChunks = locale === "nl" ? await collectDutchLanguage(page) : [];
  const browserLanguageDiagnostics = languageChunks.filter(chunk =>
    chunk.kind === "validation-message" && chunk.browserGenerated === true).map(chunk => ({ ...chunk,
    reason: "Browser-generated validation language is controlled by the browser installation, not app copy." }));
  const dutchFindings = locale === "nl" ? languageChunks.flatMap((chunk) => {
    const evidence = analyzeDutchText(chunk.text, chunk);
    return evidence ? [{ ...chunk, ...evidence }] : [];
  }) : null;
  const checks = {
    status: result(statusDetails),
    errors: result(errors),
    overflow: result(measured.scrollWidth > measured.width
      ? [{ width: measured.width, scrollWidth: measured.scrollWidth, elements: measured.overflowing }] : []),
    h1: result(measured.h1Count === 1 ? [] : [`Expected one h1; found ${measured.h1Count}`]),
    locale: result(measured.lang === locale ? [] : [`html lang=${measured.lang}; expected ${locale}`]),
    seo: seoUnavailableReason ? skip(seoUnavailableReason)
      : !publicPage || expected404 ? skip("Canonical/hreflang not required on account or expected 404 pages.")
      : result(seoDetails),
    language: { ...result(dutchFindings ?? findLanguageLeaks(measured.text, locale)),
      environmentDiagnostics: browserLanguageDiagnostics },
    touchTargets: viewportWidth === 390 ? result(measured.touchTargets) : skip("Mobile-only check."),
    images: result(measured.images),
    axe: axeDetails ? result(axeDetails) : skip(axeUnavailableReason),
  };
  if (expected404) {
    for (const name of ["h1", "locale", "language", "touchTargets", "images", "axe"]) {
      if (name === "language" && locale === "nl") continue;
      checks[name] = skip("Expected locale-specific 404; content checks do not apply.");
    }
  }
  return checks;
}
