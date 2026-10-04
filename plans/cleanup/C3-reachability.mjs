import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Read-only conservative source audit. Run: node plans/cleanup/C3-reachability.mjs
// Output candidates require a separate whole-repository string/reference review.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (config.error) throw new Error("Could not read repository tsconfig");
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const excludedDirectories = new Set(["node_modules", ".git", ".next", ".tmp", "artifacts"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return excludedDirectories.has(entry.name) ? [] : walk(filename);
    }
    return /\.[cm]?[jt]sx?$/.test(filename) ? [filename] : [];
  });
}

const files = walk(root);
const graph = new Map();
const incoming = new Map();
for (const filename of files) {
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true);
  const dependencies = new Set();
  function visit(node) {
    // Resolve all literal strings, conservatively covering import/export/require,
    // dynamic import, vi.mock, jest.mock and script module-path arrays as well.
    if (ts.isStringLiteralLike(node)) {
      const resolved = ts.resolveModuleName(node.text, filename, options, ts.sys).resolvedModule?.resolvedFileName;
      if (resolved && !resolved.includes("/node_modules/")) {
        dependencies.add(resolved);
        if (!incoming.has(resolved)) incoming.set(resolved, new Set());
        incoming.get(resolved).add(filename);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  graph.set(filename, dependencies);
}

const frameworkNames = new Set([
  "page", "layout", "route", "loading", "error", "not-found", "default", "template", "global-error",
  "global-not-found", "opengraph-image", "twitter-image", "icon", "apple-icon", "sitemap", "robots", "manifest",
]);
function isRoot(filename) {
  const relative = path.relative(root, filename);
  if (!relative.startsWith("src/")) return true;
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(relative)) return true;
  if (/^src\/(proxy|middleware|instrumentation|instrumentation-client)\.[jt]sx?$/.test(relative)) return true;
  return relative.startsWith("src/app/") && frameworkNames.has(path.basename(filename).replace(/\.[^.]+$/, ""));
}
const reachable = new Set();
function visitFile(filename) {
  if (reachable.has(filename)) return;
  reachable.add(filename);
  for (const dependency of graph.get(filename) ?? []) visitFile(dependency);
}
files.filter(isRoot).forEach(visitFile);
const candidates = files.filter((filename) => filename.startsWith(path.join(root, "src") + path.sep)
  && !reachable.has(filename));
console.log(JSON.stringify(candidates.map((filename) => ({
  path: path.relative(root, filename),
  incoming: [...(incoming.get(filename) ?? [])].map((dependency) => path.relative(root, dependency)),
})), null, 2));
