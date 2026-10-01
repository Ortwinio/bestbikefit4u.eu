import { JSDOM } from "jsdom";

/** Parse inert local markup: no scripts execute and no external resources load. */
export function parseHtml(html) {
  return new JSDOM(html, { includeNodeLocations: true });
}

export function htmlText(html) {
  return JSDOM.fragment(html).textContent ?? "";
}

/** Preserve original markup for syntax checks, blanking whole parsed element ranges. */
export function withoutElements(html, selector) {
  const dom = parseHtml(html);
  const ranges = [...dom.window.document.querySelectorAll(selector)]
    .map((node) => dom.nodeLocation(node)).filter(Boolean)
    .sort((a, b) => b.startOffset - a.startOffset);
  let result = html;
  for (const range of ranges) {
    result = result.slice(0, range.startOffset)
      + html.slice(range.startOffset, range.endOffset).replace(/[^\n]/g, " ")
      + result.slice(range.endOffset);
  }
  dom.window.close();
  return result;
}

export function boardMarkup(html) {
  const dom = parseHtml(html);
  const document = dom.window.document;
  const scripts = [...document.querySelectorAll("script[data-dc-script]")].map((node) => node.textContent);
  document.querySelectorAll("script").forEach((node) => node.remove());
  const markup = dom.serialize();
  dom.window.close();
  return { scripts, markup };
}
