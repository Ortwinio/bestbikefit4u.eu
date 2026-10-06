export function measureDocument({ serverHtml, calculatorPaths, viewport }) {
  if (!viewport || !Number.isFinite(viewport.width) || viewport.width <= 0
    || !Number.isFinite(viewport.height) || viewport.height <= 0) {
    throw new Error("measureDocument requires the requested viewport width and height");
  }
  const layoutViewport = { width: innerWidth, height: innerHeight,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) };
  const visible = node => {
    if (!node || !node.getClientRects().length) return false;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    const clippedToNothing = /^inset\(50%(?:\s+50%){0,3}\)$/.test(style.clipPath)
      || /^rect\(0(?:px)?(?:[,\s]+0(?:px)?){3}\)$/.test(style.clip);
    if (rect.width <= 1 && rect.height <= 1 && ["absolute", "fixed"].includes(style.position)
      && ["hidden", "clip"].includes(style.overflow) && clippedToNothing) return false;
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0
      && !node.closest('[hidden], [inert]');
  };
  const all = selector => [...document.querySelectorAll(selector)].filter(visible);
  const marker = name => all(`[data-usability="${name}"]`);
  const text = node => (node?.textContent ?? "").replace(/\s+/g, " ").trim();
  const box = node => {
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return { top: rect.top + scrollY, bottom: rect.bottom + scrollY, width: rect.width, height: rect.height,
      text: text(node), links: [...node.querySelectorAll('a[href],button')].filter(visible).length };
  };
  const intersects = (first, second) => first && second && first.left < second.right && first.right > second.left
    && first.top < second.bottom && first.bottom > second.top;
  const header = marker("site-header")[0] ?? all("header")[0];
  const welcomeLogo = header && [...header.querySelectorAll('a[href]')]
    .find(node => visible(node) && [...node.querySelectorAll('img')]
      .some(image => visible(image) && /BikeFitBoost/i.test(image.alt)));
  const welcomeProgress = header && [...header.querySelectorAll('span,p,div')]
    .filter(visible).reverse().find(node => /^(?:Stap\s+1\s+van\s+2|Step\s+1\s+of\s+2)\b/i.test(text(node)));
  const menu = marker("menu-trigger")[0] ?? all('button[aria-expanded][aria-controls]')[0];
  const checkoutBack = header && [...header.querySelectorAll('a[href],button')]
    .find(node => visible(node) && /^(back|terug)$/i.test(text(node)));
  const cookie = marker("cookie-banner")[0];
  const serverDocument = new DOMParser().parseFromString(serverHtml, "text/html");
  serverDocument.querySelectorAll("script,style").forEach(node => node.remove());
  const serverText = text(serverDocument.body);
  const collapsed = [...document.querySelectorAll("main details:not([open])")].map(node => {
    const clone = node.cloneNode(true);
    clone.querySelector("summary")?.remove();
    const content = text(clone);
    return { summary: text(node.querySelector("summary")), characters: content.length,
      inServerHtml: content.length > 0 && serverText.includes(content) };
  });
  const shortAnswer = marker("short-answer")[0];
  const answer = shortAnswer ? [...shortAnswer.querySelectorAll("p")].filter(visible).map(text).join(" ").trim() : "";
  const segmenter = new Intl.Segmenter(document.documentElement.lang || "nl", { granularity: "sentence" });
  const targets = all('a[href],button,input:not([type="hidden"]),select,textarea,[role="button"],[role="slider"],[role="radio"],[role="checkbox"],summary');
  const smallTargets = targets.flatMap(node => {
    const rect = node.getBoundingClientRect();
    const label = node.labels && [...node.labels].find(visible);
    const labelled = label?.getBoundingClientRect();
    const hitRect = labelled && labelled.width >= rect.width && labelled.height >= rect.height ? labelled : rect;
    return hitRect.width >= 43.5 && hitRect.height >= 43.5 ? [] : [{ tag: node.tagName,
      label: node.getAttribute("aria-label") || text(node).slice(0, 100) || node.getAttribute("name"),
      width: hitRect.width, height: hitRect.height, html: node.outerHTML.slice(0, 260),
      clipping: { clipPath: getComputedStyle(node).clipPath, clip: getComputedStyle(node).clip,
        position: getComputedStyle(node).position, overflow: getComputedStyle(node).overflow } }];
  });
  const visibleText = document.body.innerText;
  const forbidden = [...visibleText.matchAll(/(?:€\s*(?:24[,.]50|19[,.]50)|(?:24[,.]50|19[,.]50)\s*€|€\s*5\s*korting|Bewaar en verfijn gratis|Save and refine for free)/gi)].map(match => match[0]);
  const urgency = [...visibleText.matchAll(/(?:nog maar vandaag|alleen vandaag|laatste kans|only today|last chance|countdown)/gi)].map(match => match[0]);
  const upgrade = /(?:upgrade|abonnement|subscription|paid plan|betaald plan|premium)/i;
  const isAccountNavigation = node => node.id === "account-mobile-menu" && node.getAttribute("role") === "dialog"
    && [...node.querySelectorAll("nav")].some(visible)
    && [...document.querySelectorAll('header button[data-usability="menu-trigger"][aria-controls][aria-expanded="true"]')]
      .some(trigger => trigger.getAttribute("aria-controls").split(/\s+/).includes(node.id));
  const upgradeOverlays = all('[role="dialog"],[role="alertdialog"],[aria-modal="true"]').filter(node =>
    upgrade.test(text(node)) && !node.closest('[data-slot="leave-data-notice"]') && !isAccountNavigation(node))
    .map(node => text(node).slice(0, 300));
  const links = all('main a[href]').map(node => new URL(node.href).pathname.replace(/\/$/, ""));
  const numericInput = node => {
    if (node.type === "range" || node.getAttribute("role") === "slider") return false;
    const identity = [node.name, node.id, node.getAttribute("aria-label"), node.getAttribute("autocomplete"),
      ...[...(node.labels ?? [])].map(text)].filter(Boolean).join(" ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    const words = identity.split(/[^a-z0-9]+/);
    const code = words.some(word => ["code", "otp", "pin", "verification", "postcode", "zipcode", "verificatiecode", "inlogcode"].includes(word));
    if (code) return false;
    if (node.type === "number" || ["decimal", "numeric"].includes(node.inputMode)) return true;
    if (!["text", "search", "tel"].includes(node.type)) return false;
    const allowedText = words.some(word => ["name", "naam", "firstname", "lastname", "username", "url", "website", "email", "mail"].includes(word));
    if (allowedText) return false;
    return /^[-+]?\d+(?:[.,]\d+)?(?:\s*(?:mm|cm|m|kg|g|w|watts?|bar|psi|rpm|bpm|%))?$/i.test(node.value.trim());
  };
  const hasChoiceValue = node => {
    if (node.matches("input,select")) return Boolean(node.value.trim());
    const value = node.getAttribute("data-value") ?? node.getAttribute("value")
      ?? node.getAttribute("aria-label") ?? text(node);
    return Boolean(value.trim());
  };
  const checkedChoice = node => node.matches("input") ? node.checked
    : node.getAttribute("aria-checked") === "true" || node.getAttribute("aria-selected") === "true"
      || node.getAttribute("data-state") === "checked";
  const validChoices = choices => {
    const selected = choices.filter(checkedChoice);
    return selected.length === 1 && hasChoiceValue(selected[0]);
  };
  const nativeRadioGroup = node => node.name
    ? [...document.querySelectorAll('input[type="radio"]')].filter(candidate => candidate.name === node.name && candidate.form === node.form)
    : [...(node.closest('[role="radiogroup"],fieldset,[data-usability="measurement-kind"]') ?? node.parentElement)
      .querySelectorAll('input[type="radio"]')];
  const measurementKind = node => {
    if (node.matches("select")) return node.selectedOptions.length === 1 && hasChoiceValue(node)
      && !node.selectedOptions[0].disabled;
    if (node.matches('input[type="radio"]')) return validChoices(nativeRadioGroup(node));
    if (node.matches("input")) return Boolean(node.checked && hasChoiceValue(node));
    if (node.matches('[role="radio"]')) return validChoices(
      [...(node.closest('[role="radiogroup"]') ?? node.parentElement).querySelectorAll('[role="radio"]')]
    );
    const selects = [...node.querySelectorAll("select")];
    const comboboxes = [...node.querySelectorAll('[role="combobox"]')];
    const customGroups = [...node.querySelectorAll('[role="radiogroup"]')];
    const customChoices = [...node.querySelectorAll('[role="radio"]')];
    const nativeChoices = [...node.querySelectorAll('input[type="radio"]')];
    if (selects.length) return selects.every(measurementKind);
    if (comboboxes.length) return comboboxes.every(control => {
      const field = control.closest('[data-slot="field"]') ?? node;
      const values = [...field.querySelectorAll('input[type="hidden"],input[aria-hidden="true"]')];
      return !control.matches('[data-placeholder]') && !control.querySelector('[data-placeholder]')
        && Boolean(text(control)) && values.some(hasChoiceValue);
    });
    if (customGroups.length) return customGroups.every(group => validChoices([...group.querySelectorAll('[role="radio"]')]));
    if (customChoices.length) return validChoices(customChoices);
    if (nativeChoices.length) return nativeChoices.every(choice => validChoices(nativeRadioGroup(choice)));
    return validChoices([...node.querySelectorAll('[aria-checked],[aria-selected],[data-state="checked"],[data-state="unchecked"]')]);
  };
  return {
    width: viewport.width, height: viewport.height, layoutViewport, checkoutBack: box(checkoutBack),
    pageScreens: layoutViewport.scrollHeight / viewport.height,
    overflow: Math.max(layoutViewport.scrollWidth, layoutViewport.width) > viewport.width + 1,
    result: box(marker("result-value")[0]), account: box(marker("account-reason")[0]), next: box(marker("next-step")[0]),
    nextLinks: marker("next-step").flatMap(node => [...node.querySelectorAll("a[href]")].map(link => link.getAttribute("href"))),
    progress: box(marker("route-progress")[0]), known: marker("known-values").map(text),
    accountReasonIds: marker("account-reason").map(node => node.getAttribute("data-reason-id")),
    header: box(header), menu: box(menu), welcomeLogo: box(welcomeLogo), welcomeProgress: box(welcomeProgress),
    cookieCoversHeader: intersects(cookie?.getBoundingClientRect(), header?.getBoundingClientRect()),
    routeStarts: marker("route-start").map(node => node.getAttribute("data-route")),
    missingCalculators: calculatorPaths.filter(path => !links.includes(path.replace(/\/$/, ""))),
    collapsed, shortAnswerPresent: Boolean(shortAnswer && answer), shortAnswerSentences: answer ? [...segmenter.segment(answer)].length : 0,
    numericInputs: all('input:not([type="hidden"])').filter(numericInput)
      .map(node => ({ name: node.name, type: node.type, label: node.getAttribute("aria-label"), html: node.outerHTML.slice(0, 250) })),
    boundaries: marker("paid-boundary").map(node => ({ id: node.getAttribute("data-boundary"), text: text(node) })),
    presentations: marker("paid-presentation").map(node => node.getAttribute("data-presentation")),
    measurementKinds: marker("measurement-kind").map(measurementKind),
    tyreComponents: marker("tire-pressure").map(node => ({ name: node.getAttribute("data-component"),
      front: Boolean(node.querySelector('[data-tyre="front"],.pressure-wheel-front')),
      rear: Boolean(node.querySelector('[data-tyre="rear"],.pressure-wheel-rear')) })),
    safety: [...document.querySelectorAll('[data-usability="safety"]')].map(node => ({ visible: visible(node), text: text(node) })),
    example: { initial: marker("example").length > 0 }, smallTargets, forbidden, urgency, upgradeOverlays,
  };
}
