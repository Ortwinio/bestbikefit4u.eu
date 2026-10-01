/** Bounded, non-persistent interaction sampling for the Dutch language audit. */
export const UNSAFE_ACTION = /delete|remove|verwijder|wissen|betalen|checkout|purchase|buy|koop|logout|uitloggen/i;

export function safeInteractionLabel(label) {
  return !UNSAFE_ACTION.test(label ?? "");
}

export function safeMainFlowLabel(label) {
  return safeInteractionLabel(label)
    && /\b(feedback|volgende|next|bereken|calculate|voorbeeld|example|opnieuw|retry)\b/i.test(label ?? "")
    && !/\b(save|opslaan|submit|verstuur|verstur|verzend|import)/i.test(label ?? "");
}

export async function auditDutchInteractions(page, collectCallback, { maxInteractions = 12 } = {}) {
  const coverage = { attempted: [], completed: [], skipped: [], nativeValidation: [], optionText: [],
    limitations: [
      "Bounded interaction sampling; conditional states needing real user data are not exhaustively covered.",
      "Destructive actions and link navigation are skipped. Network mutation blocking is supplied by the caller.",
      "Native validation messages come from the browser locale; custom validation comes from the rendered page.",
    ] };
  let remaining = maxInteractions;
  const visit = async (stage, action, reserve = 0) => {
    if (remaining <= reserve) {
      coverage.skipped.push({ stage, reason: reserve
        ? "Remaining interaction budget reserved for main actions and empty-form validation."
        : "Per-route interaction budget exhausted." });
      return false;
    }
    remaining -= 1;
    coverage.attempted.push(stage);
    try {
      await action();
      await page.waitForTimeout(200);
      await collectCallback(stage);
      coverage.completed.push(stage);
      return true;
    } catch (error) {
      coverage.skipped.push({ stage, reason: String(error.message).split("\n")[0] });
      return false;
    }
  };
  const controls = await page.evaluate(() => {
    const selector = 'button[aria-expanded],button[aria-haspopup],[role="combobox"],select,summary';
    return [...document.querySelectorAll(selector)].filter((element) => {
      const style = getComputedStyle(element);
      return element.getClientRects().length && style.visibility !== "hidden" && !element.disabled;
    }).map((element, index) => {
      const id = `nl-interaction-${index}`;
      element.setAttribute("data-nl-audit-control", id);
      const label = element.getAttribute("aria-label") || element.innerText || element.getAttribute("name") || id;
      return { id, label: label.trim().slice(0, 180), tag: element.tagName.toLowerCase(),
        role: element.getAttribute("role"), expanded: element.getAttribute("aria-expanded") };
    });
  });
  for (const control of controls) {
    const stage = `open:${control.label}`;
    if (!safeInteractionLabel(control.label)) {
      coverage.skipped.push({ stage, reason: "Potentially destructive action." });
      continue;
    }
    const locator = page.locator(`[data-nl-audit-control="${control.id}"]`);
    if (control.tag === "select") {
      const choices = await locator.locator("option").evaluateAll((elements) => elements.map((element) => ({
        value: element.value, label: element.textContent.trim(), disabled: element.disabled,
      })));
      coverage.optionText.push(...choices.map(({ label }) => ({ stage, text: label })));
      const selected = await locator.inputValue();
      const choice = choices.find((item) => !item.disabled && item.value && item.value !== selected
        && safeInteractionLabel(item.label));
      if (choice) {
        await visit(`select:${control.label}:${choice.label}`, () => locator.selectOption(choice.value,
          { timeout: 1000 }), 2);
        await locator.selectOption(selected, { timeout: 1000 }).catch(() => {});
      } else coverage.skipped.push({ stage, reason: "No alternative enabled option." });
      continue;
    }
    const opened = await visit(stage, () => locator.click({ timeout: 1000 }), 2);
    if (opened) {
      const options = page.getByRole("option");
      const optionCount = await options.count();
      for (let index = 0; index < optionCount; index += 1) {
        const option = options.nth(index);
        const label = (await option.innerText().catch(() => "")).trim();
        if (!await option.isVisible().catch(() => false) || !safeInteractionLabel(label)) continue;
        coverage.optionText.push({ stage, text: label });
      }
      if (optionCount) {
        for (let index = 0; index < optionCount; index += 1) {
          const option = options.nth(index);
          const label = (await option.innerText().catch(() => "")).trim();
          if (!await option.isVisible().catch(() => false) || !safeInteractionLabel(label)) continue;
          if (await option.getAttribute("aria-selected") === "true") continue;
          await visit(`option:${control.label}:${label}`, () => option.click({ timeout: 1000 }), 2);
          break;
        }
      }
      await page.keyboard.press("Escape").catch(() => {});
      if (control.tag === "summary" || await locator.getAttribute("aria-expanded").catch(() => null) === "true") {
        await locator.click({ timeout: 1000 }).catch(() => {});
      }
    }
  }
  const actions = await page.evaluate(() => [...document.querySelectorAll("button")].filter((button) =>
    !button.form && !button.disabled && button.getClientRects().length
    && !button.hasAttribute("data-nl-audit-control")).map((button, index) => {
    const id = `nl-main-action-${index}`;
    button.setAttribute("data-nl-audit-action", id);
    return { id, label: (button.getAttribute("aria-label") || button.innerText || "").trim() };
  }));
  let actionCount = 0;
  for (const action of actions) {
    if (!safeMainFlowLabel(action.label)) continue;
    const stage = `main-action:${action.label}`;
    if (actionCount >= 3) {
      coverage.skipped.push({ stage, reason: "Main-flow action sampling is capped at three buttons per route." });
      continue;
    }
    actionCount += 1;
    const originalUrl = page.url();
    await visit(stage, () => page.locator(`[data-nl-audit-action="${action.id}"]`).click({ timeout: 1000 }), 1);
    if (page.url() !== originalUrl) {
      coverage.limitations.push(`Button ${JSON.stringify(action.label)} navigated to ${page.url()}; restored route.`);
      await page.goto(originalUrl, { waitUntil: "load", timeout: 20000 });
      await page.waitForTimeout(200);
      break;
    }
  }
  const forms = await page.evaluate(() => [...document.forms].map((form, index) => {
    const id = `nl-form-${index}`;
    form.setAttribute("data-nl-audit-form", id);
    const submit = form.querySelector('button[type="submit"],input[type="submit"],button:not([type])');
    const fields = [...form.querySelectorAll("input,textarea")].filter((field) =>
      !field.disabled && !field.readOnly && field.getClientRects().length
      && !["hidden", "checkbox", "radio", "range", "file", "submit", "button"].includes(field.type));
    return { id, label: submit?.textContent?.trim() || submit?.value || id,
      hasFields: fields.length > 0, visible: form.getClientRects().length > 0 };
  }));
  for (const form of forms) {
    const stage = `empty-submit:${form.label}`;
    if (!form.visible || !form.hasFields || !safeInteractionLabel(form.label)) {
      coverage.skipped.push({ stage, reason: "No visible editable fields or unsafe submit action." });
      continue;
    }
    const locator = page.locator(`[data-nl-audit-form="${form.id}"]`);
    await visit(stage, async () => {
      // Prevent native navigation while allowing React's validation handler to receive the event.
      await locator.evaluate((element) => element.addEventListener("submit", (event) => event.preventDefault(),
        { capture: true, once: true }));
      const fields = locator.locator("input,textarea");
      for (let index = 0; index < await fields.count(); index += 1) {
        const field = fields.nth(index);
        const type = await field.getAttribute("type");
        if (["hidden", "checkbox", "radio", "range", "file", "submit", "button"].includes(type)) continue;
        if (await field.isVisible() && await field.isEditable()) await field.fill("", { timeout: 1000 });
      }
      await locator.evaluate((element) => element.requestSubmit());
      const messages = await locator.evaluate((element) => [...element.elements]
        .filter((field) => field.validationMessage).map((field) => ({
          label: field.labels?.[0]?.innerText || field.getAttribute("aria-label") || field.name || field.id,
          message: field.validationMessage,
        })));
      coverage.nativeValidation.push(...messages.map((message) => ({ stage, ...message })));
    });
  }
  await collectCallback("final-status-alerts");
  return coverage;
}
