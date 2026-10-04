export const scenarios = [
  { id: "pricing", family: "pricing", route: "pricing", state: "free" },
  { id: "checkout-choose", family: "checkout", route: "checkout", state: "free" },
  { id: "checkout-account", family: "checkout", route: "checkout", state: "guest", action: "account" },
  { id: "checkout-code", family: "checkout", route: "checkout", state: "guest", action: "code" },
  { id: "checkout-confirm", family: "checkout", route: "checkout", state: "free", action: "confirm" },
  { id: "checkout-stub", family: "checkout", route: "checkout", state: "free", action: "pay" },
  { id: "checkout-success-preview", family: "checkout", route: "checkout", state: "free", query: "preview=success&product=annual" },
  { id: "checkout-personal-preview", family: "checkout", route: "checkout", state: "free", query: "preview=success&product=annual_personal" },
  { id: "checkout-appointment", family: "checkout", route: "checkout", state: "personal", query: "appointment=1" },
  { id: "checkout-failure-preview", family: "checkout", route: "checkout", state: "free", query: "preview=failure" },
  ...["free", "paid", "legacy", "single", "other-bike", "free-older"].map(state => ({
    id: `results-${state}`, family: "account", route: "fit/visual-session/results", state,
  })),
  ...["free", "paid", "single", "renewed", "cancelled", "personal"].map(state => ({ id: `settings-${state}`, family: "account", route: "settings", state })),
  { id: "settings-cancel-stub", family: "account", route: "settings", state: "paid", action: "cancel" },
  ...["free", "paid"].map(state => ({ id: `dashboard-${state}`, family: "account", route: "dashboard", state })),
];

export function matrix(filter = "") {
  return ["nl", "en"].flatMap(locale => [1440, 390].flatMap(width => [false, true].flatMap(enforced =>
    scenarios.filter(scenario => scenario.id.includes(filter)).map(scenario => ({
      ...scenario, locale, width, height: width === 390 ? 844 : 1000, enforced,
      name: `${locale}-${scenario.id}-${enforced ? "on" : "off"}-${width}`,
    })))));
}

export const limitations = [
  "Actual app pages and layouts are bundled with deterministic synthetic auth/Convex data; no board markup is imported.",
  "No live auth, Convex, mail, Stripe, PDF generation, server authorization, metadata, middleware or Next hydration is tested.",
  "Next Link/Image use existing anchor/img adapters. Real app CSS modules and compiled Next global CSS/fonts are used.",
  "Checkout success/failure are explicitly guarded app previews, never a successful payment or an entitlement grant.",
  "Both paid-access flag values are compiled separately; Stripe billing stays disabled. Unknown active queries fail closed.",
  "Only loopback fixture requests are allowed. Stub HTTP replies use the real shared stub implementation; service hooks are local no-ops recorded in the report.",
  "Settings renewal/cancellation fields use synthetic values matching A's published optional metadata; no server lifecycle transitions are performed.",
  "Geometry, runtime errors, query coverage and control dimensions are automated checks. Screenshots still require human visual review.",
];
