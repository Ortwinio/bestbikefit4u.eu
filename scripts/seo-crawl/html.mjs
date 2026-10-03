import { JSDOM } from "jsdom";

/** Parse inert HTTP source, retaining offsets instead of trusting a repaired DOM head. */
export function parseHead(html) {
  const dom = new JSDOM(html, { includeNodeLocations: true });
  const document = dom.window.document;
  const head = document.head && dom.nodeLocation(document.head);
  const headEnd = head?.endTag?.startOffset ?? null;
  const entry = (node, value) => {
    const location = dom.nodeLocation(node);
    return {
      value, offset: location?.startOffset ?? null,
      inHead: headEnd !== null && location?.startOffset >= head.startTag.endOffset
        && location.endOffset <= headEnd && document.head.contains(node),
    };
  };
  const titles = [...document.querySelectorAll("title")]
    .filter((node) => node.namespaceURI === "http://www.w3.org/1999/xhtml")
    .map((node) => entry(node, node.textContent.trim()));
  const descriptions = [];
  const robots = [];
  for (const node of document.querySelectorAll("meta")) {
    const name = (node.getAttribute("name") ?? "").toLowerCase();
    if (name === "description") descriptions.push(entry(node, node.getAttribute("content") ?? ""));
    if (["robots", "googlebot", "bingbot", "gptbot", "claudebot"].includes(name)) {
      robots.push({ ...entry(node, node.getAttribute("content") ?? ""), name });
    }
  }
  const canonicals = [];
  const alternates = [];
  for (const node of document.querySelectorAll("link")) {
    const rel = (node.getAttribute("rel") ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("canonical")) canonicals.push(entry(node, node.getAttribute("href") ?? ""));
    if (rel.includes("alternate") && node.hasAttribute("hreflang")) {
      alternates.push({ ...entry(node, node.getAttribute("href") ?? ""), lang: node.getAttribute("hreflang") });
    }
  }
  const hrefs = [...new Set([...document.querySelectorAll("a[href], area[href]")]
    .map((node) => node.getAttribute("href")))];
  dom.window.close();
  return { headEnd, titles, descriptions, canonicals, alternates, robots, hrefs };
}

export function parseSitemap(xml) {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const root = dom.window.document.documentElement;
  if (!["sitemapindex", "urlset"].includes(root.localName)) throw new Error("Not a sitemap XML document");
  const locations = [...root.children].flatMap((node) => [...node.children]
    .filter((child) => child.localName === "loc").map((child) => child.textContent.trim()));
  dom.window.close();
  return { index: root.localName === "sitemapindex", locations };
}

export function isNoindex(parsed, header = "", agent = "Googlebot") {
  const name = agent.toLowerCase().replace(/\s+/g, "");
  const directives = parsed.robots.filter((item) => item.name === "robots" || item.name === name);
  return [...directives.map((item) => item.value), header].some((value) => /\b(noindex|none)\b/i.test(value));
}

export function absoluteHttp(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function metadataIssues(parsed, expectedCanonical) {
  const issues = [];
  if (parsed.headEnd === null) issues.push("missing-explicit-head-end");
  for (const [name, nodes] of [
    ["title", parsed.titles], ["description", parsed.descriptions], ["canonical", parsed.canonicals],
  ]) {
    if (nodes.length !== 1) issues.push(`${name}-count:${nodes.length}`);
    if (nodes.some((node) => !node.inHead)) issues.push(`${name}-outside-head`);
    if (nodes.some((node) => !node.value.trim())) issues.push(`${name}-empty`);
  }
  if (parsed.canonicals.length === 1) {
    const canonical = absoluteHttp(parsed.canonicals[0].value);
    if (!canonical) issues.push("canonical-not-absolute");
    else if (canonical !== expectedCanonical) issues.push("canonical-not-self");
  }
  if (parsed.alternates.some((item) => !item.inHead)) issues.push("hreflang-outside-head");
  return issues;
}
