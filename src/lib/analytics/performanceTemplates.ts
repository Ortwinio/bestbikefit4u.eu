import type { BeforeSendMiddleware } from "@vercel/speed-insights";

export type PerformanceTemplate = "home" | "calculator" | "guide" | "pain" | "pricing" | "login";

/** Coarse public templates only: never send account identifiers or query parameters. */
export function performanceTemplate(pathname: string): PerformanceTemplate | null {
  const path = pathname.replace(/^\/(?:nl|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  if (path === "/") return "home";
  if (path === "/pricing") return "pricing";
  if (path === "/login") return "login";
  if (/^\/calculators\/[^/]+$/.test(path)
    || path === "/tire-pressure-calculator" || path === "/bandenspanning-calculator") return "calculator";
  if (/^\/guides(?:\/[^/]+)?$/.test(path)) return "guide";
  if (/^\/pain(?:\/[^/]+)?$/.test(path)) return "pain";
  return null;
}

export const groupPerformanceEvent: BeforeSendMiddleware = (event) => {
  let url: URL;
  try { url = new URL(event.url); } catch { return null; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const template = performanceTemplate(url.pathname);
  if (!template) return null;
  // Fixed paths make both SDK URL and route dimensions independent of dynamic slugs and user input.
  const route = `/templates/${template}`;
  return { ...event, route, url: new URL(route, url.origin).href };
};
