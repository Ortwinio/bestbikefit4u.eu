import type { Locale } from "@/i18n/config";
import { llmsCopy } from "@/i18n/marketing/llms";
import { AUTHORSHIP } from "@/config/authorship";
import { BRAND } from "@/config/brand";
import { getFitAnswer } from "./calculatorAnswers/fit";
import { getEquipmentAnswer } from "./calculatorAnswers/equipment";
import { getPerformanceAnswer } from "./calculatorAnswers/performance";
import { getGuideRewrite } from "@/lib/guides/rewrites";
import { PAIN_PAGES } from "@/content/painPages";
import { engineCopy, methodsCopy, stackCopy } from "@/i18n/marketing/science";
import { authorshipMessages } from "@/i18n/marketing/authorship";
import { pressureBikeLandingMessages } from "@/i18n/marketing/pressureBikeLanding";
import { BIKE_TYPE_DEFAULTS, BIKE_TYPE_LABELS, parsePressureBikeSlug } from "./programmatic/tirePressure";

export interface LlmsContent {
  title: string;
  answer: string;
  method?: string;
  limits?: string;
}

/** Resolves public editorial content only. No browser, account, CMS or request-state reads. */
export function getLlmsContent(pathname: string, locale: Locale): LlmsContent {
  const copy = llmsCopy[locale];
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  const tool = path.startsWith("/calculators/") ? path.slice("/calculators/".length)
    : ["/tire-pressure-calculator", "/bandenspanning-calculator"].includes(path) ? "tire-pressure" : undefined;
  if (tool && Object.hasOwn(copy.tools, tool)) {
    let answer;
    switch (tool) {
      case "bike-fit": case "saddle-height": case "frame-size": case "crank-length":
        answer = getFitAnswer(tool, locale); break;
      case "saddle-width": case "gearing": case "tire-pressure":
        answer = getEquipmentAnswer(tool, locale); break;
      case "power-speed": case "climb-planner": case "ftp-wkg": case "fuel-hydration":
        answer = getPerformanceAnswer(tool, locale); break;
    }
    if (answer) return { title: copy.tools[tool as keyof typeof copy.tools],
      answer: answer.answer, method: answer.method, limits: answer.limits };
  }
  if (path.startsWith("/guides/")) {
    const rewrite = getGuideRewrite(path.slice("/guides/".length));
    return rewrite ? { title: rewrite[locale].title, answer: rewrite[locale].quickAnswer }
      : { title: copy.pages.guides.title, answer: copy.dynamic };
  }
  if (path === AUTHORSHIP.path) return { title: AUTHORSHIP.name, answer: BRAND.name };
  if (path === "/methods") {
    const methods = authorshipMessages[locale];
    return { title: methods.methodsTitle.split(" | ")[0], answer: methods.intro,
      method: [methods.scientificBody, methods.practiceBody, methods.ownBody, methods.pressureRule].join(" "),
      limits: methods.limits };
  }
  const science = path === "/science/bike-fit-methods" ? methodsCopy[locale]
    : path === "/science/calculation-engine" ? engineCopy[locale]
      : path === "/science/stack-and-reach" ? stackCopy[locale] : undefined;
  if (science) return { title: science.hero.title, answer: science.hero.description };
  if (path.startsWith("/pain/")) {
    const pain = PAIN_PAGES.find(page => page.slug === path.slice("/pain/".length))?.[locale];
    if (pain) return { title: pain.title, answer: pain.intro };
  }
  if (/^\/(?:tire-pressure|bandenspanning)\/[^/]+$/.test(path)) {
    const slug = path.slice(path.lastIndexOf("/") + 1);
    const bike = parsePressureBikeSlug(slug, locale);
    if (bike) {
      const pressure = pressureBikeLandingMessages[locale];
      const defaults = BIKE_TYPE_DEFAULTS[bike];
      const surface = pressure.surfaces[defaults.surface as keyof typeof pressure.surfaces];
      return { title: pressure.title(BIKE_TYPE_LABELS[bike][locale]), answer: pressure.intro,
        method: `${pressure.width}: ${defaults.widthFrontMm} / ${defaults.widthRearMm} mm. `
          + `${pressure.surface}: ${surface}. ${pressure.goal}: ${pressure.balanced}. ${pressure.tableHint}`,
        limits: pressure.limits };
    }
  }
  if (path.startsWith("/blog/")) return { title: copy.pages.blog.title, answer: copy.dynamic };
  const pageKey = path === "/" ? "home" : path.slice(1);
  const page = Object.hasOwn(copy.pages, pageKey) ? copy.pages[pageKey as keyof typeof copy.pages] : undefined;
  return page ? { title: page.title, answer: page.summary } : { title: BRAND.name, answer: copy.generic };
}
