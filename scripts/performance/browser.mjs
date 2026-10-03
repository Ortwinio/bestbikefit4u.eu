import { readdir, access } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { chromium } from "playwright";

// Lighthouse 12.6.1 collected successfully with Chromium 140; the available 145 produced NO_FCP.
// Discover the validated browser without embedding a developer's home directory or cache revision.
export async function findPerformanceBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH ?? (process.platform === "darwin"
    ? join(homedir(), "Library/Caches/ms-playwright") : join(homedir(), ".cache/ms-playwright"));
  const candidates = [chromium.executablePath()];
  for (const directory of await readdir(cache).catch(() => [])) {
    if (!/^chromium-\d+$/.test(directory)) continue;
    for (const suffix of ["chrome-mac/Chromium.app/Contents/MacOS/Chromium",
      "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing", "chrome-linux/chrome"]) {
      candidates.push(join(cache, directory, suffix));
    }
  }
  for (const candidate of [...new Set(candidates)]) {
    try {
      await access(candidate);
      const { stdout } = await promisify(execFile)(candidate, ["--version"]);
      if (/\b140\./.test(stdout)) return candidate;
    } catch { /* A missing cache candidate is expected across operating systems. */ }
  }
  throw new Error("No validated Chromium 140 found. Set CHROME_PATH to a Lighthouse-compatible browser; use the same binary before/after.");
}
