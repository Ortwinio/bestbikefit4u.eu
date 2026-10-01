import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const extensions = /\.(?:[cm]?[jt]sx?|json)$/;
const normalize = (text) => String(text).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

/** Ownership follows task 40, including its reassignment of guides to A and PDF copy to B. */
export function ownerForSource(file, route = "") {
  const name = (file || route).toLowerCase();
  if (/\/bikes(?:\/|\b)|\/science(?:\/|\b)|i18n\/account\/bike|i18n\/marketing\/science/.test(name)) return "D";
  if (/\/ui\/|\/prototyper-ui\/|calculators?\/|tire.?pressure|bandenspanning|\/pressure-calculator/.test(name)) {
    return "C";
  }
  if (/\/guides?\/|\/marketing\/|\/layout\/|\/header|\/footer/.test(name)) return "A";
  if (/\(dashboard\)|\/account\/|\/dashboard|\/profile|\/fit(?:\/|$)|fit-history|\/reports?\/|pdf/.test(name)) {
    return "B";
  }
  if (/\/measurements\/|\/questionnaire\/|dashboardmessages|reporterrors|\/settings|\/feedback/.test(name)) return "B";
  if (/\/gearing|saddle-selector|shoe-cleat-fit|\/tools/.test(name)) return "B";
  // Shared legacy dictionaries do not establish ownership; use the consuming route in that case.
  return file && route ? ownerForSource("", route) : "A";
}

async function filesBelow(root, directory) {
  let entries;
  try { entries = await readdir(resolve(root, directory), { withFileTypes: true }); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const groups = await Promise.all(entries.map(async (entry) => {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return filesBelow(root, file);
    return extensions.test(file) && !/\.(?:test|spec)\./.test(file) ? [file] : [];
  }));
  return groups.flat();
}

function localeOf(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isVariableDeclaration(current) || ts.isPropertyAssignment(current)) {
      const name = current.name?.getText().replace(/["']/g, "");
      if (name === "nl" || name === "en") return name;
    }
  }
  return null;
}

/** Index actual syntax literals, JSX text, imports and route files; never manufacture a source line. */
export async function buildSourceIndex(root) {
  const files = (await Promise.all(["src", "tests/fixtures", "tests/visual"].map((dir) => filesBelow(root, dir))))
    .flat().sort();
  const entries = [];
  const defaultBindings = [];
  const imports = new Map();
  const known = new Set(files);
  for (const file of files) {
    const contents = await readFile(resolve(root, file), "utf8");
    const ast = ts.createSourceFile(file, contents, ts.ScriptTarget.Latest, true);
    const dependencies = [];
    if (file === "src/components/ui/Toast.tsx") {
      const viewportLine = contents.split("\n").findIndex((line) => line.includes("<BaseToast.Viewport"));
      if (viewportLine >= 0) {
        const dependencyFile = "node_modules/@base-ui/react/toast/viewport/ToastViewport.js";
        try {
          const library = await readFile(resolve(root, dependencyFile), "utf8");
          const defaultLine = library.split("\n").findIndex((line) =>
            /['"]aria-label['"]:\s*['"]Notifications/.test(line));
          if (defaultLine >= 0) defaultBindings.push({ value: "notifications", file, line: viewportLine + 1,
            dependencyFile, dependencyLine: defaultLine + 1 });
        } catch (error) { if (error.code !== "ENOENT") throw error; }
      }
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const specifier = node.moduleSpecifier?.text;
        if (specifier?.startsWith("@/") || specifier?.startsWith(".")) {
          const base = specifier.startsWith("@/") ? `src/${specifier.slice(2)}`
            : relative(root, resolve(root, dirname(file), specifier));
          const dependency = [base, ...[".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"]
            .map((suffix) => base + suffix)].find((candidate) => known.has(candidate));
          if (dependency) dependencies.push(dependency);
        }
      }
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)
        || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        const value = normalize(node.text);
        if (value.length >= 2 && !ts.isImportDeclaration(node.parent) && !ts.isExportDeclaration(node.parent)) {
          const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
          entries.push({ value, file, line, locale: localeOf(node) });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    imports.set(file, dependencies);
  }
  return { root, files, entries, imports, defaultBindings };
}

function routePath(file) {
  return file.replace(/^src\/app/, "").replace(/\/\([^/]+\)/g, "")
    .replace(/\/\[locale\]/g, "").replace(/\/page\.[jt]sx?$/, "") || "/";
}

function sourceForRoute(index, route, sourceFile) {
  if (sourceFile && index.files.includes(sourceFile)) return sourceFile;
  const path = String(route || "/").replace(/^https?:\/\/[^/]+/, "").replace(/^\/(nl|en)(?=\/|$)/, "") || "/";
  return index.files.find((file) => /\/page\.[jt]sx?$/.test(file) && routePath(file) === path)
    || index.files.find((file) => {
      if (!/\/page\.[jt]sx?$/.test(file)) return false;
      const pattern = routePath(file).split("/").map((part) => part.startsWith("[") ? "[^/]+"
        : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("/");
      return new RegExp(`^${pattern}$`).test(path);
    });
}

function dependencyClosure(index, file) {
  const seen = new Set();
  function visit(current) {
    if (!current || seen.has(current)) return;
    seen.add(current);
    for (const dependency of index.imports.get(current) || []) visit(dependency);
  }
  visit(file);
  return seen;
}

export function locateFinding(index, { text, route = "/", sourceFile, kind } = {}) {
  const needle = normalize(text || "");
  const routeFile = sourceForRoute(index, route, sourceFile);
  const related = dependencyClosure(index, routeFile);
  const defaultBinding = index.defaultBindings?.find((binding) => binding.value === needle);
  if (kind === "aria-label" && defaultBinding) {
    return { owner: "C", confidence: "dependency-default", needsConfirmation: false, kind,
      reason: `Library default verified at ${defaultBinding.dependencyFile}:${defaultBinding.dependencyLine}; `
        + "location is the application viewport that must override the label.",
      locations: [{ file: defaultBinding.file, line: defaultBinding.line, owner: "C",
        confidence: "dependency-default" }] };
  }
  const stepper = needle.match(/^(increase|decrease) (.+)$/);
  if (kind === "aria-label" && stepper) {
    const prefix = index.entries.find((entry) => entry.file === "src/components/prototyper-ui/ui/numberfield.tsx"
      && entry.value === stepper[1]);
    if (prefix) return { owner: "C", confidence: "generated-prefix", needsConfirmation: false, kind,
      reason: "Generated English stepper prefix; the supplied field label may need separate translation.",
      locations: [{ file: prefix.file, line: prefix.line, owner: "C", confidence: "generated-prefix" }],
      labelLocations: index.entries.filter((entry) => related.has(entry.file) && entry.value === stepper[2])
        .map(({ file, line }) => ({ file, line, owner: ownerForSource(file, route), confidence: "exact" })) };
  }
  const matches = [];
  for (const entry of index.entries) {
    const exact = entry.value === needle;
    // Whole phrases only: a short word inside a URL/email/class name is not source evidence.
    const substring = needle.length >= 12 && entry.value.length >= 12 && needle.includes(" ")
      && entry.value.includes(" ") && (entry.value.includes(needle) || needle.includes(entry.value));
    if (!needle || (!exact && !substring)) continue;
    let score = exact ? 100 : 30;
    if (related.has(entry.file)) score += 60;
    if (entry.file === routeFile) score += 20;
    if (entry.locale === "nl" || /\/nl\.ts$/.test(entry.file)) score += 35;
    if (entry.locale === "en" || /\/en\.ts$/.test(entry.file)) score -= 70;
    if (entry.file.startsWith("tests/")) score -= 15;
    matches.push({ ...entry, score, confidence: exact ? "exact" : "substring" });
  }
  matches.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file) || a.line - b.line);
  const best = matches[0];
  if (!best) {
    return {
      owner: ownerForSource(routeFile || "", route), confidence: "route-fallback", needsConfirmation: true,
      reason: "No literal match; route entry is a navigation aid, not the proven text origin.", kind,
      locations: routeFile ? [{ file: routeFile, line: 1, owner: ownerForSource(routeFile, route),
        confidence: "route-fallback" }] : [],
    };
  }
  const candidates = matches.filter((entry) => entry.score >= best.score - 15).slice(0, 5);
  return {
    owner: ownerForSource(best.file, route), confidence: best.confidence,
    needsConfirmation: candidates.length > 1 || best.confidence !== "exact" || best.locale === "en", kind,
    reason: best.locale === "en" ? "English literal candidate; verify locale selection at the call site."
      : "Matched source literal; candidates ranked by route imports and Dutch dictionary scope.",
    locations: candidates.map(({ file, line, confidence, locale }) => ({ file, line, confidence, locale,
      owner: ownerForSource(file, route) })),
  };
}
