#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { builtinModules } from "node:module";

const ROOT = process.cwd();
const CONVEX_DIR = path.join(ROOT, "convex");

const RUNTIME_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);

const BUILTIN_SPECIFIERS = new Set();
for (const name of builtinModules) {
  BUILTIN_SPECIFIERS.add(name);
  if (name.startsWith("node:")) {
    BUILTIN_SPECIFIERS.add(name.slice(5));
  } else {
    BUILTIN_SPECIFIERS.add(`node:${name}`);
  }
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function shouldIgnore(relativePath) {
  const normalized = toPosix(relativePath);
  return (
    normalized.includes("/_generated/") ||
    normalized.includes("/__tests__/") ||
    normalized.endsWith(".test.ts") ||
    normalized.endsWith(".test.tsx") ||
    normalized.endsWith(".spec.ts") ||
    normalized.endsWith(".spec.tsx")
  );
}

function hasUseNodeDirective(sourceText) {
  const lines = sourceText.split(/\r?\n/).slice(0, 30);
  let inBlockComment = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (inBlockComment) {
      if (line.includes("*/")) {
        inBlockComment = false;
      }
      continue;
    }

    if (line === "") {
      continue;
    }
    if (line.startsWith("/*")) {
      if (!line.includes("*/")) {
        inBlockComment = true;
      }
      continue;
    }
    if (line.startsWith("//")) {
      continue;
    }

    return line === '"use node";' || line === "'use node';" || line === '"use node"' || line === "'use node'";
  }

  return false;
}

function lineNumberFromIndex(sourceText, index) {
  return sourceText.slice(0, index).split(/\r?\n/).length;
}

function isNodeBuiltinSpecifier(specifier) {
  if (BUILTIN_SPECIFIERS.has(specifier)) {
    return true;
  }

  if (specifier.startsWith("@")) {
    return false;
  }

  const withoutPrefix = specifier.startsWith("node:") ? specifier.slice(5) : specifier;
  const base = withoutPrefix.split("/")[0];

  return BUILTIN_SPECIFIERS.has(base) || BUILTIN_SPECIFIERS.has(`node:${base}`);
}

function findBuiltinImports(sourceText) {
  const matches = [];
  const patterns = [
    /import\s+(?:[^\"']*?\s+from\s+)?[\"']([^\"']+)[\"']/g,
    /require\(\s*[\"']([^\"']+)[\"']\s*\)/g,
    /import\(\s*[\"']([^\"']+)[\"']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of sourceText.matchAll(pattern)) {
      const specifier = match[1];
      if (!isNodeBuiltinSpecifier(specifier)) {
        continue;
      }
      matches.push({
        specifier,
        line: lineNumberFromIndex(sourceText, match.index ?? 0),
      });
    }
  }

  const deduped = new Map();
  for (const item of matches) {
    deduped.set(`${item.specifier}:${item.line}`, item);
  }

  return [...deduped.values()].sort((a, b) => a.line - b.line);
}

function walkFiles(startDir) {
  const results = [];
  const stack = [startDir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      const relativePath = path.relative(ROOT, absolutePath);

      if (entry.isDirectory()) {
        if (shouldIgnore(relativePath)) {
          continue;
        }
        stack.push(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (shouldIgnore(relativePath)) {
        continue;
      }

      const extension = path.extname(entry.name);
      if (!RUNTIME_EXTENSIONS.has(extension)) {
        continue;
      }

      results.push(absolutePath);
    }
  }

  return results;
}

if (!fs.existsSync(CONVEX_DIR)) {
  console.log("[runtime-boundaries] convex directory not found; skipping.");
  process.exit(0);
}

const violations = [];
for (const absolutePath of walkFiles(CONVEX_DIR)) {
  const sourceText = fs.readFileSync(absolutePath, "utf8");
  if (hasUseNodeDirective(sourceText)) {
    continue;
  }

  const builtinImports = findBuiltinImports(sourceText);
  if (builtinImports.length === 0) {
    continue;
  }

  violations.push({
    file: path.relative(ROOT, absolutePath),
    imports: builtinImports,
  });
}

if (violations.length > 0) {
  console.error("[runtime-boundaries] Node builtins are not allowed in Convex files without \"use node\".");
  for (const violation of violations) {
    for (const imported of violation.imports) {
      console.error(`  - ${toPosix(violation.file)}:${imported.line} imports \"${imported.specifier}\"`);
    }
  }
  console.error("[runtime-boundaries] Fix by moving Node-dependent logic to a file with \"use node\" or using runtime-safe APIs.");
  process.exit(1);
}

console.log("[runtime-boundaries] OK: no disallowed Node builtin imports found in Convex non-Node files.");
