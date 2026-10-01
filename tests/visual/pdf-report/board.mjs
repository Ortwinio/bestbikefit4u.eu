import { boardMarkup } from "../../../scripts/lib/html.mjs";
/** Render trusted, repository-owned DC report boards without the absent support.js runtime. */
export async function renderBoard(page, html) {
  const { scripts, markup } = boardMarkup(html);
  if (scripts.length !== 1) throw new Error(`Expected one DC component script, found ${scripts.length}`);
  await page.setContent(markup, { waitUntil: "networkidle" });
  const result = await page.evaluate((source) => {
    // The input is reviewed local board code, never application data or user-supplied HTML.
    const Component = new Function("DCLogic", `${source}\nreturn Component;`)(class DCLogic {});
    const values = new Component().renderVals();
    const evaluate = (expression, scope) =>
      new Function(...Object.keys(scope), `return (${expression});`)(...Object.values(scope));
    const binding = (value, scope) => {
      const match = value.match(/^\s*{{([\s\S]*?)}}\s*$/);
      return match ? evaluate(match[1], scope) : value;
    };
    const interpolate = (value, scope) =>
      value.replace(/{{([\s\S]*?)}}/g, (_, expression) => String(evaluate(expression, scope) ?? ""));
    let iterations = 0;
    const expand = (node, scope) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = interpolate(node.textContent, scope);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.localName === "sc-for") {
        const list = binding(node.getAttribute("list") ?? "", scope);
        const alias = node.getAttribute("as");
        if (!Array.isArray(list) || !alias) throw new Error("Invalid sc-for list or alias");
        const fragment = document.createDocumentFragment();
        for (const item of list) {
          if (++iterations > 10000) throw new Error("DC board iteration limit exceeded");
          const itemScope = { ...scope, [alias]: item };
          for (const child of [...node.childNodes]) {
            const clone = child.cloneNode(true);
            fragment.append(clone);
            expand(clone, itemScope);
          }
        }
        node.replaceWith(fragment);
        return;
      }
      if (node.localName === "sc-if") {
        if (!binding(node.getAttribute("value") ?? "", scope)) {
          node.remove();
          return;
        }
        for (const child of [...node.childNodes]) expand(child, scope);
        node.replaceWith(...node.childNodes);
        return;
      }
      for (const attribute of [...node.attributes]) {
        node.setAttribute(attribute.name, interpolate(attribute.value, scope));
      }
      for (const child of [...node.childNodes]) expand(child, scope);
    };
    expand(document.documentElement, values);
    for (const component of document.querySelectorAll("x-dc")) component.style.display = "block";
    if (document.querySelector("sc-for, sc-if") || document.documentElement.outerHTML.includes("{{")) {
      throw new Error("Unresolved DC board template");
    }
    return { iterations, unresolved: false };
  }, scripts[0]);
  await page.evaluate(() => document.fonts.ready);
  return result;
}
