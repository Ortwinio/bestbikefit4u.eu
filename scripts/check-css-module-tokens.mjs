#!/usr/bin/env node
// CSS Modules may only use design tokens (var(--...)), never raw colors, so
// every surface follows the brand palette, dark mode and the contrast lint.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("git ls-files --cached --others --exclude-standard '*.module.css'", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g;
let failures = 0;

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    const withoutVars = line.replace(/var\([^)]*\)/g, "");
    const hits = withoutVars.match(RAW_COLOR);
    if (hits) {
      failures += 1;
      console.log(`${file}:${index + 1}: raw color ${hits.join(", ")} — use a token (var(--...)) instead`);
    }
  });
}

console.log(`\nCSS module tokens: ${files.length} files checked, ${failures} raw color lines.`);
if (failures) process.exitCode = 1;
