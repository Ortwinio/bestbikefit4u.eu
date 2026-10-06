export const RULES = [
  "Account reason and next step below the result", "Collapsed explanations remain in server HTML",
  "Two routes, progress and known inputs", "Homepage routes and eleven one-click calculators",
  "One-row mobile header and unobscured navigation", "Paid at natural limits with a price",
  "Different contextual paid presentations", "Examples disappear for edited or reused values",
  "Numeric values use sliders", "Measurement method is preselected", "Shared tyre-pressure presentation",
  "No upgrade overlays or urgency", "Safety remains visible", "Real features and current prices",
  "44px targets and accessible contrast",
];

export function checkRules(page, metrics) {
  const checks = [];
  const add = (rule, applicable, passed, evidence) => checks.push({ rule, title: RULES[rule - 1],
    status: !applicable ? "not-applicable" : passed ? "pass" : "fail", evidence });
  const calculator = page.kind === "calculator";
  const home = page.kind === "home";
  const sticky = metrics.stickyBar;
  const stickyVisible = sticky?.initial?.visible === true;
  const stickyDismissible = sticky?.ownerException?.rule === 12
    && sticky.ownerException.reference === "U1-BAR" && stickyVisible
    && sticky.cookieUndecided?.visible === false && sticky.dismissed?.visible === false
    && sticky.dismissed.dismissedInSession === "1" && sticky.revisit?.visible === false
    && sticky.revisit.dismissedInSession === "1" && sticky.storageDenied?.visible === false;
  const stickyReserved = stickyVisible && Number.isFinite(sticky.initial.rect?.height)
    && sticky.initial.bodyPaddingBottom >= sticky.initial.rect.height - 0.5
    && sticky.footer?.footerOverlap === false && sticky.footer.occludedFooterControls?.length === 0;
  const explanation = calculator || page.kind === "content";
  const welcome = /^welcome(?:-flag-off|-paid)?$/.test(page.id) && page.kind === "account";
  const headerAction = page.kind === "checkout" ? metrics.checkoutBack : metrics.menu;
  const welcomeLogo = metrics.welcomeLogo;
  const welcomeProgress = metrics.welcomeProgress;
  const welcomeNavigation = Boolean(metrics.header && welcomeLogo && welcomeProgress
    && welcomeLogo.width >= 43.5 && welcomeLogo.height >= 43.5
    && welcomeProgress.width > 0 && welcomeProgress.height > 0
    && /^(?:Stap\s+1\s+van\s+2|Step\s+1\s+of\s+2)\b/i.test(welcomeProgress.text ?? "")
    && [welcomeLogo, welcomeProgress].every(element => element.top >= metrics.header.top - 0.5
      && element.bottom <= metrics.header.bottom + 0.5)
    && Math.max(welcomeLogo.top, welcomeProgress.top) < Math.min(welcomeLogo.bottom, welcomeProgress.bottom));
  const headerNavigation = welcome ? welcomeNavigation
    : headerAction && headerAction.width >= 43.5 && headerAction.height >= 43.5;
  const gap = metrics.account && metrics.result ? metrics.account.top - metrics.result.bottom : null;
  add(1, calculator, Boolean(metrics.account?.text && metrics.account.links && metrics.next?.links
    && gap !== null && (metrics.width !== 390 || gap >= -2 && gap <= metrics.height)), { gapPx: gap, screens: gap === null ? null : gap / metrics.height,
    account: metrics.account, next: metrics.next });
  add(2, explanation, metrics.collapsed.length > 0 && metrics.collapsed.every(item => item.inServerHtml)
    && metrics.shortAnswerPresent && metrics.shortAnswerSentences <= 2
    && (!calculator || metrics.width !== 390 || metrics.pageScreens <= 7),
  { collapsed: metrics.collapsed, shortAnswerPresent: metrics.shortAnswerPresent,
    shortAnswerSentences: metrics.shortAnswerSentences, pageScreens: metrics.pageScreens });
  add(3, calculator, Boolean(metrics.progress?.text && metrics.next?.links && metrics.reuse?.known
    && metrics.reuse?.prefill && metrics.reuse?.valueMatches && metrics.nextMatches && metrics.reasonSuppressedOnRevisit
    && (!page.nextCalculator || (metrics.nextJourney?.passed && metrics.nextJourney?.differentReason))),
  { progress: metrics.progress, reuse: metrics.reuse, nextMatches: metrics.nextMatches,
    nextJourney: metrics.nextJourney, reasonSuppressedOnRevisit: metrics.reasonSuppressedOnRevisit });
  add(4, home, metrics.routeStarts.includes("posture") && metrics.routeStarts.includes("ride")
    && metrics.missingCalculators.length === 0 && stickyVisible,
  { routes: metrics.routeStarts, missing: metrics.missingCalculators, sticky: home ? sticky?.initial : undefined,
    pageScreens: metrics.pageScreens });
  add(5, metrics.width === 390, Boolean(metrics.header && metrics.header.height <= 64.5
    && headerNavigation && !metrics.cookieCoversHeader
    && (!home || stickyVisible && sticky.initial.headerOverlap === false && sticky.cookieUndecided?.visible === false)),
  { header: metrics.header, menu: metrics.menu, checkoutBack: metrics.checkoutBack,
    ...(welcome ? { welcomeLogo, welcomeProgress } : {}),
    headerPattern: welcome ? "canvas-welcome-logo-progress" : page.kind === "checkout" ? "canvas-checkout-back-progress" : "site-menu",
    cookieCoversHeader: metrics.cookieCoversHeader });
  add(6, Boolean(page.boundaries?.length), (page.boundaries ?? []).every(boundary => metrics.boundaries.some(item =>
    item.id === boundary && item.text && /(?:€\s*\d|\d[,.]\d{2}\s*€)/.test(item.text))),
  { expected: page.boundaries, observed: metrics.boundaries });
  add(7, Boolean(page.presentations?.length), (page.presentations ?? []).every(value => metrics.presentations.includes(value)),
    { expected: page.presentations, observed: metrics.presentations });
  add(8, calculator || home, metrics.example.initial && metrics.example.inputChanged && metrics.example.afterEdit === false
    && metrics.example.afterReuse === false, metrics.example);
  add(9, true, metrics.numericInputs.length === 0, metrics.numericInputs);
  add(10, Boolean(page.measurementKind), metrics.measurementKinds.length > 0 && metrics.measurementKinds.every(Boolean),
    metrics.measurementKinds);
  add(11, Boolean(page.tyrePressure), metrics.tyreComponents.length > 0
    && metrics.tyreComponents.every(component => component.name && component.front && component.rear), metrics.tyreComponents);
  add(12, true, metrics.upgradeOverlays.length === 0 && metrics.urgency.length === 0
    && (!home || stickyDismissible),
  { overlays: metrics.upgradeOverlays, urgency: metrics.urgency, ownerApprovedException: home ? sticky : undefined });
  add(13, Boolean(page.safety), metrics.safety.length > 0 && metrics.safety.every(item => item.visible)
    && (!page.safetyStates || metrics.safetyStates?.length === page.safetyStates.length
      && metrics.safetyStates.every(state => state.visible)), { default: metrics.safety, states: metrics.safetyStates });
  add(14, true, metrics.forbidden.length === 0, { forbidden: metrics.forbidden });
  add(15, true, metrics.smallTargets.length === 0 && metrics.contrast.length === 0 && !metrics.overflow
    && (!home || stickyReserved),
  { targets: metrics.smallTargets, contrast: metrics.contrast, overflow: metrics.overflow,
    stickyReservation: home ? { initial: sticky?.initial, footer: sticky?.footer } : undefined });
  return checks;
}

export function stickyBarStateChecks(state) {
  const sticky = state.stickyBar;
  if (!sticky) return [];
  const navigationClear = sticky.headerOverlap === false && sticky.occludedMenuControls?.length === 0;
  const controlsClear = navigationClear && sticky.occludedFooterControls?.length === 0
    && sticky.targets?.every(target => target.width >= 43.5 && target.height >= 43.5);
  return [{ rule: 5, status: navigationClear ? "pass" : "fail", evidence: { state: state.state, sticky } },
    { rule: 15, status: controlsClear ? "pass" : "fail", evidence: { state: state.state, sticky } }];
}

export function manualRequirements(page) {
  const checks = [{ rule: 14, reason: "Check claims against shipped functionality and current prices; record canvas/advice differences." },
    { rule: 15, reason: "Review screenshot at actual viewport size: legibility, focus affordance and all states." }];
  if (page.kind === "checkout") checks.push({ rule: 5,
    reason: "Dedicated checkout canvas uses back/progress rather than marketing menu; verify one-row navigation and accessible back action." });
  if (/^welcome(?:-flag-off|-paid)?$/.test(page.id) && page.kind === "account") checks.push({ rule: 5,
    reason: "RP3Welcome uses the actual brand logo and account-ready step progress; verify their one-row mobile layout within 64px and the accessible logo link." });
  if (page.kind === "calculator") checks.push(
    { rule: 1, reason: "Check the calculator-specific reason and benefit CTA, original promise, and next-step priority." },
    { rule: 2, reason: "Only task, short answer, safety and next actions remain expanded." },
    { rule: 3, reason: "Follow the next calculator and verify actual values, route order and no repeated account reason." },
    { rule: 8, reason: "Untouched examples are grey and labelled, never presented as the rider's own input." });
  if (page.kind === "content") checks.push({ rule: 2, reason: "Review collapsed content against the matching canvas board." });
  if (page.kind === "home") checks.push({ rule: 4, reason: "Review Main/m/Home; keep the live saddle widget and both route starts." });
  if (page.boundaries?.length) checks.push({ rule: 6, reason: "Paid appears at a real limit, with one helpful sentence and correct price." });
  if (page.presentations?.length) checks.push({ rule: 7, reason: "Review the distinct paid forms against canvas, including locked score portion." });
  if (page.tyrePressure) checks.push({ rule: 11, reason: "Confirm shared component use, front lime/rear ink; email alternatives remain text." });
  if (page.safety) checks.push({ rule: 13, reason: "Confirm complete relevant safety information is always readable, not merely a marker." });
  checks.push({ rule: 12, reason: page.kind === "home"
    ? "Owner-approved U1-BAR exception only: verify consent-first, nonblocking session dismissal, including unavailable storage; no other paid urgency or modal exemption."
    : "No paid urgency/fear. Leave notice saves data, triggers only after input and once per session." });
  return checks;
}

export function summarize(records) {
  return RULES.map((title, index) => {
    const rule = index + 1;
    const checks = records.flatMap(record => record.checks.filter(check => check.rule === rule)
      .map(check => ({ page: record.id, locale: record.locale, width: record.width, ...check })));
    const applicable = checks.filter(check => check.status !== "not-applicable");
    return { rule, title, status: applicable.some(check => check.status === "fail") ? "fail"
      : applicable.some(check => check.status === "manual") ? "manual"
        : applicable.length ? "pass" : "not-applicable", checks };
  });
}
