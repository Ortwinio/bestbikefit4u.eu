#!/usr/bin/env node
// Lints a .dc.html canvas board against plans/redesign-canvas/BOARD-RULES.md.
// Usage: node plans/redesign-canvas/check-board.mjs <file.dc.html> [...]
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { htmlText, withoutElements } from "../../scripts/lib/html.mjs";

const PALETTE = new Set([
  "#CFF26A", "#E6F8A8", "#0A7263", "#075A4E", "#E1F2EE", "#0F2420", "#3B4F4A",
  "#4A5F5A", "#B9CCC6", "#DCE6E1", "#F5F8F3", "#FFFFFF", "#FFD66B", "#FFB199",
  // tints already used by published boards
  "#17332D", "#2E4C45", "#3E5C55", "#EEF3EF", "#9CC21F", "#BFE3DA", "#B6D94C",
]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
// SVG children that are legitimately self-closed
const SELF_OK = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "stop", "use"]);

let failed = 0;
for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, "utf8");
  const errors = [];
  const warns = [];
  const err = (m) => errors.push(m);

  if (!src.includes('<script src="./support.js"></script>')) err("missing exact support.js line");
  if (!/<html lang="nl">/.test(src)) err('<html lang="nl"> missing');
  if (!/<title>[^<]+<\/title>/.test(src)) err("missing <title>");

  // data-props + $preview vs root size
  const dp = src.match(/data-props='([^']*)'/);
  let preview;
  if (!dp) err("missing data-props");
  else {
    try {
      const json = JSON.parse(dp[1].replace(/&#39;/g, "'").replace(/&amp;/g, "&"));
      preview = json.$preview;
      if (!preview) err("data-props has no $preview");
    } catch (e) { err("data-props is not valid JSON: " + e.message); }
  }
  const body = src.split("<x-dc>")[1]?.split("</x-dc>")[0] ?? "";
  const afterHelmet = body.split("</helmet>")[1] ?? body;
  const root = afterHelmet.match(/<div style="([^"]*)"/);
  if (!root) err("no root <div style> after </helmet>");
  else if (preview) {
    const w = root[1].match(/(?:^|;)\s*width:\s*(\d+)px/), h = root[1].match(/(?:^|;)\s*height:\s*(\d+)px/);
    if (!w || +w[1] !== preview.width) err(`root width ${w?.[1]} != $preview.width ${preview.width}`);
    if (!h || +h[1] !== preview.height) err(`root height ${h?.[1]} != $preview.height ${preview.height}`);
  }

  // logic class compiles
  const script = src.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/);
  if (!script) err("missing x-dc script block");
  else {
    if (!/class Component extends DCLogic/.test(script[1])) err("script must define class Component extends DCLogic");
    if (/\b(import|export)\b\s/.test(script[1])) err("import/export not allowed in logic");
    try { new vm.Script("class DCLogic{};" + script[1]); } catch (e) { err("logic does not compile: " + e.message); }
    if (/innerHTML|appendChild|fetch\(|XMLHttpRequest/.test(script[1])) err("script-built UI or network call in logic");
  }

  // holes are dotted lookups only
  for (const m of body.matchAll(/\{\{([^}]*)\}\}/g)) {
    if (!/^\s*[\w$]+(\.[\w$]+)*\s*$/.test(m[1])) err(`hole is an expression: {{${m[1]}}}`);
  }
  // control flow hints
  for (const m of body.matchAll(/<sc-(for|if)\b[^>]*>/g)) {
    if (!/hint-/.test(m[0])) err(`<sc-${m[1]}> without hint-* attr`);
  }
  // interaction rules
  if (/<select\b/i.test(body)) err("<select> dropdown (use segments/cards)");
  if (/type="number"/.test(body)) err('type="number" input (use a slider)');
  if (/gradient\(/i.test(src)) err("gradient used");
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(src)) err("emoji found");
  if (/role="button"|<(div|span)[^>]*onClick=/.test(body)) err("onClick/role on div/span (use <button>)");
  for (const m of body.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) {
    const text = htmlText(m[1]).trim();
    if (!text && !/aria-label=/.test(m[0])) err("icon-only <button> without aria-label");
  }
  for (const m of body.matchAll(/<input\b[^>]*>/g)) {
    const id = m[0].match(/id="([^"]+)"/);
    if (!/type="hidden"/.test(m[0]) && !/aria-label=/.test(m[0]) && !(id && body.includes(`for="${id[1]}"`))) err(`<input> without <label for> or aria-label: ${m[0].slice(0, 60)}`);
  }
  // rider-facing copy must not contain developer/mockup language (BOARD-RULES → Copy)
  const JARGON = /engine|contract|voorlopig|demo\b|canvas|placeholder|adapter|guardrail|\bboard\b|integratie|rekenvoorbeeld/i;
  const visible = htmlText(withoutElements(body, "helmet, script, style")).split("\n");
  const logic = script ? script[1].replace(/\/\/[^\n]*/g, "") : "";
  const literals = [...logic.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.){6,})\1/g)].map((m) => m[2]).filter((t) => /\s/.test(t));
  for (const t of [...visible, ...literals]) if (JARGON.test(t)) err(`jargon in rider-facing copy: "${t.trim().slice(0, 80)}"`);
  if (!/DM Mono/.test(src)) warns.push("DM Mono never used (fine only if the board shows no numbers)");

  // colors
  for (const m of src.matchAll(/#[0-9A-Fa-f]{6}\b/g)) {
    if (!PALETTE.has(m[0].toUpperCase())) warns.push(`off-palette color ${m[0]}`);
  }

  // tag balance (outside <script>/<style>)
  const markup = withoutElements(body, "style, script");
  const stack = [];
  for (const m of markup.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g)) {
    const [, close, tagRaw, attrs] = m;
    const tag = tagRaw.toLowerCase();
    if (VOID.has(tag)) continue;
    if (attrs.trim().endsWith("/")) { if (!SELF_OK.has(tag)) err(`self-closed <${tag}/>`); continue; }
    if (!close) stack.push(tag);
    else {
      const top = stack.pop();
      if (top !== tag) { err(`tag mismatch: </${tag}> closes <${top}>`); break; }
    }
  }
  if (stack.length) err("unclosed tags: " + stack.join(", "));
  for (const m of markup.matchAll(/<[a-zA-Z][\w-]*\s[^>]*?\s([\w-]+)=([^"'\s>{][^\s>]*)/g)) err(`unquoted attribute ${m[1]}=${m[2]}`);

  const uniqWarns = [...new Set(warns)];
  console.log(`${errors.length ? "FAIL" : "PASS"}  ${file}`);
  for (const e of errors) console.log("  ✗ " + e);
  for (const w of uniqWarns) console.log("  ! " + w);
  if (errors.length) failed++;
}
process.exit(failed ? 1 : 0);
