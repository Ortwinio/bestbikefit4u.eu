import { readFileSync } from "node:fs";

// Check the actual CSS declarations, not a second copy of the palette.
// Decorative borders are not text or interactive boundaries; focus/invalid rings are.
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
function declarations(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = css.match(new RegExp(`${escaped} \\{([\\s\\S]*?)\\n\\}`));
  if (!block) throw new Error(`Missing ${selector} token block`);
  return Object.fromEntries([...block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}
function linearRgb(value, tokens, seen = new Set()) {
  value = value.replace(/var\(--([\w-]+)\)/g, (_, name) => {
    if (!tokens[name] || seen.has(name)) throw new Error(`Missing/cyclic color token: ${name}`);
    seen.add(name);
    return tokens[name];
  });
  if (value.includes("var(")) return linearRgb(value, tokens, seen);
  if (/^#[a-f\d]{6}$/i.test(value)) {
    return value.slice(1).match(/../g).map((part) => {
      const c = parseInt(part, 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  }
  const match = value.match(/^(?:oklch\()?([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)?$/);
  if (!match) throw new Error(`Unsupported color expression: ${value}`);
  const L = Number(match[1]) / 100;
  const C = Number(match[2]);
  const h = Number(match[3]) * Math.PI / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((v) => Math.max(0, Math.min(1, v)));
}
function luminance(rgb) { return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; }
function ratio(a, b) { return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
const root = declarations(":root");
let failures = 0;
let checks = 0;
for (const [mode, tokens] of [["light", root], ["dark", { ...root, ...declarations(".dark") }]]) {
  const pairs = [];
  const add = (fg, bg, minimum = 4.5, opacity = 1) => pairs.push({ fg, bg, minimum, opacity });
  // Every semantic foreground/background pair, including compatibility aliases.
  for (const name of Object.keys(tokens).filter((name) => name.endsWith("-foreground"))) {
    const background = name.slice(0, -"-foreground".length);
    if (tokens[background]) add(name, background);
  }
  add("foreground", "background");
  for (const background of ["background", "card", "field-background", "surface-secondary", "surface-tertiary",
    "public-shell-background", "public-shell-elevated", "public-card", "public-card-subtle", "public-card-strong", "public-band", "public-hero", "public-cta",
    "dashboard-shell", "dashboard-shell-elevated", "dashboard-sidebar", "dashboard-sidebar-elevated", "dashboard-surface", "dashboard-surface-muted", "dashboard-surface-strong", "dashboard-hero", "dashboard-field-background"]) {
    add("foreground", background);
    add("muted-foreground", background);
  }
  for (const background of ["dashboard-sidebar", "dashboard-nav-hover-surface", "dashboard-nav-active-surface"]) {
    add("dashboard-nav-foreground", background);
    add("dashboard-nav-foreground-strong", background);
  }
  for (const background of ["panel-surface", "panel-surface-subtle", "panel-shell-background", "panel-field-background"]) {
    add("panel-foreground", background); add("panel-muted-foreground", background);
  }
  for (const name of ["primary", "destructive", "success", "warning", "accent"]) add(`${name}-foreground`, `${name}-hover`);
  for (const background of ["background", "card", "muted", "primary-soft", "primary-soft-hover"]) add("primary", background);
  for (const name of ["success", "warning", "destructive"]) {
    for (const background of ["background", "card", "muted"]) add(`${name}-text`, background);
  }
  add("destructive-text", "destructive-soft"); add("destructive-text", "destructive-soft-hover");
  // Existing result captions use translucent text; composite sRGB before checking.
  for (const opacity of [0.8, 0.9]) add("success-text", "card", 4.5, opacity);
  for (const background of ["background", "card", "field-background", "dashboard-field-background", "public-hero", "dashboard-hero"]) {
    add("ring", background, 3);
    add("field-border-invalid", background, 3);
  }
  add("field-border", "field-background", 3);
  add("dashboard-field-border", "dashboard-field-background", 3);
  const results = pairs.map(({ fg, bg, minimum, opacity }) => {
    let front = linearRgb(tokens[fg], tokens);
    const back = linearRgb(tokens[bg], tokens);
    if (opacity !== 1) {
      const encode = (c) => c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
      const decode = (c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      front = front.map((c, i) => decode(encode(c) * opacity + encode(back[i]) * (1 - opacity)));
    }
    const contrast = ratio(luminance(front), luminance(back));
    const passed = contrast >= minimum;
    if (!passed) failures++;
    checks++;
    return `${passed ? "PASS" : "FAIL"} ${mode} ${fg}${opacity === 1 ? "" : `/${opacity * 100}`} / ${bg}: ${contrast.toFixed(2)}:1 (minimum ${minimum}:1)`;
  });
  console.log(results.join("\n"));
}
console.log(`\nBrand contrast: ${checks - failures}/${checks} checks passed.`);
if (failures) process.exitCode = 1;
